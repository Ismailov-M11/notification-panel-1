import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "1234",
};

interface LoginData {
  pharmacy_id: string;
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Admin login endpoint
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      res.json({
        authenticated: true,
        token: "admin-token-" + Date.now(),
      });
    } else {
      res.status(401).json({
        authenticated: false,
        error: "Invalid credentials",
      });
    }
  });

  // Notify endpoint
  app.post("/api/notify", (req, res) => {
    const { pharmacy_id, drugs, total } = req.body;

    if (!pharmacy_id || !drugs || !total) {
      return res.status(400).json({
        error: "Missing required fields: pharmacy_id, drugs, total",
      });
    }

    // Emit incoming_call to the specific pharmacy
    const io = (app as any).__io as SocketIOServer;
    if (io) {
      io.to(pharmacy_id).emit("incoming_call", {
        drugs: Array.isArray(drugs) ? drugs : drugs.split("\n"),
        total,
        pharmacy_id,
      });
      res.json({
        success: true,
        message: "Notification sent to pharmacy",
      });
    } else {
      res.status(500).json({
        error: "Socket.io not initialized",
      });
    }
  });

  return app;
}

export function setupSocketIO(app: express.Application) {
  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  (app as any).__io = io;

  // Track connected pharmacies
  const pharmacyConnections = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Handle pharmacy login
    socket.on("pharmacy_login", (data: LoginData) => {
      const pharmacy_id = data.pharmacy_id;
      socket.join(pharmacy_id);
      pharmacyConnections.set(socket.id, pharmacy_id);
      console.log(`Pharmacy ${pharmacy_id} connected with socket ${socket.id}`);
      socket.emit("login_success", { pharmacy_id });
    });

    // Handle response from pharmacy
    socket.on("response", (data) => {
      console.log("Pharmacy response:", data);
      // Could be logged or sent to admin in real scenario
    });

    socket.on("disconnect", () => {
      const pharmacy_id = pharmacyConnections.get(socket.id);
      if (pharmacy_id) {
        console.log(`Pharmacy ${pharmacy_id} disconnected`);
        pharmacyConnections.delete(socket.id);
      }
    });
  });

  return httpServer;
}
