import { useLocalSearchParams, useRouter } from "expo-router";
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
  user?: { Id?: number; Username?: string; DisplayName?: string };
  comments?: Comment[];
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPost = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getPost(id);
      setPost(data as Post);
      setEditText((data as Post)?.Text || "");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.me();
        setCurrentUser(me);
      } catch (err) {
        // ignore if not logged in
      }
    })();
  }, []);

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

  const handleDelete = async () => {
    if (!id) return;
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deletePost(id);
            router.back();
          } catch (err: any) {
            Alert.alert("Error", err.message || "Could not delete post");
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!id || !post) return;
    if (!editText.trim()) {
      Alert.alert("Validation", "Post text is required.");
      return;
    }
    try {
      setSaving(true);
      await api.updatePost(id, {
        Text: editText.trim(),
        ImageUrl: post.ImageUrl ?? null,
        VideoUrl: (post as any).VideoUrl ?? null,
      });
      await loadPost();
      setEditing(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not update post");
    } finally {
      setSaving(false);
    }
  };

  const hasMedia = !!post?.ImageUrl && post.ImageUrl.trim() !== "";
  const canManage = !!(
    currentUser &&
    post?.user &&
    ((post.user.Id && currentUser.Id === post.user.Id) || currentUser.Username === post.user?.Username)
  );

  return (
    <ThemedView style={styles.container}>
      {loading && !post ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : post ? (
        <>
          {canManage ? (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editAction]}
                onPress={() => setEditing((prev) => !prev)}
              >
                <ThemedText style={styles.editActionText}>{editing ? "Cancel" : "Edit"}</ThemedText>
              </TouchableOpacity>
              {editing ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryAction]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <ThemedText style={styles.primaryActionText}>
                    {saving ? "Saving..." : "Save"}
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.dangerAction]}
                  onPress={handleDelete}
                >
                  <ThemedText style={styles.dangerActionText}>Delete</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          <ThemedView style={styles.card}>
            <ThemedText type="defaultSemiBold">
              {post.user?.DisplayName || post.user?.Username || "User"}
            </ThemedText>
            {editing ? (
              <TextInput
                value={editText}
                onChangeText={setEditText}
                multiline
                textAlignVertical="top"
                style={styles.editInput}
              />
            ) : (
              <ThemedText style={styles.content}>{post.Text}</ThemedText>
            )}
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
  editInput: {
    minHeight: 140,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  actionButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  primaryAction: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },
  primaryActionText: {
    color: "#fff",
    fontWeight: "700",
  },
  dangerAction: {
    borderColor: "#ef4444",
  },
  dangerActionText: {
    color: "#ef4444",
    fontWeight: "700",
  },
});
