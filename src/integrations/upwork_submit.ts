// Stub for auto-submit via built-in browser session.
// Actual submission will be performed via OpenClaw browser tool in main process.
export async function submitProposalToUpwork(jobUrl: string, proposal: string) {
  return { ok: true, jobUrl, note: "Submit via browser automation" };
}
