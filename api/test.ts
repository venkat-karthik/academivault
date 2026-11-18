export default async function handler(req: any, res: any) {
  try {
    const repo = await import('../src/lib/firestoreRepository.ts');
    res.status(200).json({ ok: true, hasRepo: Boolean(repo.repository) });
  } catch (err: any) {
    res.status(200).json({
      error: err?.message,
      stack: err?.stack
    });
  }
}
