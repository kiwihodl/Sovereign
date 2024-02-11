import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userReducer";
import eventsReducer from "./reducers/eventsReducer";

export const store = configureStore({
  reducer: {
    user: userReducer,
    events: eventsReducer,
  }
});