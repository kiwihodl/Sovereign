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
        pubkey: '',
        username: '',
        relays: initialRelays,
    },
    reducers: {
        setRelays: (state, action) => {
            state.relays = [...state.relays, action.payload];
        },
        setPubkey: (state, action) => {
            state.pubkey = action.payload;
        },
        setUsername: (state, action) => {
            state.username = action.payload;
        },
    },
});

export const { setRelays, setPubkey, setUsername } = userSlice.actions;

export default userSlice.reducer;