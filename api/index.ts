import { app } from '../server';

export default function handler(req: any, res: any) {
  // Normalize incoming URL so /auth/google maps to /api/auth/google
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/_')) {
    req.url = '/api' + req.url;
  }

  // Keep serverless function alive until Express finishes sending response
  return new Promise((resolve, reject) => {
    res.on('finish', () => resolve(undefined));
    res.on('close', () => resolve(undefined));
    res.on('error', (err: any) => reject(err));

    app(req, res);
  });
}

