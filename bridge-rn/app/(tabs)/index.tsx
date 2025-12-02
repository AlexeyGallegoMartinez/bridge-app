import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "@/constants/api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";

type Post = {
  Id: number;
  Text: string;
  ImageUrl?: string | null;
  LikesCount?: number;
  CommentsCount?: number;
  likedByUser?: boolean;
  user?: { Username?: string; DisplayName?: string; AvatarUrl?: string };
};

const ACTIONS = [
  { key: "like", icon: "favorite-border", label: "Like" },
  { key: "comment", icon: "mode-comment", label: "Comment" },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [liking, setLiking] = useState<number | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPosts();
      setPosts(data as Post[]);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const handleLike = async (postId: number) => {
    try {
      setLiking(postId);
      const res = (await api.likePost(postId)) as { LikesCount?: number; liked?: boolean };
      setPosts((prev) =>
        prev.map((p) =>
          p.Id === postId
            ? {
                ...p,
                LikesCount: res?.LikesCount ?? p.LikesCount ?? 0,
                likedByUser: res?.liked ?? p.likedByUser ?? false,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to like post", err);
    } finally {
      setLiking(null);
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    const hasMedia = !!item.ImageUrl && item.ImageUrl.trim() !== "";
    const isLiked = !!item.likedByUser;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: "/post", params: { id: String(item.Id) } })}
        style={{ marginBottom: 14 }}
      >
        <ThemedView style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image source={require("@/assets/images/icon.png")} style={styles.avatar} />
            <View>
              <ThemedText type="defaultSemiBold">
                {item.user?.DisplayName || item.user?.Username || "User"}
              </ThemedText>
              <ThemedText style={styles.handle}>@{item.user?.Username || "user"}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.content}>{item.Text}</ThemedText>
          {hasMedia ? (
            <Image source={{ uri: item.ImageUrl! }} style={styles.media} resizeMode="cover" borderRadius={16} />
          ) : null}
          <View style={styles.actionsRow}>
            {ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.actionButton}
                activeOpacity={0.75}
                onPress={() =>
                  action.key === "like"
                    ? handleLike(item.Id)
                    : router.push({ pathname: "/post", params: { id: String(item.Id) } })
                }
                disabled={action.key === "like" && liking === item.Id}
              >
                <MaterialIcons
                  name={
                    action.key === "like"
                      ? isLiked || liking === item.Id
                        ? "favorite"
                        : "favorite-border"
                      : action.icon
                  }
                  size={20}
                  color={action.key === "like" && (isLiked || liking === item.Id) ? "#ef4444" : "#6b7280"}
                />
                <ThemedText style={styles.actionLabel}>
                  {action.label}{" "}
                  {action.key === "like" ? item.LikesCount || 0 : item.CommentsCount || 0}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image source={require("@/assets/images/icon.png")} style={styles.headerIcon} />
        <ThemedText type="title">Bridge</ThemedText>
        <TouchableOpacity onPress={() => signOut()}>
          <MaterialIcons name="logout" size={22} color="#6b7280" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => String(item.Id)}
        contentContainerStyle={styles.feed}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPosts} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 32 }} />
          ) : (
            <ThemedText style={styles.emptyText}>No posts yet.</ThemedText>
          )
        }
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/create-post")} activeOpacity={0.85}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerIcon: {
    width: 34,
    height: 34,
    marginRight: 12,
    borderRadius: 8,
  },
  feed: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  postCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  handle: {
    color: "#6b7280",
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  media: {
    width: "100%",
    height: 200,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionLabel: {
    color: "#6b7280",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },
});
