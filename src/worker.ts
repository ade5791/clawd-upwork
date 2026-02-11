import { Worker } from "bullmq";
import { connection } from "./queue.js";
import { prisma } from "./db.js";

const worker = new Worker(
  "jobQueue",
  async (job) => {
    const { jobId, query, filters } = job.data as { jobId: string; query: string; filters?: any };
    // TODO: integrate real Upwork search + proposal generation.
    const output = { results: [], note: `Processed query: ${query}`, filters };
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "done", output }
    });
    return output;
  },
  { connection }
);

worker.on("failed", async (job, err) => {
  if (!job) return;
  await prisma.job.update({
    where: { id: job.data.jobId },
    data: { status: "failed", error: err.message }
  });
});

console.log("Worker started");
