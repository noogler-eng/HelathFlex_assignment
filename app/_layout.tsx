// app/_layout.tsx
import { Slot } from "expo-router";
import Navbar from "../components/Navbar";
import { TimerProvider } from "../context/TimerContext";
import { StyleSheet, View, StatusBar, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

function LayoutContent() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme === "dark" ? "#000" : "#fff"}
      />
      <SafeAreaView
        style={[styles.safeArea, theme === "dark" && styles.darkSafeArea]}
        edges={["top", "left", "right"]} // Let bottom be handled by individual screens if needed
      >
        <TimerProvider>
          <Navbar />
          <View
            style={[styles.content, theme === "dark" && styles.darkContent]}
          >
            <Slot />
          </View>
          <Toast />
        </TimerProvider>
      </SafeAreaView>
    </>
  );
}

export default function MainLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LayoutContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  darkSafeArea: {
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: "#fff",
  },
  darkContent: {
    backgroundColor: "#111",
  },
});
