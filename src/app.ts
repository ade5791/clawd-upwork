import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import healthcheck from "@fastify/healthcheck";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import env from "@fastify/env";
import { z } from "zod";
import jwtPlugin from "./plugins/jwt.js";
import { authRoutes } from "./routes/auth.js";
import { toolRoutes } from "./routes/tools.js";
import { jobRoutes } from "./routes/jobs.js";
import { ingestRoutes } from "./routes/ingest.js";
import { proposalRoutes } from "./routes/proposals.js";
import { automationRoutes } from "./routes/automations.js";

const schema = {
  type: "object",
  required: ["PORT", "JWT_SECRET"],
  properties: {
    PORT: { type: "string", default: "3000" },
    JWT_SECRET: { type: "string" },
    REDIS_URL: { type: "string", default: "redis://localhost:6379" },
    DATABASE_URL: { type: "string", default: "postgres://postgres:postgres@localhost:5432/upwork" }
  }
} as const;

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(env, { schema, dotenv: true });
  await app.register(cors, { origin: true });
  await app.register(sensible);
  await app.register(healthcheck, { exposeUptime: true });
  await app.register(jwtPlugin);

  await app.register(swagger, {
    swagger: {
      info: { title: "Upwork Tools API", version: "0.1.0" }
    }
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.get("/", async () => ({ ok: true }));

  await app.register(authRoutes);
  await app.register(toolRoutes);
  await app.register(jobRoutes);
  await app.register(ingestRoutes);
  await app.register(proposalRoutes);
  await app.register(automationRoutes);

  return app;
}
