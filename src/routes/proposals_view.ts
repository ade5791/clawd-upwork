import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

export async function proposalsViewRoutes(app: FastifyInstance) {
  // List proposals (jobs with output.proposal)
  app.get("/proposals", { preHandler: [app.authenticate] }, async (req) => {
    const userId = req.user.sub;
    const jobs = await prisma.job.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    const proposals = jobs
      .map((j) => {
        const output = j.output ? safeJson(j.output) : null;
        return output?.proposal
          ? { id: j.id, query: j.query, proposal: output.proposal, status: j.proposalStatus, url: j.url }
          : null;
      })
      .filter(Boolean);
    return { proposals };
  });

  // Approve proposal for auto-submit
  app.post("/proposals/:id/approve", { preHandler: [app.authenticate] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) return reply.notFound("Proposal not found");
    const updated = await prisma.job.update({ where: { id: params.id }, data: { proposalStatus: "approved" } });
    return { proposal: { id: updated.id, status: updated.proposalStatus } };
  });

  app.post("/proposals/:id/mark-submitted", { preHandler: [app.authenticate] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) return reply.notFound("Proposal not found");
    const updated = await prisma.job.update({ where: { id: params.id }, data: { proposalStatus: "submitted" } });
    return { proposal: { id: updated.id, status: updated.proposalStatus } };
  });
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
