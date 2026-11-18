export default async function handler(req: any, res: any) {
  try {
    const fb = await import('../src/lib/firebaseAdmin.ts');
    res.status(200).json({ ok: true, isConfigured: fb.isFirestoreConfigured });
  } catch (err: any) {
    res.status(200).json({
      error: err?.message,
      stack: err?.stack
    });
  }
}
