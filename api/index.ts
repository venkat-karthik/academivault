import { app } from '../server';

export default function handler(req: any, res: any) {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/_')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
