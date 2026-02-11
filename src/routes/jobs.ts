import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import { jobQueue } from "../queue.js";

export async function jobRoutes(app: FastifyInstance) {
  app.post("/jobs/search", { preHandler: [app.authenticate] }, async (req) => {
    const body = z.object({ query: z.string().min(2) }).parse(req.body);
    const userId = req.user.sub;
    const job = await prisma.job.create({
      data: { query: body.query, status: "queued", userId, input: JSON.stringify({ query: body.query }) }
    });
    await jobQueue.add("search", { jobId: job.id, query: body.query });
    return { job };
  });

  app.get("/jobs", { preHandler: [app.authenticate] }, async (req) => {
    const userId = req.user.sub;
    const jobs = await prisma.job.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return { jobs };
  });

  app.get("/jobs/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) return reply.notFound("Job not found");
    return { job };
  });
}
