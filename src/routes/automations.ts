import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

export async function automationRoutes(app: FastifyInstance) {
  app.get("/automations", { preHandler: [app.authenticate] }, async (req) => {
    const userId = req.user.sub;
    const automations = await prisma.automation.findMany({ where: { userId } });
    return { automations };
  });

  app.post("/automations", { preHandler: [app.authenticate] }, async (req) => {
    const body = z
      .object({
        type: z.string().min(2),
        query: z.string().min(2),
        frequencyMinutes: z.number().int().min(5).default(60)
      })
      .parse(req.body);
    const userId = req.user.sub;
    const automation = await prisma.automation.create({
      data: { ...body, userId }
    });
    return { automation };
  });

  app.patch("/automations/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z
      .object({
        active: z.boolean().optional(),
        frequencyMinutes: z.number().int().min(5).optional()
      })
      .parse(req.body);
    const automation = await prisma.automation.findUnique({ where: { id: params.id } });
    if (!automation) return reply.notFound("Automation not found");
    const updated = await prisma.automation.update({ where: { id: params.id }, data: body });
    return { automation: updated };
  });
}
