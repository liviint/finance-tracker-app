'use client';
import React, { useState } from 'react';
import { blogApi } from 'api';

export default function FeedbackPage() {
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
            blogApi({
                url: '/feedback/',
                method:'POST',
                data:{message}
            }).then(res => {
                console.log(res,"hello res")
                setSubmitted(true);
                setMessage('');
            }).catch(error => console.log(error,"error"))
            .finally(() =>setLoading(false) )
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F7' }}>
        <div
            className="rounded-2xl shadow-lg max-w-md w-full p-6"
            style={{ backgroundColor: '#F4E1D2' }}
        >
            <h1
            className="text-2xl mb-4 text-center"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#FF6B6B' }}
            >
            Share Your Feedback
            </h1>
            <p
            className="mb-6 text-center"
            style={{ fontFamily: 'Inter, sans-serif', color: '#333333', fontWeight: 400 }}
            >
            Your input helps us make ZeniaHub a better space for personal growth and productivity.
            </p>

            {submitted ? (
            <div className="text-center py-8">
                <p
                className="mb-4 text-lg"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#2E8B8B' }}
                >
                Thank you for your feedback!
                </p>
                <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 rounded-full"
                style={{ backgroundColor: '#FF6B6B', color: '#FAF9F7', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                >
                Submit Another
                </button>
            </div>
            ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your feedback here..."
                className="w-full h-32 p-3 rounded-xl resize-none focus:outline-none"
                style={{
                    border: '1px solid #FF6B6B',
                    backgroundColor: '#FAF9F7',
                    fontFamily: 'Inter, sans-serif',
                    color: '#333333',
                    fontWeight: 400,
                }}
                ></textarea>
                <button
                type="submit"
                disabled={loading}
                className="py-2 rounded-xl transition disabled:opacity-50"
                style={{
                    backgroundColor: '#2E8B8B',
                    color: '#FAF9F7',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                }}
                >
                {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
            )}
        </div>
        </div>
    );
}
