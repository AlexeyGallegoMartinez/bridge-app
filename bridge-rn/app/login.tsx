import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing info", "Please enter your username and password.");
      return;
    }
    try {
      setSubmitting(true);
      await signIn({ Username: username, Password: password });
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Login failed", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Login
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Sign in to see your feed and post updates.
      </ThemedText>
      <TextInput
        placeholder="Username"
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#9ca3af"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#9ca3af"
        value={password}
        onChangeText={setPassword}
      />
      <Button title={submitting ? "Signing in..." : "Login"} onPress={handleLogin} disabled={submitting} />
      {submitting && <ActivityIndicator style={{ marginTop: 12 }} />}
      <TouchableOpacity onPress={() => router.replace("/signup")} style={{ marginTop: 12 }}>
        <ThemedText style={styles.link}>Need an account? Sign up</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  link: {
    color: "#2563eb",
    textAlign: "center",
  },
});
