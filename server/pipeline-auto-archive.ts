import { shouldAutoArchiveApplication } from "@shared/pipeline-stages";
import type { JobApplication } from "@shared/schema";
import type { IStorage } from "./storage";

const AUTO_ARCHIVE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export async function processPipelineAutoArchive(
  storage: IStorage,
  applications?: JobApplication[],
): Promise<number> {
  const source =
    applications ?? (await storage.getAllJobApplications().catch(() => [] as JobApplication[]));

  let archived = 0;
  for (const app of source) {
    if (!shouldAutoArchiveApplication(app)) continue;
    const updated = await storage.updateJobApplicationStatus(
      app.id,
      "Archived",
      undefined,
      app.statusNote ?? undefined,
    );
    if (updated) archived += 1;
  }
  return archived;
}

export function startPipelineAutoArchiveScheduler(storage: IStorage): void {
  const tick = () => {
    void processPipelineAutoArchive(storage).catch((error) => {
      console.error("[pipeline-auto-archive] scheduler error:", error);
    });
  };

  setTimeout(tick, 45_000);
  setInterval(tick, AUTO_ARCHIVE_CHECK_INTERVAL_MS);
}
