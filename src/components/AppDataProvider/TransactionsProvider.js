import { useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { seedCategoriesIfEmpty } from '../../db/transactionsDb';

export default function TransactionsProvider() {
    const db = useSQLiteContext();

    useEffect(() => {
        seedCategoriesIfEmpty(db)
    }, []);

    return null
}
