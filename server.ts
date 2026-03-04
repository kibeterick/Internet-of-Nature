import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  // Shared state
  let activeUsers = 0;
  const contributions: any[] = [
    { id: 1, user: "Elena M.", location: "Amazon Basin, Brazil", action: "Identified rare orchid species", time: "12m ago", icon: "Leaf" },
    { id: 2, user: "Kofi A.", location: "Nairobi, Kenya", action: "Deployed 5 new soil sensors", time: "45m ago", icon: "Zap" },
    { id: 3, user: "Yuki T.", location: "Kyoto, Japan", action: "Reported early cherry blossom bloom", time: "2h ago", icon: "Sparkles" },
    { id: 4, user: "Sarah J.", location: "London, UK", action: "Completed urban canopy survey", time: "5h ago", icon: "Database" },
  ];

  // WebSocket handling
  wss.on("connection", (ws) => {
    activeUsers++;
    broadcast({ type: "PRESENCE_UPDATE", count: activeUsers });
    
    // Send initial state
    ws.send(JSON.stringify({ type: "INIT", contributions }));

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "NEW_CONTRIBUTION") {
          const newContribution = {
            id: Date.now(),
            ...message.payload,
            time: "Just now"
          };
          contributions.unshift(newContribution);
          if (contributions.length > 20) contributions.pop();
          broadcast({ type: "CONTRIBUTION_ADDED", payload: newContribution });
        }
      } catch (e) {
        console.error("WS Error:", e);
      }
    });

    ws.on("close", () => {
      activeUsers--;
      broadcast({ type: "PRESENCE_UPDATE", count: activeUsers });
    });
  });

  function broadcast(data: any) {
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", users: activeUsers });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
