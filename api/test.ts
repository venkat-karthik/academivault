export default async function handler(req: any, res: any) {
  try {
    const adminApp = await import('firebase-admin/app');
    res.status(200).json({ ok: true, adminApp: Boolean(adminApp) });
  } catch (err: any) {
    res.status(200).json({
      error: err?.message,
      stack: err?.stack
    });
  }
}
