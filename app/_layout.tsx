// app/_layout.tsx
import { Slot } from "expo-router";
import Navbar from "../components/Navbar";
import { TimerProvider } from "../context/TimerContext";
import { SafeAreaView, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

export default function MainLayout() {
  const { theme } = useTheme();

  return (
    <ThemeProvider>
      <TimerProvider>
        <SafeAreaView
          style={[
            styles.safeArea,
            theme === "dark" && { backgroundColor: "#000" },
          ]}
        >
          <Navbar />
          <View
            style={[
              styles.content,
              theme === "dark" && { backgroundColor: "#111" },
            ]}
          >
            <Slot />
          </View>
          <Toast />
        </SafeAreaView>
      </TimerProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
});
