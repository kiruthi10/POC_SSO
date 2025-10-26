import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const isDev = process.env.NODE_ENV !== "production";

// CORS for dev: allow parent origin
if (isDev) {
  app.use(
    cors({
      origin: [
        "http://localhost:3000", // parent app
        "http://localhost:3002"  // optional for other ports
      ],
      credentials: true,
    })
  );
}

app.use(cookieParser());
app.use(express.json());

// API to check SSO
app.get("/api/userinfo", (req: Request, res: Response) => {
  const token = req.cookies?.["ssoToken"];
  if (token) return res.json({ name: "SSO User", token });

  // Dev mode: allow devToken
  if (isDev && req.query.devToken === "valid") {
    return res.json({ name: "Dev SSO User" });
  }

  res.status(401).json({ error: "Not authenticated" });
});

const PORT = process.env.BACKEND_PORT || 4002;
app.listen(PORT, () => console.log(`Child backend running on port ${PORT}`));
