import axios from "axios";
import { scrapeUpwork } from "../integrations/upwork.js";

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const JWT = process.env.JWT;

if (!JWT) {
  console.error("Missing JWT env var");
  process.exit(1);
}

const search = process.env.SEARCH || "automation data extraction web scraping";

(async () => {
  const items = await scrapeUpwork(search, { paymentVerified: true });
  const res = await axios.post(
    `${API_BASE}/ingest/jobs`,
    { source: "upwork", items },
    { headers: { Authorization: `Bearer ${JWT}` } }
  );
  console.log("Ingested:", res.data);
})();
