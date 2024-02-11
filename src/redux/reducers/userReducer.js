import { createSlice } from "@reduxjs/toolkit";

const initialRelays = [
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
        relays: initialRelays,
    },
    reducers: {
        setRelays: (state, action) => {
            state.relays = [...state.relays, action.payload];
        },
        setPubkey: (state, action) => {
            state.pubkey = action.payload;
        }
    },
});

export const { setRelays, setPubkey } = userSlice.actions;

export default userSlice.reducer;