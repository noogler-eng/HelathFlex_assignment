import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useTheme } from "@/context/ThemeContext";

export default function Hero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={[styles.container]}>
      <Image
        source={require("../assets/images/new_logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text
        style={[styles.companyName, { color: isDark ? "#f1f5f9" : "#1e293b" }]}
      >
        HealthFlex
      </Text>
      <Text
        style={[styles.description, { color: isDark ? "#cbd5e1" : "#666" }]}
      >
        Your wellness companion to balance focus and mindful breaks.
      </Text>
      <MaskedView
        maskElement={
          <Text
            style={[
              styles.title,
              {
                color: isDark ? "#cbd5e1" : "#666",
                backgroundColor: "transparent",
              },
            ]}
          >
            Time Manager App
          </Text>
        }
      >
        <LinearGradient
          colors={["#00FF00", "#4ADFDA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        >
          <Text style={[styles.title, { opacity: 0 }]}>Time Manager App</Text>
        </LinearGradient>
      </MaskedView>
    </View>
  );
} // This closing brace was missing in your original code

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 250,
    height: 150,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});
