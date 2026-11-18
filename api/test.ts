import app from '../server.ts';

export default function handler(req: any, res: any) {
  res.status(200).json({
    ok: true,
    hasApp: Boolean(app),
    routesCount: app?._router?.stack?.length || 0
  });
}
