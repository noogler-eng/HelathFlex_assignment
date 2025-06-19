import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTimers } from "@/context/TimerContext";
import Toast from "react-native-toast-message";

export default function TimerCard({ id }: { id: string }) {
  const router = useRouter();
  const { state, dispatch } = useTimers();

  const timer = state.timers.find((t) => t.id === id);
  const [localRemaining, setLocalRemaining] = useState(timer?.remaining ?? 0);
  const [toastShown, setToastShown] = useState({ half: false, full: false });

  // Sync context value to local when timer changes
  useEffect(() => {
    if (!timer) return;
    setLocalRemaining(timer.remaining);
    setToastShown({ half: false, full: false });
  }, [timer?.id]);

  useEffect(() => {
    if (!timer) return;

    if (timer.status === "running") {
      const interval = setInterval(() => {
        setLocalRemaining((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer?.status]);

  useEffect(() => {
    if (!timer) return;
    const percent = (timer.duration - localRemaining) / timer.duration;

    if (percent >= 0.5 && !toastShown.half) {
      Toast.show({ type: "info", text1: "Halfway through!" });
      setToastShown((prev) => ({ ...prev, half: true }));
    }

    if (percent >= 1 && !toastShown.full) {
      Toast.show({ type: "success", text1: "Timer Completed!" });
      dispatch({ type: "COMPLETE_TIMER", payload: timer.id });
      setToastShown((prev) => ({ ...prev, full: true }));
    }
  }, [localRemaining]);

  useEffect(() => {
    if (!timer) {
      Toast.show({ type: "error", text1: "Timer not found" });
      router.replace("/");
    }
  }, [timer]);

  if (!timer) return null;

  const handleStart = () => {
    dispatch({ type: "START_TIMER", payload: timer.id });
  };

  const handlePause = () => {
    dispatch({ type: "PAUSE_TIMER", payload: timer.id });
  };

  const handleReset = () => {
    setToastShown({ half: false, full: false });
    setLocalRemaining(timer.duration);
    dispatch({ type: "RESET_TIMER", payload: timer.id });
  };

  const handleDelete = () => {
    dispatch({ type: "DELETE_TIMER", payload: timer.id });
    Toast.show({ type: "success", text1: "Timer deleted" });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress = (timer.duration - localRemaining) / timer.duration;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{timer.name}</Text>
      <Text style={styles.time}>{formatTime(localRemaining)}</Text>
      <Text style={styles.category}>Category: {timer.category}</Text>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress * 100, 100)}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {Math.round(progress * 100)}% completed
      </Text>

      <View style={styles.buttonContainer}>
        {(timer.status === "paused" || timer.status === "idle") && (
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}

        {timer.status === "running" && (
          <TouchableOpacity style={styles.button} onPress={handlePause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#1f2937",
    marginBottom: 8,
  },
  time: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 8,
  },
  progressBar: {
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 7,
    overflow: "hidden",
    marginVertical: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 7,
    backgroundColor: "#60a5fa", // blue-400
  },
  progressText: {
    textAlign: "center",
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  button: {
    backgroundColor: "#2563eb", // blue-600
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: "#ef4444", // red-500
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});

