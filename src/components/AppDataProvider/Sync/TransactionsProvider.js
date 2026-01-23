import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";

import {
  getUnsyncedTransactions,
  syncTransactionsFromApi,
  getLastSyncedAt,
  saveLastSyncedAt,
} from "../../../db/transactionsDb";
import { api } from "../../../../api";
import { syncManager } from "../../../../utils/syncManager";
import { useSyncEngine } from "../../../../src/hooks/useSyncEngine";

export default function TransactionsProvider({ children }) {
  const db = useSQLiteContext();
  const userDetails = useSelector((state) => state?.user?.userDetails);
  const enabled = !!userDetails;

  const bootstrap = async () => {
    // 1️⃣ Push local → server
    const unsynced = await getUnsyncedTransactions(db);
    if (unsynced.length > 0) {
      await api.post("/finances/transactions/bulk-sync/", {
        items: unsynced,
      });
    }

    // 2️⃣ Pull server → local
    const lastSyncedAt = await getLastSyncedAt(db);
    const res = await api.post("/finances/transactions/sync/", {
      last_synced_at: lastSyncedAt,
    });

    await syncTransactionsFromApi(db, res.data.results);
    await saveLastSyncedAt(db, res.data.server_time);

    syncManager.emit("transactions_updated");
  };

  useSyncEngine({
    enabled,
    name: "transactions",
    bootstrap,
  });

  return children;
}
