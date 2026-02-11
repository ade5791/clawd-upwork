import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

// Minimal ingestion endpoint to store job listings pulled externally
export async function ingestRoutes(app: FastifyInstance) {
  app.post("/ingest/jobs", { preHandler: [app.authenticate] }, async (req) => {
    const body = z
      .object({
        source: z.string().min(2),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string().optional(),
              url: z.string().url().optional(),
              budget: z.number().optional(),
              skills: z.array(z.string()).optional()
            })
          )
          .min(1)
      })
      .parse(req.body);

    // Store in Job table as “ingested” items (temporary design)
    const created = await Promise.all(
      body.items.map((item) =>
        prisma.job.create({
          data: {
            query: item.title,
            status: "ingested",
            input: { source: body.source, ...item },
            userId: req.user.sub
          }
        })
      )
    );

    return { ok: true, count: created.length };
  });
}
