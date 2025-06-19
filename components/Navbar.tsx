import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.navbar,
        {
          backgroundColor: isDark ? "#1e293b" : "#f9fafb",
          borderBottomColor: isDark ? "#334155" : "#ccc",
          shadowColor: isDark ? "#0f172a" : "#000",
        },
      ]}
    >
      <View style={styles.leftside}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image
            source={require("../assets/images/new_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.links}>
        {["/", "/add", "/history"].map((path, i) => (
          // @ts-ignore
          <TouchableOpacity key={i} onPress={() => router.push(path)}>
            <Text
              style={[styles.linkText, { color: isDark ? "#f1f5f9" : "#000" }]}
            >
              {path === "/"
                ? "Timers"
                : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dark Mode Toggle */}
      <Switch value={isDark} onValueChange={toggleTheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    margin: 10,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    elevation: 5,
  },
  leftside: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  logo: {
    width: 80,
    height: 24,
    marginRight: 8,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
