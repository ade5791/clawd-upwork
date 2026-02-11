import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

// Basic proposal generator (template-based; LLM hook later)
export async function proposalRoutes(app: FastifyInstance) {
  app.post("/proposals/generate", { preHandler: [app.authenticate] }, async (req) => {
    const body = z
      .object({
        jobId: z.string().uuid(),
        profileName: z.string().min(2),
        highlights: z.array(z.string()).optional()
      })
      .parse(req.body);

    const job = await prisma.job.findUnique({ where: { id: body.jobId } });
    if (!job) return app.httpErrors.notFound("Job not found");

    const proposal = [
      `Hi, I’m ${body.profileName}.`,
      `I reviewed your posting: ${job.query}.`,
      body.highlights?.length
        ? `Here’s why I’m a fit: ${body.highlights.join("; ")}.`
        : "I can deliver quickly with clear communication.",
      "If you want, I can start immediately and share a short plan within 24 hours."
    ].join(" ");

    await prisma.job.update({
      where: { id: body.jobId },
      data: { output: { proposal } }
    });

    return { proposal };
  });
}
