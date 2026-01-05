'use client'

import { Suspense } from 'react';
import VerifyEmail from '@/components/VerifyEmail';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={"loading..."}>
      <VerifyEmail />
    </Suspense>
  );
}
