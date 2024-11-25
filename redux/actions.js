export const addSchedule = (schedule) => ({
  type: "ADD_SCHEDULE",
  payload: schedule,
});

export const updateSchedule = (schedule) => ({
  type: "UPDATE_SCHEDULE",
  payload: schedule,
});

export const deleteSchedule = (id) => ({
  type: "DELETE_SCHEDULE",
  payload: id,
});
export const setSchedules = (schedules) => ({
  type: "SET_SCHEDULES",
  payload: schedules,
});



