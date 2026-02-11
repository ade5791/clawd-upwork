import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (req, reply) => {
    const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return reply.badRequest("User exists");
    const user = await prisma.user.create({ data: { email: body.email, password: body.password } });
    return { ok: true, id: user.id };
  });

  app.post("/auth/login", async (req, reply) => {
    const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || user.password !== body.password) return reply.unauthorized("Invalid credentials");
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return { token };
  });

  app.get("/auth/me", { preHandler: [app.authenticate] }, async (req) => {
    return { user: req.user };
  });
}
