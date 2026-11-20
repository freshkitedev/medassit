import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createApp } from './app.js';

async function main() {
  await connectDatabase();
  // Non-sensitive deployment diagnostics (helps spot cookie/proxy misconfiguration).
  console.log(
    `Config: env=${env.NODE_ENV} trustProxy=${env.trustProxy} cookie(sameSite=${env.COOKIE_SAMESITE}, secure=${env.isProd || env.COOKIE_SAMESITE === 'none'}) frontendOrigin=${new URL(env.FRONTEND_URL).origin}`
  );
  const app = createApp();
  const server = app.listen(env.PORT, () => console.log(`MediScan API listening on port ${env.PORT}`));

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error(`Startup failed: ${err?.name ?? 'Error'}`);
  process.exit(1);
});
