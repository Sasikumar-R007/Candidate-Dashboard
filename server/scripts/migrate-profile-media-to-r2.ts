import "dotenv/config";
import { eq, isNull, or, sql } from "drizzle-orm";
import { profileMedia } from "@shared/schema";
import { db } from "../db";
import { uploadToR2Folder } from "../utils/r2Upload";

/**
 * Migrate legacy base64 profile_media.data rows to Cloudflare R2.
 *
 * - Uploads image bytes to avatars/
 * - Sets avatar_url on each row
 * - Does NOT delete or clear the legacy data column (safe rollback)
 *
 * Usage:
 *   npx tsx server/scripts/migrate-profile-media-to-r2.ts
 *   npx tsx server/scripts/migrate-profile-media-to-r2.ts --dry-run
 *   npx tsx server/scripts/migrate-profile-media-to-r2.ts --limit=50
 */

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

if (!process.env.R2_BUCKET) {
  console.error("R2_BUCKET is required for migration");
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Math.max(1, parseInt(limitArg.split("=")[1] || "0", 10)) : undefined;

async function main() {
  console.log(`Profile media → R2 migration${dryRun ? " (dry run)" : ""}`);

  const rows = await db
    .select({
      id: profileMedia.id,
      mimeType: profileMedia.mimeType,
      data: profileMedia.data,
      avatarUrl: profileMedia.avatarUrl,
    })
    .from(profileMedia)
    .where(
      or(
        isNull(profileMedia.avatarUrl),
        sql`trim(${profileMedia.avatarUrl}) = ''`,
      ),
    )
    .limit(limit ?? 10_000);

  const pending = rows.filter((row) => row.data?.trim());
  console.log(`Found ${pending.length} row(s) with base64 data and no avatar_url`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of pending) {
    try {
      const buffer = Buffer.from(row.data, "base64");
      if (!buffer.length) {
        skipped += 1;
        console.log(`- skip ${row.id}: empty base64 payload`);
        continue;
      }

      const ext = (row.mimeType || "image/jpeg").split("/")[1]?.replace("jpeg", "jpg") || "jpg";
      const fileName = `migrated-${row.id}.${ext}`;

      if (dryRun) {
        console.log(`- would migrate ${row.id} (${buffer.length} bytes)`);
        migrated += 1;
        continue;
      }

      const avatarUrl = await uploadToR2Folder(
        buffer,
        fileName,
        row.mimeType || "image/jpeg",
        "avatars",
      );

      await db
        .update(profileMedia)
        .set({ avatarUrl })
        .where(eq(profileMedia.id, row.id));

      migrated += 1;
      console.log(`✓ migrated ${row.id}`);
    } catch (error) {
      failed += 1;
      console.error(`✗ failed ${row.id}:`, error);
    }
  }

  console.log("\nSummary");
  console.log(`  migrated: ${migrated}`);
  console.log(`  skipped:  ${skipped}`);
  console.log(`  failed:   ${failed}`);
  if (dryRun) {
    console.log("\nRe-run without --dry-run to apply changes.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
