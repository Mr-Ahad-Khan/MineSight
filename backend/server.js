const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
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

// Static folder for uploads
app.use(
  ["/uploads", "/api/uploads"],
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads")),
  (req, res) => {
    const ext = path.extname(req.path).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.status(200).send(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1e293b"/><circle cx="200" cy="130" r="35" fill="#334155"/><path d="M185 130a15 15 0 1 0 30 0 15 15 0 0 0-30 0z" fill="#94a3b8"/><text x="200" y="200" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#94a3b8" text-anchor="middle">Field Photo Proof</text></svg>',
      );
    }
    if ([".webm", ".mp3", ".ogg", ".wav"].includes(ext)) {
      return res.status(204).end();
    }
    res.status(404);
    res.type(ext || "bin");
    res.end();
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
