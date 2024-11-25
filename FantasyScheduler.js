import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, SafeAreaView, ScrollView, FlatList } from "react-native";
import { Provider as PaperProvider, TextInput, Button, Card, Title, Paragraph, Checkbox } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { addSchedule, updateSchedule, deleteSchedule } from "./redux/actions";
import DateTimePicker from "@react-native-community/datetimepicker";


const FantasyScheduler = () => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [timeSlots, setTimeSlots] = useState({});
    const [participant, setParticipant] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [currentDay, setCurrentDay] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState("start");
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const dispatch = useDispatch();
    const schedules = useSelector((state) => (state && state.schedules) || []);

    useEffect(() => {
        const loadSchedules = async () => {
            try {
                const storedSchedules = await AsyncStorage.getItem("schedules");
                if (storedSchedules) {
                    dispatch({ type: "SET_SCHEDULES", payload: JSON.parse(storedSchedules) });
                }
            } catch (error) {
                console.error("Error loading schedules from AsyncStorage", error);
            }
        };
        loadSchedules();
    }, [dispatch]);


    useEffect(() => {
        AsyncStorage.setItem("schedules", JSON.stringify(schedules)).catch((error) =>
            console.error("Error saving schedules to AsyncStorage", error)
        );
    }, [schedules]);

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter((d) => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
            setCurrentDay(day);
        }
    };

    const handleAddTimeSlot = () => {
        if (!startTime || !endTime || startTime >= endTime) {
            Alert.alert("Error", "Ensure valid start and end times are selected.");
            return;
        }

        const daySlots = timeSlots[currentDay] || [];
        const overlaps = daySlots.some(
            (slot) =>
                (startTime >= slot.startTime && startTime < slot.endTime) ||
                (endTime > slot.startTime && endTime <= slot.endTime) ||
                (startTime <= slot.startTime && endTime >= slot.endTime)
        );

        if (overlaps) {
            Alert.alert("Error", "Time slots cannot overlap.");
            return;
        }

        const updatedDaySlots = [...daySlots, { startTime, endTime }];
        setTimeSlots({ ...timeSlots, [currentDay]: updatedDaySlots });

        setStartTime(null);
        setEndTime(null);
        setCurrentDay(null);
    };

    const handleDeleteTimeSlot = (day, index) => {
        const daySlots = timeSlots[day] || [];
        daySlots.splice(index, 1);
        setTimeSlots({ ...timeSlots, [day]: daySlots });
    };

  const handleAddOrUpdate = () => {
  if (!participant || Object.keys(timeSlots).length === 0) {
    Alert.alert("Error", "Please fill all fields.");
    return;
  }

  const newSchedule = {
    id: editingId || Date.now().toString(),
    participant,
    timeSlots: Object.entries(timeSlots).map(([day, slots]) => ({ day, slots })),
  };

  if (editingId) {
    // Update the schedule
    const updatedSchedules = schedules.map((schedule) =>
      schedule.id === editingId ? newSchedule : schedule
    );
    dispatch({ type: "SET_SCHEDULES", payload: updatedSchedules });
    AsyncStorage.setItem("schedules", JSON.stringify(updatedSchedules)); // Persist updated data
    setEditingId(null);
  } else {
    // Add a new schedule
    const newSchedules = [...schedules, newSchedule];
    dispatch({ type: "SET_SCHEDULES", payload: newSchedules });
    AsyncStorage.setItem("schedules", JSON.stringify(newSchedules)); // Persist new data
  }

  // Reset the form fields
  setParticipant("");
  setTimeSlots({});
  setSelectedDays([]);
};



    const handleEdit = (id) => {
        const schedule = schedules.find((s) => s.id === id);
        if (!schedule) return;

        setParticipant(schedule.participant);

        const transformedSlots = {};
        schedule.timeSlots.forEach(({ day, slots }) => {
            transformedSlots[day] = slots;
        });

        setTimeSlots(transformedSlots);
        setSelectedDays(schedule.timeSlots.map((ts) => ts.day)); // Restore selected days
        setEditingId(id);
    };


    const handleDelete = (id) => {
        Alert.alert("Confirm", "Are you sure you want to delete this schedule?", [
            { text: "Cancel" },
            { text: "Delete", onPress: () => dispatch(deleteSchedule(id)) },
        ]);
    };

    return (
        <PaperProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <Title style={styles.title}>Fantasy Match Scheduler</Title>

                    <TextInput
                        label="Enter Participant Name"
                        value={participant}
                        onChangeText={setParticipant}
                        mode="outlined"
                        style={styles.input}
                    />

                    {Object.keys(timeSlots).map((day) => (
                        <View key={day} style={styles.dayContainer}>
                            <Title>{day}</Title>
                            {timeSlots[day].map((slot, index) => (
                                <View key={index} style={styles.slotContainer}>
                                    <Paragraph>{`${slot.startTime} - ${slot.endTime}`}</Paragraph>
                                    <Button onPress={() => handleDeleteTimeSlot(day, index)}>Delete</Button>
                                </View>
                            ))}
                        </View>
                    ))}

                    <Title style={styles.subtitle}>Select Days:</Title>
                    <FlatList
                        data={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
                        renderItem={({ item }) => (
                            <Checkbox.Item
                                label={item}
                                status={selectedDays.includes(item) ? "checked" : "unchecked"}
                                onPress={() => toggleDay(item)}
                            />
                        )}
                        keyExtractor={(item) => item}
                    />

                    {currentDay && (
                        <View style={styles.timeSlotContainer}>
                            <Title>{`Add Time Slot for ${currentDay}`}</Title>
                            <Button mode="outlined" onPress={() => { setShowPicker(true); setPickerMode("start"); }}>
                                {startTime ? `Start Time: ${startTime}` : "Select Start Time"}
                            </Button>
                            <Button mode="outlined" onPress={() => { setShowPicker(true); setPickerMode("end"); }}>
                                {endTime ? `End Time: ${endTime}` : "Select End Time"}
                            </Button>
                            <Button mode="contained" onPress={handleAddTimeSlot} style={styles.addButton}>
                                Add Time Slot
                            </Button>
                        </View>
                    )}

                    {showPicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                setShowPicker(false);
                                if (selectedDate) {
                                    const formattedTime = selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                                    pickerMode === "start" ? setStartTime(formattedTime) : setEndTime(formattedTime);
                                }
                            }}
                        />
                    )}

                    <Button mode="contained" onPress={handleAddOrUpdate} style={styles.button}>
                        {editingId ? "Update Schedule" : "Add Schedule"}
                    </Button>

                    <FlatList
                        data={schedules}
                        extraData={schedules} // Ensures FlatList updates on schedule changes
                        renderItem={({ item }) => (
                            <Card style={styles.card}>
                                <Card.Content>
                                    <Title>{item.participant}</Title>
                                    {item.timeSlots.map(({ day, slots }) => (
                                        <View key={day}>
                                            <Title>{day}</Title>
                                            {slots.map((slot, index) => (
                                                <Paragraph key={index}>
                                                    {slot.startTime} - {slot.endTime}
                                                </Paragraph>
                                            ))}
                                        </View>
                                    ))}
                                </Card.Content>
                                <Card.Actions>
                                    <Button onPress={() => handleEdit(item.id)}>Edit</Button>
                                    <Button onPress={() => handleDelete(item.id)}>Delete</Button>
                                </Card.Actions>
                            </Card>
                        )}
                        keyExtractor={(item) => item.id}
                    />

                </ScrollView>
            </SafeAreaView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
    },
    input: {
        marginBottom: 20,
    },
    subtitle: {
        marginTop: 20,
        fontSize: 18,
    },
    button: {
        marginTop: 20,
    },
    card: {
        marginVertical: 10,
    },
    dayContainer: {
        marginBottom: 10,
    },
    slotContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    },
    timeSlotContainer: {
        marginTop: 20,
    },
    addButton: {
        marginTop: 10,
    },
});

export default FantasyScheduler;
