import { createSlice } from "@reduxjs/toolkit";

export const initialRelays = [
    "wss://nos.lol/",
    "wss://relay.damus.io/",
    "wss://relay.snort.social/",
    "wss://relay.nostr.band/",
    "wss://nostr.mutinywallet.com/",
    "wss://relay.mutinywallet.com/",
    "wss://relay.primal.net/"
];

export const userSlice = createSlice({
    name: "user",
    initialState: {
        user: {},
        relays: initialRelays,
    },
    reducers: {
        setRelays: (state, action) => {
            state.relays = [...state.relays, action.payload];
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
});

export const { setRelays, setUser } = userSlice.actions;

export default userSlice.reducer;