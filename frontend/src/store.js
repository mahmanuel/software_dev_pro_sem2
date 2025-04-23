import { configureStore } from "@reduxjs/toolkit";
import issuesReducer from "./slices/issuesSlice";
import notificationsReducer from "./slices/notificationsSlice";

const store = configureStore({
  reducer: {
    issues: issuesReducer,
    notifications: notificationsReducer,
  },
});

export default store;