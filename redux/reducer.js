const initialState = {
  schedules: [],
};

export const scheduleReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_SCHEDULES":
      return { ...state, schedules: action.payload }; // Replace the entire schedules array
    case "ADD_SCHEDULE":
      return { ...state, schedules: [...state.schedules, action.payload] };
    case "UPDATE_SCHEDULE":
      return {
        ...state,
        schedules: state.schedules.map((schedule) =>
          schedule.id === action.payload.id ? action.payload : schedule
        ),
      };
    case "DELETE_SCHEDULE":
      return {
        ...state,
        schedules: state.schedules.filter((schedule) => schedule.id !== action.payload),
      };
    default:
      return state;
  }
};
