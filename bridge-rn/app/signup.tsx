import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/hooks/use-auth";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function SignupScreen() {
  const [Username, setUsername] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [DisplayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!Username || !Email || !Password) {
      Alert.alert("Missing info", "Username, email, and password are required.");
      return;
    }
    try {
      setSubmitting(true);
      await signUp({ Username, Email, Password, DisplayName });
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Signup failed", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Create account
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Join Bridge to connect and share with the community.
      </ThemedText>
      <TextInput
        placeholder="Username"
        value={Username}
        onChangeText={setUsername}
        style={styles.input}
        placeholderTextColor="#9ca3af"
      />
      <TextInput
        placeholder="Email"
        value={Email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#9ca3af"
      />
      <TextInput
        placeholder="Password"
        value={Password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#9ca3af"
      />
      <TextInput
        placeholder="Display name (optional)"
        value={DisplayName}
        onChangeText={setDisplayName}
        style={styles.input}
        placeholderTextColor="#9ca3af"
      />
      <Button title={submitting ? "Creating..." : "Sign Up"} onPress={handleSignup} disabled={submitting} />
      {submitting && <ActivityIndicator style={{ marginTop: 12 }} />}
      <TouchableOpacity onPress={() => router.replace("/login")} style={{ marginTop: 12 }}>
        <ThemedText style={styles.link}>Already have an account? Login</ThemedText>
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
