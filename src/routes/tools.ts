import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

export async function toolRoutes(app: FastifyInstance) {
  app.get("/tools", { preHandler: [app.authenticate] }, async (req) => {
    const userId = req.user.sub;
    const tools = await prisma.tool.findMany({ where: { userId } });
    return { tools };
  });

  app.post("/tools", { preHandler: [app.authenticate] }, async (req) => {
    const body = z.object({ name: z.string().min(2), status: z.enum(["active", "inactive"]).default("active") }).parse(req.body);
    const userId = req.user.sub;
    const tool = await prisma.tool.create({ data: { name: body.name, status: body.status, userId } });
    return { tool };
  });

  app.patch("/tools/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z.object({ name: z.string().min(2).optional(), status: z.enum(["active", "inactive"]).optional() }).parse(req.body);
    const tool = await prisma.tool.findUnique({ where: { id: params.id } });
    if (!tool) return reply.notFound("Tool not found");
    const updated = await prisma.tool.update({ where: { id: params.id }, data: body });
    return { tool: updated };
  });
}
