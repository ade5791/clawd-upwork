import { buildApp } from "./app.js";

const app = await buildApp();
const port = Number(process.env.PORT || 3000);

try {
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`server listening on ${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
