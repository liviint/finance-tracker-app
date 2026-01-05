
import { configureStore } from "@reduxjs/toolkit";
import userReducer from './features/userSlice';
import websocketReducer from "./features/websocketSlice";

export const store = configureStore({
    reducer: {
        user : userReducer,
        websocket: websocketReducer,
    }
})