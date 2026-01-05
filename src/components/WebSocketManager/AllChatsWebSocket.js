'use client';
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export default function AllChatsWebSocket({ onMessage }) {
    const token = useSelector(state => state?.user?.userDetails?.access);
    const socketRef = useRef(null);
    const retryCount = useRef(0);
    const heartbeatRef = useRef(null);
    const receivedIds = useRef(new Set()); 
    const maxRetries = 10;

    useEffect(() => {
        if (!token) return;

        const wsUrl = process.env.NEXT_PUBLIC_CHAT_MESSAGES_WSS_URL;

        const startHeartbeat = (socket) => {
            if (heartbeatRef.current) return;

            heartbeatRef.current = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: "ping" })); 
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

            const socket = new WebSocket(`${wsUrl}all-chats/?token=${token}`);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("🟢 All Chats WS connected");
                retryCount.current = 0;
                startHeartbeat(socket);
            };

            socket.onmessage = (event) => {
                const json = JSON.parse(event.data);

                if (json.type !== "new_message") return;

                const message = json.data; 
                const msgId = message.id;
                console.log(message,"hello new chat")
                if (receivedIds.current.has(msgId)) return;
                receivedIds.current.add(msgId);

                onMessage?.(message);
            };

            socket.onclose = () => {
                console.log("🟡 All Chats WS closed");
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
                console.error("❗ All Chats WS error", err);
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
    }, [token]); 

    return null;
}
