import { createSlice } from '@reduxjs/toolkit';

// Helper function to add single or multiple items without duplicates
const addItems = (state, action, key) => {
  const existingIds = new Set(state[key].map(item => item.id));
  
  if (Array.isArray(action.payload)) {
    console.log('action.payload', action.payload);
    // Filter out duplicates based on the id
    const uniqueItems = action.payload.filter(item => !existingIds.has(item.id));
    // If payload is an array, spread it into the existing array without duplicates
    state[key] = [...state[key], ...action.payload];
  } else {
    // If payload is a single item, push it into the array if it's not a duplicate
    // if (!existingIds.has(action.payload.id)) {
      state[key].push(action.payload);
    // }
  }
};

export const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    resources: [],
    courses: [],
    workshops: [],
    streams: [],
  },
  reducers: {
    addResource: (state, action) => {
      addItems(state, action, 'resources');
    },
    addCourse: (state, action) => {
      addItems(state, action, 'courses');
    },
    addWorkshop: (state, action) => {
      addItems(state, action, 'workshops');
    },
    addStream: (state, action) => {
      addItems(state, action, 'streams');
    },
    setResources: (state, action) => {
      state.resources = action.payload;
    },
    setCourses: (state, action) => {
      state.courses = action.payload;
    },
  },
});

export const { addResource, addCourse, setResources, setCourses, addWorkshop, addStream } = eventsSlice.actions;
export default eventsSlice.reducer;
