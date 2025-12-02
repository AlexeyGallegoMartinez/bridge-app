import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { api } from "@/constants/api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type Comment = {
  Id: number;
  Text: string;
  user?: { Username?: string; DisplayName?: string };
};

type Post = {
  Id: number;
  Text: string;
  ImageUrl?: string | null;
  user?: { Username?: string; DisplayName?: string };
  comments?: Comment[];
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPost = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getPost(id);
      setPost(data as Post);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  const submitComment = async () => {
    if (!commentText.trim() || !id) return;
    try {
      await api.addComment({ PostId: id, Text: commentText.trim() });
      setCommentText("");
      await loadPost();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not add comment");
    }
  };

  const hasMedia = !!post?.ImageUrl && post.ImageUrl.trim() !== "";

  return (
    <ThemedView style={styles.container}>
      {loading && !post ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : post ? (
        <>
          <ThemedView style={styles.card}>
            <ThemedText type="defaultSemiBold">
              {post.user?.DisplayName || post.user?.Username || "User"}
            </ThemedText>
            <ThemedText style={styles.content}>{post.Text}</ThemedText>
            {hasMedia ? <Image source={{ uri: post.ImageUrl }} style={styles.media} /> : null}
          </ThemedView>

          <ThemedText type="subtitle" style={{ marginVertical: 8 }}>
            Comments
          </ThemedText>
          <FlatList
            data={post.comments || []}
            keyExtractor={(item) => String(item.Id)}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <ThemedText style={styles.commentAuthor}>
                  {item.user?.DisplayName || item.user?.Username || "User"}
                </ThemedText>
                <ThemedText style={styles.commentBubble}>{item.Text}</ThemedText>
              </View>
            )}
            ListEmptyComponent={<ThemedText style={{ color: "#6b7280" }}>No comments yet.</ThemedText>}
            contentContainerStyle={styles.commentsContainer}
          />

          <View style={styles.commentInputRow}>
            <TextInput
              placeholder="Add a comment"
              value={commentText}
              onChangeText={setCommentText}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={styles.sendButton} onPress={submitComment}>
              <ThemedText style={styles.sendLabel}>Send</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ThemedText>Post not found</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 30,
    gap: 10,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  content: {
    fontSize: 16,
  },
  media: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
  commentRow: {
    paddingVertical: 8,
    gap: 6,
  },
  commentAuthor: {
    fontWeight: "600",
    color: "#374151",
  },
  commentBubble: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    color: "#111827",
  },
  commentsContainer: {
    paddingBottom: 12,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendLabel: {
    color: "#fff",
    fontWeight: "600",
  },
});
