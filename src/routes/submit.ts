import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

// Endpoint to mark submission intent; actual browser submit handled by OpenClaw session
export async function submitRoutes(app: FastifyInstance) {
  app.post("/proposals/:id/submit", { preHandler: [app.authenticate] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) return reply.notFound("Proposal not found");

    // For now mark approved as submitted; browser automation will be triggered in main session
    const updated = await prisma.job.update({ where: { id: params.id }, data: { proposalStatus: "submitted" } });
    return { proposal: { id: updated.id, status: updated.proposalStatus, url: updated.url } };
  });
}
