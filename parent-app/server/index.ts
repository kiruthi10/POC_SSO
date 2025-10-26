import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as SamlStrategy, SamlConfig } from "passport-saml";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ---------- Middleware ----------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
    ],
    credentials: true,
  })
);

const isProd = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      secure: isProd,        // true only in production (HTTPS)
      sameSite: isProd ? "none" : "lax", // "none" needs secure
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ---------- Passport SAML ----------
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

const samlConfig: SamlConfig = {
  entryPoint: process.env.AZURE_AD_SSO_URL!,
  issuer: process.env.SAML_ISSUER!,
  callbackUrl: process.env.SAML_CALLBACK!,
  cert: process.env.AZURE_AD_CERT!,
  validateInResponseTo: false, // for local testing
  disableRequestedAuthnContext: true, // for Azure default
};

passport.use(
  new SamlStrategy(samlConfig, (profile: any, done: (err: any, user?: any) => void) => {
    return done(null, profile);
  })
);

// ---------- Routes ----------

// Trigger SAML login
app.get(
  "/login",
  passport.authenticate("saml", { failureRedirect: "/error" }),
  (_req, res) => res.redirect("/")
);

// SAML callback from Azure
app.post(
  "/login/callback",
  passport.authenticate("saml", { failureRedirect: "/error" }),
  (req, res) => {
    res.cookie("ssoToken", "valid", { httpOnly: true, sameSite: "none", secure: true });
    res.redirect(`${process.env.CHILD_URL}/sso/success`);
  }
);

// Get user info
app.get("/api/userinfo", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Session check for children
app.get("/session-check", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ status: "ok" });
  } else {
    res.status(401).json({ status: "expired" });
  }
});

// Default route
app.get("/", (_req, res) => res.send("Parent App Running with Azure SSO"));

app.listen(process.env.PORT, () => {
  console.log(`✅ Parent backend running on port ${process.env.PORT}`);
});
