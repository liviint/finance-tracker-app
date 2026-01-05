import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    connected: false,
    messages: [],
};

const websocketSlice = createSlice({
    name: "websocket",
    initialState,
    reducers: {
        setConnected(state, action) {
            state.connected = action.payload;
        },
        addMessage(state, action) {
            state.messages.push(action.payload);
        },
        removeMessage(state, action) {
            const id = action.payload;
            state.messages = state.messages.filter(m => m.id !== id);
        },
    },
});

export const {
    setConnected,
    addMessage,
    removeMessage,
} = websocketSlice.actions;

export default websocketSlice.reducer;
