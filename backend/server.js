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

const createPlaceholderSvg = () =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#1e293b"/>
  <g transform="translate(176, 105)" stroke="#64748b" stroke-width="2" fill="none">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </g>
  <text x="200" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#94a3b8" text-anchor="middle">Mine Inspection Photo</text>
  <text x="200" y="198" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">DGMS Statutory Record</text>
</svg>`.trim()
  );
const placeholderSvgBuffer = createPlaceholderSvg();

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
      const sampleImages = [
        "1788340588676-416601542.jpg",
        "1790759559734-520713943.jpg",
        "1788341749069-728584993.jpg",
        "1790759559740-286695004.png",
      ];
      for (const sample of sampleImages) {
        const fullPath = path.resolve(uploadsDir, sample);
        if (fs.existsSync(fullPath)) {
          res.setHeader("Cache-Control", "public, max-age=3600");
          return res.sendFile(fullPath);
        }
      }
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.status(200).send(placeholderSvgBuffer);
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
