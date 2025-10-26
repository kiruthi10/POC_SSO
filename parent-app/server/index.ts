import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as SamlStrategy, SamlConfig } from "passport-saml";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const isDev = process.env.NODE_ENV !== "production";

// ---------- Middleware ----------
app.use(
  cors({
    origin: isDev
      ? [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002",
          "http://localhost:3003",
        ]
      : [process.env.PARENT_FRONTEND_URL!],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      secure: !isDev, // true only in production (HTTPS)
      sameSite: isDev ? "lax" : "none", // cross-site cookie in production
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
  validateInResponseTo: false, // local dev friendly
  disableRequestedAuthnContext: true,
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

    // Set SSO token cookie
    res.cookie("ssoToken", "valid", {
      httpOnly: true,
      sameSite: isDev ? "lax" : "none",
      secure: !isDev,
    });

    // For dev only: also set localStorage via query param for iframe testing
    const devToken = isDev ? "?devToken=valid" : "";
    res.redirect(`${process.env.CHILD_URL}/sso/success${devToken}`);
  }
);

// User info API
app.get("/api/userinfo", (req, res) => {
  if (req.isAuthenticated() || isDev) {
    res.json({ name: req.user || "SSO User" });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

app.get("/", (_req, res) => res.send("Parent App Running with Azure SSO"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Parent backend running on port ${PORT}`));
