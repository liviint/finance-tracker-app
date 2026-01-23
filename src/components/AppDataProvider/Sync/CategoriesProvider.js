import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";

import {
  getUnsyncedCategories,
  syncCategoriesFromApi,
  getCategoriesLastSyncedAt,
  saveCategoriesLastSyncedAt,
} from "../../../db/categoriesDb";
import { api } from "../../../../api";
import { syncManager } from "../../../../utils/syncManager";
import { useSyncEngine } from "../../../../src/hooks/useSyncEngine";

export default function CategoriesProvider({ children }) {
  const db = useSQLiteContext();
  const userDetails = useSelector((state) => state?.user?.userDetails);
  const enabled = !!userDetails;

  const bootstrap = async () => {
    // ─────────────────────────────
    // 1️⃣ PUSH: local → server
    // ─────────────────────────────
    const unsynced = await getUnsyncedCategories(db);
    if (unsynced.length > 0) {
      await api.post("/finances/categories/bulk-sync/", {
        items: unsynced,
      });
    }

    // ─────────────────────────────
    // 2️⃣ PULL: server → local
    // ─────────────────────────────
    const lastSyncedAt = await getCategoriesLastSyncedAt(db);

    const res = await api.post("/finances/categories/sync/", {
      last_synced_at: lastSyncedAt,
    });

    await syncCategoriesFromApi(db, res.data.results);
    await saveCategoriesLastSyncedAt(db, res.data.server_time);

    syncManager.emit("categories_updated");
  };

  useSyncEngine({
    enabled,
    name: "categories",
    bootstrap,
  });

  return children;
}
