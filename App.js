import React from "react";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import store from "./redux/store"; // Import your Redux store
import FantasyScheduler from "./FantasyScheduler"; // Your main component

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <FantasyScheduler />
      </Provider>
    </GestureHandlerRootView>
  );
}
