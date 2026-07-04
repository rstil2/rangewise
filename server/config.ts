export const config = {
  port: Number(process.env.PORT ?? 3001),
  launchDate: new Date(process.env.LAUNCH_DATE ?? "2026-07-04T12:00:00Z"),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  appUrl: process.env.APP_URL ?? "https://rangewise.app",
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
};
