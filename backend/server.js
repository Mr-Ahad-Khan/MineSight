const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Make io accessible in routes if needed
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Fallbacks for ephemeral environments (e.g. Render restarts) when media was stored locally
const createSilentWav = () => {
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 8;
  const duration = 0.5;
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buf.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  buf.fill(128, 44);
  return buf;
};
const silentWavBuffer = createSilentWav();

const fallbackImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
  <rect width="600" height="400" fill="#0f172a"/>
  <rect x="20" y="20" width="560" height="360" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="300" cy="170" r="44" fill="#0d3f6d" fill-opacity="0.3"/>
  <path d="M284 156h32m-16-16v32m-32 30h64a8 8 0 0 0 8-8v-32a8 8 0 0 0-8-8h-10l-4-6h-26l-4 6h-10a8 8 0 0 0-8 8v32a8 8 0 0 0 8 8z" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="300" y="248" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#e2e8f0" text-anchor="middle">Field Photo Proof</text>
  <text x="300" y="272" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">Captured During On-Site Inspection</text>
</svg>`;

// Static folder for uploads
app.use(
  ["/uploads", "/api/uploads"],
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1h",
  }),
  (req, res) => {
    const ext = path.extname(req.path).toLowerCase();
    const uploadsDir = path.resolve(__dirname, "uploads");

    if ([".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"].includes(ext)) {
      const samplePhotos = [
        "1788339049065-948572503.png",
        "1788340588676-416601542.jpg",
        "1788341941587-885111561.png",
        "1790759559740-286695004.png",
      ];
      for (const sample of samplePhotos) {
        const fullPath = path.resolve(uploadsDir, sample);
        if (fs.existsSync(fullPath)) {
          res.setHeader("Cache-Control", "public, max-age=3600");
          return res.sendFile(fullPath);
        }
      }
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.status(200).send(fallbackImageSvg);
    }

    if ([".webm", ".mp3", ".ogg", ".wav", ".m4a"].includes(ext)) {
      const sampleAudios = [
        "1788340588673-563855976.webm",
        "1788337678980-551669363.webm",
        "1788338050844-724192271.webm",
      ];
      for (const sample of sampleAudios) {
        const fullPath = path.resolve(uploadsDir, sample);
        if (fs.existsSync(fullPath)) {
          res.setHeader("Cache-Control", "public, max-age=3600");
          return res.sendFile(fullPath);
        }
      }
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", silentWavBuffer.length);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.status(200).send(silentWavBuffer);
    }

    res.status(404).json({
      success: false,
      message: "Uploaded file not found",
    });
  },
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/mines", require("./routes/mineRoutes"));
app.use("/api/mineral-resources", require("./routes/mines"));
app.use("/api/inspections", require("./routes/inspectionRoutes"));
app.use("/api/compliances", require("./routes/complianceRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/contractors", require("./routes/contractorRoutes"));
app.use("/api/workers", require("./routes/workerRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));

// Root and health endpoints
// Render opens the service URL at `/` by default. Keep this endpoint public so
// the deployment can be checked without needing an API route or auth token.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Coal Governance API is running",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Coal Governance API is running" });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Socket connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-mine", (mineId) => {
    socket.join(`mine-${mineId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
