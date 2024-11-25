import { createStore } from "redux";
import { scheduleReducer } from "./reducer";

const store = createStore(scheduleReducer);

export default store;
