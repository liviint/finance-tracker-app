'use client';
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export default function ChatWebSocket({ conversationId, onMessage }) {
    const token = useSelector(state => state?.user?.userDetails).access
    const socketRef = useRef(null);
    const retryCount = useRef(0);
    const heartbeatRef = useRef(null);
    const maxRetries = 10;
    const receivedIds = useRef(new Set());

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_CHAT_MESSAGES_WSS_URL;
        const startHeartbeat = (socket) => {
            if (heartbeatRef.current) return;

            heartbeatRef.current = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ ping: true }));
                }
            }, 25000); 
        };

        const stopHeartbeat = () => {
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
            }
        };

        const connect = () => {
            if (socketRef.current) return;

            const socket = new WebSocket(`${wsUrl}chat/${conversationId}/?token=${token}`);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("🟢 Chat WS connected");
                retryCount.current = 0;
                startHeartbeat(socket);
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const msgId = data.data.data.id;
                if (receivedIds.current.has(msgId)) return;
                receivedIds.current.add(msgId);
                console.log(data,"hello data here")
                onMessage?.(data.data.data);
            };

            socket.onclose = () => {
                console.log("🟡 Chat WS closed");
                stopHeartbeat();
                socketRef.current = null;

                if (retryCount.current < maxRetries) {
                    const delay = Math.pow(2, retryCount.current) * 1000;
                    console.log(`🔁 Reconnecting in ${delay / 1000}s...`);
                    setTimeout(() => {
                        retryCount.current += 1;
                        connect();
                    }, delay);
                } else {
                    console.error("🔴 Max reconnect attempts reached.");
                }
            };

            socket.onerror = (err) => {
                console.error("❗ Chat WS error", err);
                socket.close();
            };
        };

        connect();

        return () => {
            stopHeartbeat();
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [conversationId]);

    return null;

}
