import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";

import { api } from "@/constants/api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function CreatePostScreen() {
  const router = useRouter();
  const [TextValue, setTextValue] = useState("");
  const [ImageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!TextValue.trim()) {
      Alert.alert("Validation", "Post text is required.");
      return;
    }
    try {
      setSubmitting(true);
      await api.createPost({ Text: TextValue.trim(), ImageUrl: ImageUrl || null });
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 12 }}>
        New Post
      </ThemedText>
      <TextInput
        placeholder="What's on your mind?"
        multiline
        value={TextValue}
        onChangeText={setTextValue}
        style={[styles.input, { height: 140 }]}
        placeholderTextColor="#9ca3af"
      />
      <TextInput
        placeholder="Image URL (optional)"
        value={ImageUrl}
        onChangeText={setImageUrl}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#9ca3af"
      />
      <Button title={submitting ? "Posting..." : "Post"} onPress={handleSubmit} disabled={submitting} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
});
