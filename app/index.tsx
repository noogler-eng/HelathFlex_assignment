import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
} from "react-native";
import { useTimers } from "../context/TimerContext";
import { useRouter } from "expo-router";
import TimerCard from "../components/TimerCard";
// import Hero from "@/components/Hero";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

export default function HomeScreen() {
  const { state, dispatch } = useTimers();
  const { theme } = useTheme();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const isDark = theme === "dark";

  const groupedTimers = state.timers.reduce((acc, timer) => {
    const category = timer.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(timer);
    return acc;
  }, {} as Record<string, typeof state.timers>);

  const toggleSection = (category: string) => {
    setExpandedSections((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const sections = Object.keys(groupedTimers).map((category) => ({
    title: category,
    data: expandedSections.includes(category) ? groupedTimers[category] : [],
  }));

  const renderTimerCard = ({ item }: { item: (typeof state.timers)[0] }) => (
    <TimerCard id={item.id} />
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => {
    const isExpanded = expandedSections.includes(title);

    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(title)}
      >
        {isExpanded ? (
          <ChevronDown size={20} color={isDark ? "#f1f5f9" : "#374151"} />
        ) : (
          <ChevronRight size={20} color={isDark ? "#f1f5f9" : "#374151"} />
        )}
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? "#f1f5f9" : "#374151" },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.sectionCount,
            { color: isDark ? "#cbd5e1" : "#6b7280" },
          ]}
        >
          ({groupedTimers[title]?.length || 0})
        </Text>
      </TouchableOpacity>
    );
  };

  const handleStartAll = () => {
    state.timers.forEach((timer) =>
      dispatch({ type: "START_TIMER", payload: timer.id })
    );
  };

  const handlePauseAll = () => {
    state.timers.forEach((timer) =>
      dispatch({ type: "PAUSE_TIMER", payload: timer.id })
    );
  };

  const handleDeleteAll = () => {
    state.timers.forEach((timer) =>
      dispatch({ type: "DELETE_TIMER", payload: timer.id })
    );
  };

  if (sections.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0f172a" : "#f8fafc" },
        ]}
      >
        {/* <Hero /> */}
        <Text style={[styles.title, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>
          All Timers
        </Text>
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.emptyText,
              { color: isDark ? "#e2e8f0" : "#374151" },
            ]}
          >
            No timers yet
          </Text>
          <Text
            style={[
              styles.emptySubtext,
              { color: isDark ? "#94a3b8" : "#6b7280" },
            ]}
          >
            Create your first timer to get started
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/add")}
          >
            <Text style={styles.createButtonText}>Create Timer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0f172a" : "#f8fafc" },
      ]}
    >
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderTimerCard}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* <Hero /> */}
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? "#f1f5f9" : "#1e293b" },
                ]}
              >
                All Timers
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push("/add")}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: "#10b981" }]}
                onPress={handleStartAll}
              >
                <Text style={styles.controlButtonText}>Start All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: "#f59e0b" }]}
                onPress={handlePauseAll}
              >
                <Text style={styles.controlButtonText}>Pause All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: "#ef4444" }]}
                onPress={handleDeleteAll}
              >
                <Text style={styles.controlButtonText}>Delete All</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginBlockEnd: 20,
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00ff9d",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  sectionCount: {
    fontSize: 16,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: "#1f6feb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
