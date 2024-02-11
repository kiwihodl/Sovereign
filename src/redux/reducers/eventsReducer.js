import { createSlice, current } from '@reduxjs/toolkit';

const addItems = (state, action, key) => {
  const items = current(state)[key];
  if (Array.isArray(action.payload)) {
    // If payload is an array, spread it into the existing array
    state[key] = [...items, ...action.payload];
  } else {
    // If payload is a single item, push it into the array
    items.push(action.payload);
  }
};

export const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    resources: [],
    courses: [],
  },
  reducers: {
    setItems: (state, action) => {
      if (action.payload.type === 'resource') {
        addItems(state, action.payload.data, 'resources');
      } else if (action.payload.type === 'course') {
        addItems(state, action.payload.data, 'courses');
      }
    },
  },
});

// Exports
export const { setItems } = eventsSlice.actions;
export default eventsSlice.reducer;
