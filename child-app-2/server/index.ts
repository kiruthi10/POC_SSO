// import express, { Request, Response } from 'express';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();

// app.use(cors({
//   origin: ['http://localhost:3000'],
//   credentials: true
// }));

// app.use(cookieParser());

// app.get('/api/userinfo', (req: Request, res: Response) => {
//   // TypeScript now knows req.cookies exists because of @types/cookie-parser
//   const token = req.cookies?.['ssoToken'];
//   if (token) {
//     res.json({ name: 'SSO User', token });
//   } else {
//     res.status(401).json({ error: 'Not authenticated' });
//   }
// });

// const PORT = process.env.BACKEND_PORT || 4002; // <- change from 3002 to 4002
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

// CORS setup for development only
if (isDev) {
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002'], // parent & child frontend
    credentials: true
  }));
}

app.use(cookieParser());
app.use(express.json());

// Simulate SSO check
app.get('/api/userinfo', (req: Request, res: Response) => {
  const token = req.cookies?.['ssoToken'];
  if (token) {
    res.json({ name: 'SSO User', token });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Serve React in production
if (!isDev) {
  const buildPath = path.join(__dirname, '../build');
  app.use(express.static(buildPath));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = process.env.BACKEND_PORT || 4002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
