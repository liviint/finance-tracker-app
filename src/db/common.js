export async function getLastSyncedAt(db) {
  const row = await db.getFirstAsync(
    `SELECT value FROM app_settings WHERE key = 'last_synced_at';`
  );

  if (!row?.value) {
    return null; // never synced
  }

  // Always return a Date in UTC
  return new Date(row.value);
}
