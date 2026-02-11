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

    const input = job.input ? safeJson(job.input) : null;
    const description = input?.description || input?.details || "";
    const skills = Array.isArray(input?.skills) ? input.skills : [];
    const budget = input?.budget ? `$${input.budget}` : "";

    const profileSummary =
      "I’m a full‑stack engineer, founder, and systems architect with 14+ years of experience building production‑grade platforms. Recent work includes an autonomous AI agent platform (18+ tool ecosystem), an AI career management SaaS shipped in days, and a full NEMT + rideshare operations platform with real‑time analytics and dispatching.";

    const bullets = [
      "Automation & web scraping pipelines (Playwright/Browser automation, data pipelines)",
      "Scalable web platforms (TypeScript/React/Node/Firebase)",
      "Clear communication, fast turnaround, and clean documentation"
    ];

    const proposal = [
      `Hi, I’m ${body.profileName}.`,
      `I reviewed your job: ${job.query}${budget ? ` (budget ${budget})` : ""}.`,
      description ? `Key needs I see: ${truncate(description, 220)}` : "",
      `${profileSummary}`,
      `Relevant strengths: ${bullets.join("; ")}.`,
      skills.length ? `Skills match: ${skills.join(", ")}.` : "",
      "Plan: clarify requirements → deliver a working first version → iterate quickly with your feedback.",
      "If you want, I can start immediately and send a short plan within 24 hours."
    ]
      .filter(Boolean)
      .join(" ");

    const autoApprove = (process.env.AUTO_APPROVE || "true").toLowerCase() === "true";

    await prisma.job.update({
      where: { id: body.jobId },
      data: { output: JSON.stringify({ proposal }), proposalStatus: autoApprove ? "approved" : "draft" }
    });

    return { proposal, status: autoApprove ? "approved" : "draft" };
  });
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "...";
}

