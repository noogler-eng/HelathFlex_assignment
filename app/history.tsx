import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useTimers } from "../context/TimerContext";
import Toast from "react-native-toast-message";
import { useTheme } from "../context/ThemeContext";

export default function HistoryScreen() {
  const { state, dispatch } = useTimers();
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const styles = themedStyles(theme);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const clearAllHistory = () => {
    dispatch({ type: "CLEAR_COMPLETED_TIMERS" });
    Toast.show({
      type: "info",
      text1: "History Cleared",
      text2: "All completed timers have been removed",
    });
    setRefreshing(false);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      Toast.show({
        type: "info",
        text1: "History Refreshed",
      });
    }, 1000);
  }, []);

  const restartTimer = (timer: (typeof state.completedTimers)[0]) => {
    Alert.alert(
      "Restart Timer",
      `Do you want to restart "${timer.name}" timer?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restart",
          onPress: () => {
            const newTimer = {
              ...timer,
              id: Date.now().toString(),
              remaining: timer.duration,
              status: "paused" as const,
              halfwayAlertTriggered: false,
              createdAt: new Date().toISOString(),
              completedAt: undefined,
            };

            dispatch({ type: "ADD_TIMER", payload: newTimer });
            Toast.show({
              type: "success",
              text1: "Timer Restarted",
              text2: `${timer.name} has been added to your active timers`,
            });
          },
        },
      ]
    );
  };

  const renderCompletedTimer = ({
    item,
  }: {
    item: (typeof state.completedTimers)[0];
  }) => (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.timerName}>{item.name}</Text>
          <Text style={styles.timerCategory}>{item.category}</Text>
        </View>
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>✓ COMPLETED</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.timeInfo}>
          <Text style={styles.durationLabel}>Duration:</Text>
          <Text style={styles.durationValue}>{formatTime(item.duration)}</Text>
        </View>

        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>Completed:</Text>
          <Text style={styles.dateValue}>
            {item.completedAt ? formatDate(item.completedAt) : "Unknown"}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.restartButton}
          onPress={() => restartTimer(item)}
        >
          <Text
            style={styles.restartButtonText}
            onPress={() => {
              dispatch({ type: "ADD_TIMER", payload: item });
              Toast.show({
                type: "success",
                text1: "Timer Restarted",
                text2: `${item.name} has been added to your active timers`,
              });
            }}
          >
            Restart Timer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏆</Text>
      <Text style={styles.emptyTitle}>No Completed Timers</Text>
      <Text style={styles.emptySubtitle}>
        Complete some timers to see your achievements here
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{state.completedTimers.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {formatTime(
              state.completedTimers.reduce(
                (total, timer) => total + timer.duration,
                0
              )
            )}
          </Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
      </View>

      {state.completedTimers.length > 0 && (
        <TouchableOpacity onPress={clearAllHistory}>
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer History</Text>

      <FlatList
        data={state.completedTimers}
        keyExtractor={(item) => `${item.id}-${item.completedAt}`}
        renderItem={renderCompletedTimer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={
          state.completedTimers.length === 0 ? styles.emptyContainer : undefined
        }
      />

      <Toast />
    </View>
  );
}

const themedStyles = (theme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "dark" ? "#0f172a" : "#f8fafc",
      padding: 20,
      marginBlockEnd: 20,
      borderRadius: 12,
    },
    toggleThemeText: {
      textAlign: "right",
      color: theme === "dark" ? "#38bdf8" : "#1f6feb",
      marginBottom: 8,
      fontWeight: "bold",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme === "dark" ? "#e2e8f0" : "#1e293b",
      marginBottom: 20,
    },
    headerContainer: {
      marginBottom: 20,
    },
    statsContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#1f6feb",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: theme === "dark" ? "#cbd5e1" : "#64748b",
    },
    clearButtonText: {
      color: "#dc2626",
      fontWeight: "bold",
      textAlign: "right",
      marginTop: 10,
    },
    historyCard: {
      backgroundColor: theme === "dark" ? "#1e293b" : "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      margin: 5,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    cardInfo: {
      flex: 1,
    },
    timerName: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme === "dark" ? "#f1f5f9" : "#1e293b",
    },
    timerCategory: {
      color: theme === "dark" ? "#94a3b8" : "#64748b",
      marginTop: 2,
    },
    completedBadge: {
      backgroundColor: "#4ade80",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 6,
    },
    completedText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 12,
    },
    cardBody: {
      marginTop: 12,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    timeInfo: {
      flex: 1,
    },
    dateInfo: {
      flex: 1,
      alignItems: "flex-end",
    },
    durationLabel: {
      color: theme === "dark" ? "#cbd5e1" : "#94a3b8",
      fontSize: 13,
    },
    durationValue: {
      color: theme === "dark" ? "#f1f5f9" : "#0f172a",
      fontWeight: "bold",
      fontSize: 15,
      marginTop: 2,
    },
    dateLabel: {
      color: theme === "dark" ? "#cbd5e1" : "#94a3b8",
      fontSize: 13,
    },
    dateValue: {
      color: theme === "dark" ? "#f1f5f9" : "#0f172a",
      fontWeight: "bold",
      fontSize: 15,
      marginTop: 2,
    },
    cardActions: {
      marginTop: 16,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    restartButton: {
      backgroundColor: "#1f6feb",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
    },
    restartButtonText: {
      color: "#fff",
      fontWeight: "600",
    },
    emptyState: {
      alignItems: "center",
      marginTop: 100,
      paddingHorizontal: 20,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme === "dark" ? "#f8fafc" : "#1e293b",
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme === "dark" ? "#94a3b8" : "#64748b",
      textAlign: "center",
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: "center",
    },
  });
