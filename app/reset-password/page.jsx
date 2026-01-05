'use client'
import ResetPassword from '../../src/components/ResetPassword/ResetPassword';
import { Suspense } from 'react';

const index = () => {
    return (
            <Suspense fallback={"Loading..."}>
                <ResetPassword />
            </Suspense>
        );
}

export default index






