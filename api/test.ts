export default async function handler(req: any, res: any) {
  try {
    const serverModule = await import('../server');
    res.status(200).json({
      ok: true,
      hasDefault: Boolean(serverModule.default),
      hasApp: Boolean(serverModule.app)
    });
  } catch (err: any) {
    res.status(200).json({
      importedError: true,
      message: err?.message,
      stack: err?.stack,
      name: err?.name
    });
  }
}
