import { sql } from "drizzle-orm";
import { db } from "./db";

export const EMPLOYEE_WELCOME_MESSAGE_KEY = "employee_welcome_message";

export const DEFAULT_EMPLOYEE_WELCOME_MESSAGE = `Welcome to StaffOS!

Your account has been successfully created, and you can now log in to manage your day-to-day recruitment activities. StaffOS is designed to streamline your workflow, improve productivity, and support a professional recruitment experience.

Please maintain confidentiality while handling client and candidate data, and keep all updates accurate inside the platform so reporting and tracking remain reliable.

If you need help getting started, please reach out through the internal support channel inside StaffOS.`;

export async function ensureAppSettingsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      setting_key text NOT NULL UNIQUE,
      setting_value text,
      updated_at text NOT NULL,
      updated_by text
    )
  `);
}

export async function getAppSetting(settingKey: string): Promise<string | null> {
  await ensureAppSettingsTable();
  const result = await db.execute(sql`
    SELECT setting_value
    FROM app_settings
    WHERE setting_key = ${settingKey}
    LIMIT 1
  `);

  const row = result.rows[0] as { setting_value?: string | null } | undefined;
  return row?.setting_value ?? null;
}

export async function upsertAppSetting(settingKey: string, settingValue: string, updatedBy?: string | null) {
  await ensureAppSettingsTable();
  const now = new Date().toISOString();

  await db.execute(sql`
    INSERT INTO app_settings (setting_key, setting_value, updated_at, updated_by)
    VALUES (${settingKey}, ${settingValue}, ${now}, ${updatedBy ?? null})
    ON CONFLICT (setting_key)
    DO UPDATE SET
      setting_value = EXCLUDED.setting_value,
      updated_at = EXCLUDED.updated_at,
      updated_by = EXCLUDED.updated_by
  `);
}

export async function getEmployeeWelcomeMessage(): Promise<string> {
  const value = await getAppSetting(EMPLOYEE_WELCOME_MESSAGE_KEY);
  return value?.trim() ? value : DEFAULT_EMPLOYEE_WELCOME_MESSAGE;
}
