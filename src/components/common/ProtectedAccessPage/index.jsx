'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const ProtectedAccessPage = ({message}) => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF9F7] p-6 text-center">
        <h1 className="text-3xl font-bold text-[#333333] mb-4">
            Oops! You need an account to access this.
        </h1>
        <p className="text-[#333333] mb-6 max-w-md">
            {message || "Your personal journal and habit tracker are waiting. Sign up or log in to continue."}
        </p>
        <div className="flex gap-4">
            <button
            onClick={() => router.push('/login')}
            className="bg-[#FF6B6B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#e65b5b]"
            >
            Log In
            </button>
            <button
            onClick={() => router.push('/signup')}
            className="border border-[#2E8B8B] text-[#2E8B8B] px-6 py-2 rounded-lg font-semibold hover:bg-[#2E8B8B] hover:text-white"
            >
            Sign Up
            </button>
        </div>
        </div>
    );
};

export default ProtectedAccessPage;
