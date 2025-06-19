import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTimers, Timer } from "@/context/TimerContext";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useTheme } from "@/context/ThemeContext";

export default function AddTimerScreen() {
  const { dispatch } = useTimers();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = themedStyles(theme);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");

  const commonCategories = [
    "Work",
    "Exercise",
    "Study",
    "Cooking",
    "Break",
    "Meditation",
    "Reading",
  ];

  const commonDurations = [
    { label: "1 min", hours: 0, minutes: 1, seconds: 0 },
    { label: "5 min", hours: 0, minutes: 5, seconds: 0 },
    { label: "10 min", hours: 0, minutes: 10, seconds: 0 },
    { label: "15 min", hours: 0, minutes: 15, seconds: 0 },
    { label: "25 min", hours: 0, minutes: 25, seconds: 0 },
    { label: "30 min", hours: 0, minutes: 30, seconds: 0 },
    { label: "1 hour", hours: 1, minutes: 0, seconds: 0 },
  ];

  const validateInputs = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a timer name");
      return false;
    }

    if (!category.trim()) {
      Alert.alert("Error", "Please enter a category");
      return false;
    }

    const totalSeconds =
      parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    if (totalSeconds <= 0) {
      Alert.alert("Error", "Timer duration must be greater than 0");
      return false;
    }

    if (totalSeconds > 86400) {
      // 24 hours
      Alert.alert("Error", "Timer duration cannot exceed 24 hours");
      return false;
    }

    return true;
  };

  const handleCreateTimer = () => {
    if (!validateInputs()) return;

    const duration =
      parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

    const newTimer: Timer = {
      id: Date.now().toString(),
      name: name.trim(),
      category: category.trim(),
      duration,
      remaining: duration,
      status: "paused",
      halfwayAlertTriggered: false,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_TIMER", payload: newTimer });

    Toast.show({
      type: "success",
      text1: "Timer Created!",
      text2: `${newTimer.name} has been added successfully`,
    });

    // Reset form
    setName("");
    setCategory("");
    setHours("0");
    setMinutes("5");
    setSeconds("0");

    // Navigate back to home
    router.push("/");
  };

  const setQuickDuration = (duration: (typeof commonDurations)[0]) => {
    setHours(duration.hours.toString());
    setMinutes(duration.minutes.toString());
    setSeconds(duration.seconds.toString());
  };

  const formatTimeInput = (value: string, max: number) => {
    const num = parseInt(value) || 0;
    return Math.min(Math.max(0, num), max).toString();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create New Timer</Text>

        {/* Timer Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Timer Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter timer name"
            placeholderTextColor="#9ca3af"
            maxLength={50}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.textInput}
            value={category}
            onChangeText={setCategory}
            placeholder="Enter category"
            placeholderTextColor="#9ca3af"
            maxLength={30}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {commonCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Duration */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration</Text>

          <View style={styles.timeInputContainer}>
            <View style={styles.timeInput}>
              <TextInput
                style={styles.timeTextInput}
                value={hours}
                onChangeText={(text) => setHours(formatTimeInput(text, 23))}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.timeLabel}>hours</Text>
            </View>

            <Text style={styles.timeSeparator}>:</Text>

            <View style={styles.timeInput}>
              <TextInput
                style={styles.timeTextInput}
                value={minutes}
                onChangeText={(text) => setMinutes(formatTimeInput(text, 59))}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.timeLabel}>min</Text>
            </View>

            <Text style={styles.timeSeparator}>:</Text>

            <View style={styles.timeInput}>
              <TextInput
                style={styles.timeTextInput}
                value={seconds}
                onChangeText={(text) => setSeconds(formatTimeInput(text, 59))}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.timeLabel}>sec</Text>
            </View>
          </View>

          {/* Quick Duration Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.durationScroll}
          >
            {commonDurations.map((duration) => (
              <TouchableOpacity
                key={duration.label}
                style={styles.durationChip}
                onPress={() => setQuickDuration(duration)}
              >
                <Text style={styles.durationChipText}>{duration.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Timer Preview</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewName}>{name || "Timer Name"}</Text>
            <Text style={styles.previewCategory}>{category || "Category"}</Text>
            <Text style={styles.previewDuration}>
              {hours.padStart(2, "0")}:{minutes.padStart(2, "0")}:
              {seconds.padStart(2, "0")}
            </Text>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTimer}
        >
          <Text style={styles.createButtonText}>Create Timer</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
}

const themedStyles = (theme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "dark" ? "#0f172a" : "#f8fafc",
      marginBlockEnd: 20,
      borderRadius: 12,
    },
    scrollView: {
      flex: 1,
      padding: 20,
    },
    toggleText: {
      textAlign: "center",
      color: theme === "dark" ? "#38bdf8" : "#1f6feb",
      marginBottom: 12,
      fontWeight: "bold",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme === "dark" ? "#e2e8f0" : "#1e293b",
      marginBottom: 30,
      textAlign: "center",
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: theme === "dark" ? "#cbd5e1" : "#374151",
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
      borderWidth: 1,
      borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme === "dark" ? "#f1f5f9" : "#1e293b",
    },
    categoryScroll: {
      marginTop: 12,
    },
    categoryChip: {
      backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
      borderWidth: 1,
      borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
    },
    categoryChipSelected: {
      backgroundColor: "#1f6feb",
      borderColor: "#1f6feb",
    },
    categoryChipText: {
      color: theme === "dark" ? "#cbd5e1" : "#6b7280",
      fontSize: 14,
      fontWeight: "500",
    },
    categoryChipTextSelected: {
      color: "#fff",
    },
    timeInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: "center",
      backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
    },
    timeInput: {
      alignItems: "center",
      minWidth: 60,
    },
    timeTextInput: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme === "dark" ? "#f1f5f9" : "#1e293b",
      textAlign: "center",
      minWidth: 40,
      paddingVertical: 4,
    },
    timeLabel: {
      fontSize: 12,
      color: theme === "dark" ? "#94a3b8" : "#6b7280",
      marginTop: 4,
    },
    timeSeparator: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme === "dark" ? "#94a3b8" : "#6b7280",
      marginHorizontal: 8,
    },
    durationScroll: {
      marginTop: 12,
    },
    durationChip: {
      backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
      borderWidth: 1,
      borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
    },
    durationChipText: {
      color: "#1f6feb",
      fontSize: 12,
      fontWeight: "500",
    },
    previewContainer: {
      marginBottom: 32,
    },
    previewTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme === "dark" ? "#cbd5e1" : "#374151",
      marginBottom: 12,
    },
    previewCard: {
      backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
      borderRadius: 12,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme === "dark" ? "#334155" : "#e5e7eb",
    },
    previewName: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme === "dark" ? "#f1f5f9" : "#1e293b",
      marginBottom: 4,
    },
    previewCategory: {
      fontSize: 14,
      color: theme === "dark" ? "#94a3b8" : "#6b7280",
      marginBottom: 12,
    },
    previewDuration: {
      fontSize: 18,
      fontWeight: "600",
      color: "#1f6feb",
      fontFamily: "monospace",
    },
    createButton: {
      backgroundColor: "#1f6feb",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    createButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    bottomSpacing: {
      height: 20,
    },
  });
