import { createSlice } from '@reduxjs/toolkit';

// Helper function to add single or multiple items
const addItems = (state, action, key) => {
  if (Array.isArray(action.payload)) {
    // If payload is an array, spread it into the existing array
    state[key] = [...state[key], ...action.payload];
  } else {
    // If payload is a single item, push it into the array
    state[key].push(action.payload);
  }
};

export const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    resources: [],
    courses: [],
  },
  reducers: {
    addResource: (state, action) => {
      addItems(state, action, 'resources');
    },
    addCourse: (state, action) => {
      addItems(state, action, 'courses');
    },
    // If you need to set the entire array at once, keep these or adjust as necessary
    setResources: (state, action) => {
      state.resources = action.payload;
    },
    setCourses: (state, action) => {
      state.courses = action.payload;
    },
  },
});

// Exports
export const { addResource, addCourse, setResources, setCourses } = eventsSlice.actions;
export default eventsSlice.reducer;
