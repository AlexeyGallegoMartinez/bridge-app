import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type NotificationType = "service" | "social" | "system";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  timeAgo: string;
  unread: boolean;
  type: NotificationType;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Service request accepted",
    body: "Prompt Plumbing confirmed the job for tomorrow at 9 AM.",
    timeAgo: "5m",
    unread: true,
    type: "service",
  },
  {
    id: "n2",
    title: "New review received",
    body: "Maria left feedback on your last project. Tap to read.",
    timeAgo: "1h",
    unread: true,
    type: "social",
  },
  {
    id: "n3",
    title: "Reminder",
    body: "Add a preferred payment method to speed up booking.",
    timeAgo: "3h",
    unread: false,
    type: "system",
  },
  {
    id: "n4",
    title: "Bridge Update",
    body: "Version 2.1 is live with faster search and better filters.",
    timeAgo: "Yesterday",
    unread: false,
    type: "system",
  },
  {
    id: "n5",
    title: "Follow-up needed",
    body: "Leave a quick note for Hill Country Tutors about last week’s session.",
    timeAgo: "2d",
    unread: false,
    type: "service",
  },
];

const FILTERS: { label: string; value: NotificationType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Services", value: "service" },
  { label: "Social", value: "social" },
  { label: "System", value: "system" },
];

export default function NotificationsScreen() {
  const [filter, setFilter] =
    useState<(typeof FILTERS)[number]["value"]>("all");

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return NOTIFICATIONS;
    return NOTIFICATIONS.filter((item) => item.type === filter);
  }, [filter]);

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <ThemedView style={[styles.card, item.unread && styles.cardUnread]}>
      <View style={styles.cardHeader}>
        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.timeAgo}>{item.timeAgo}</ThemedText>
      </View>
      <ThemedText style={styles.cardBody}>{item.body}</ThemedText>
      <View style={styles.cardFooter}>
        <View style={styles.badge}>
          <MaterialIcons
            name={
              item.type === "service"
                ? "handyman"
                : item.type === "social"
                ? "people"
                : "info"
            }
            size={14}
            color="#0369a1"
          />
          <ThemedText style={styles.badgeText}>
            {item.type === "service"
              ? "Service"
              : item.type === "social"
              ? "Social"
              : "System"}
          </ThemedText>
        </View>
        {item.unread && <View style={styles.unreadDot} />}
      </View>
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <ThemedText type="title">Notifications</ThemedText>
              <ThemedText style={styles.subtitle}>
                Stay current on service updates, reviews, and system reminders.
              </ThemedText>
            </View>
            <View style={styles.filterRow}>
              {FILTERS.map((item) => {
                const isActive = filter === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.filterPill,
                      isActive && styles.filterPillActive,
                    ]}
                    onPress={() => setFilter(item.value)}
                    activeOpacity={0.85}
                  >
                    <ThemedText
                      style={[
                        styles.filterLabel,
                        isActive && styles.filterLabelActive,
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>
            You are all caught up. Check back later for new updates.
          </ThemedText>
        }
        ListFooterComponent={<View style={{ height: 32 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  header: {
    gap: 16,
    marginBottom: 4,
  },
  titleBlock: {
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#6b7280",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterPillActive: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },
  filterLabel: {
    color: "#64748b",
    fontSize: 14,
  },
  filterLabelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    flex: 1,
    marginRight: 12,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 21,
    color: "#7a94b9ff",
  },
  timeAgo: {
    fontSize: 13,
    color: "#94a3b8",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e0f2fe",
  },
  badgeText: {
    color: "#0369a1",
    fontSize: 13,
    fontWeight: "600",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f97316",
  },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 32,
  },
});
