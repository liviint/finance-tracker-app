'use client';
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { 
    setConnected, 
    addMessage,
} from "../../store/features/websocketSlice";

export default function WebSocketManager() {
    const dispatch = useDispatch();
    const socketRef = useRef(null);
    const retryCount = useRef(0);
    const heartbeatRef = useRef(null);
    const maxRetries = 10;

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_CHAT_MESSAGES_WSS_URL;

        const startHeartbeat = (socket) => {
            // Prevent multiple intervals
            if (heartbeatRef.current) return;

            heartbeatRef.current = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ ping: true }));
                }
            }, 25000); // Send every 25s
        };

        const stopHeartbeat = () => {
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
            }
        };

        const connect = () => {
            if (socketRef.current) return;

            const socket = new WebSocket(`${wsUrl}/${chatId}`);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("🟢 WebSocket connected");
                retryCount.current = 0;
                dispatch(setConnected(true));
                startHeartbeat(socket);
            };

            socket.onmessage = (event) => {
                try {
                    const { event: eventType, data } = JSON.parse(event.data);

                    if (!eventType) return;
                    const payload = data?.data ?? data;
                    dispatch(addMessage(payload));
                } catch (err) {
                    console.warn("Invalid WS message:", event.data);
                }
            };

            socket.onclose = () => {
                console.log("🟡 WebSocket closed");
                dispatch(setConnected(false));
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
                console.error("❗ WebSocket error", err);
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
    }, [dispatch]);

    return null;
}
