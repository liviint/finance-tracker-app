import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";
import {
    getUnsyncedDebts,
    syncDebtsFromApi,
    getUnsyncedDebtPayments,
    syncDebtPaymentsFromApi,
} from "../../../db/debtsDb";
import { getLastSyncedAt, saveLastSyncedAt } from "../../../db/common";
import { api } from "../../../../api";
import { syncManager } from "../../../../utils/syncManager";
import { useSyncEngine } from "../../../../src/hooks/useSyncEngine";

export default function DebtsProvider({ children }) {
    const db = useSQLiteContext();
    const userDetails = useSelector((state) => state?.user?.userDetails);

    const enabled = !!userDetails;

    const syncDebtsFromLocalToApi = async () => {
        try {
            const unsyncedDebts = await getUnsyncedDebts(db);
            if (unsyncedDebts.length > 0) {
                await api.post("/finances/debts/bulk_sync/", {
                items: unsyncedDebts,
                });
            }
        } catch (error) {
            console.log("Debt Local → API Sync Error:", error);
        }
    };

    const syncPaymetsFromLocalToApi = async () => {
        try {
            const unsyncedPayments = await getUnsyncedDebtPayments(db);
            if (unsyncedPayments.length > 0) {
                await api.post("/finances/debts/payments/bulk_sync/", {
                items: unsyncedPayments,
                });
            }
        } catch (error) {
            console.log("Debt payment Local → API Sync Error:", error);
        }
    };

    const syncDebtsFromApiToLocal = async () => {
        try {
            const lastDebtsSyncedAt = await getLastSyncedAt(db, "debts");

            const debtsRes = await api.post("/finances/debts/sync/", {
                last_synced_at: lastDebtsSyncedAt,
            });

            await syncDebtsFromApi(db, debtsRes.data.results);
            await saveLastSyncedAt(db,"debts", debtsRes.data.server_time );
        } catch (error) {
            console.log("Debt API → Local Sync Error:", error);
        }
    };

    const syncPaymetsFromApiToLocal = async () => {
        try {
            const lastPaymentsSyncedAt = await getLastSyncedAt(db,"debt_payments");

            const paymentsRes = await api.post("/finances/debts/payments/sync/", {
                last_synced_at: lastPaymentsSyncedAt,
            });
            await syncDebtPaymentsFromApi(db, paymentsRes.data.results);

            await saveLastSyncedAt(db,"debt_payments",paymentsRes.data.server_time,);
        } catch (error) {
        console.log("Debt Payments API → Local Sync Error:", error);
        }
    };

    const bootstrap = async () => {
        await syncDebtsFromLocalToApi();
        await syncPaymetsFromLocalToApi();

        await syncDebtsFromApiToLocal();
        await syncPaymetsFromApiToLocal();

        syncManager.emit("debts_updated");
    };

    useSyncEngine({
        enabled,
        name: "debts",
        bootstrap,
    });

    return children;
}
