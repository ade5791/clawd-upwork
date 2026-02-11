import { prisma } from "./db.js";
import { jobQueue } from "./queue.js";

async function tick() {
  const now = new Date();
  const automations = await prisma.automation.findMany({ where: { active: true } });

  for (const a of automations) {
    const last = a.lastRunAt ? new Date(a.lastRunAt) : null;
    const due = !last || (now.getTime() - last.getTime()) / 60000 >= a.frequencyMinutes;
    if (!due) continue;

    if (a.type === "search") {
      const job = await prisma.job.create({
        data: { query: a.query, status: "queued", userId: a.userId, input: JSON.stringify({ query: a.query, filters: a.filters }) }
      });
      await jobQueue.add("search", { jobId: job.id, query: a.query, filters: a.filters });
    }

    await prisma.automation.update({ where: { id: a.id }, data: { lastRunAt: now } });
  }
}

setInterval(() => {
  tick().catch((err) => console.error(err));
}, 60_000);

console.log("Scheduler started (polling every 60s)");
