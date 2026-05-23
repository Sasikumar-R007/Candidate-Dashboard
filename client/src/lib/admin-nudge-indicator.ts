const ADMIN_NUDGES_LAST_SEEN_KEY = 'adminNudgesLastSeenAt';

export function getAdminNudgesLastSeenAt(): number {
  const raw = localStorage.getItem(ADMIN_NUDGES_LAST_SEEN_KEY);
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function markAdminNudgesAsSeen(): void {
  localStorage.setItem(ADMIN_NUDGES_LAST_SEEN_KEY, new Date().toISOString());
}

export function hasNewAdminNudges(
  nudges: Array<{ createdAt?: string; isResponded?: boolean }>,
): boolean {
  const lastSeen = getAdminNudgesLastSeenAt();
  return nudges.some((n) => {
    if (n.isResponded) return false;
    if (!n.createdAt) return false;
    const created = new Date(n.createdAt).getTime();
    return !Number.isNaN(created) && created > lastSeen;
  });
}
