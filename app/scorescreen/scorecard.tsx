import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useTimerStore } from "@/storedata/timerStore";

export default function TimerTestScreen() {
  const timer = useTimerStore((s) => s.timer);
  const setTimer = useTimerStore((s) => s.setTimer);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 30 }}>⏱ Timer: {timer}</Text>
    </View>
  );
}
