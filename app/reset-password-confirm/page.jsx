'use client'
import { Suspense } from 'react';
import ResetPasswordConfirm from '@/components/ResetPassword/ResetPasswordConfirm';

export default function ResetPasswordConfirmPage() {
    return (
        <Suspense fallback={"Loading..."}>
            <ResetPasswordConfirm />
        </Suspense>
    );
}
