import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/constants/api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";

type SettingSection = {
  id: string;
  title: string;
  items: SettingItem[];
};

type SettingItem = {
  id: string;
  label: string;
  description?: string;
  type: "nav" | "toggle";
  value?: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const SETTINGS_SECTIONS: SettingSection[] = [
  {
    id: "profile",
    title: "Profile",
    items: [
      {
        id: "account",
        label: "Account details",
        description: "Name, email, and phone",
        type: "nav",
        icon: "person-outline",
      },
      {
        id: "preferences",
        label: "Preferences",
        description: "Categories, distance, availability",
        type: "nav",
        icon: "tune",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    items: [
      {
        id: "password",
        label: "Password & login",
        description: "Change password, 2FA",
        type: "nav",
        icon: "lock",
      },
      {
        id: "devices",
        label: "Trusted devices",
        description: "Manage where you’re signed in",
        type: "nav",
        icon: "devices",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    items: [
      {
        id: "push",
        label: "Push notifications",
        description: "Service updates, mentions, reminders",
        type: "toggle",
        value: true,
        icon: "notifications-none",
      },
      {
        id: "email",
        label: "Email updates",
        description: "Digest, product news, surveys",
        type: "toggle",
        value: false,
        icon: "mail-outline",
      },
    ],
  },
  {
    id: "support",
    title: "Support",
    items: [
      {
        id: "help",
        label: "Help center",
        description: "FAQs & troubleshooting",
        type: "nav",
        icon: "help-outline",
      },
      {
        id: "contact",
        label: "Contact support",
        description: "Chat or email our team",
        type: "nav",
        icon: "chat-bubble-outline",
      },
    ],
  },
];

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [user, setUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    push: true,
    email: false,
  });
  const [activeModal, setActiveModal] = useState<"account" | "password" | "help" | "contact" | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingUser(true);
        const me = await api.me();
        setUser(me);
      } catch (err: any) {
        console.error("Failed to load profile", err);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      Alert.alert("Missing info", "Enter your current and new password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }
    try {
      setUpdatingPassword(true);
      await api.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      Alert.alert("Success", "Password updated.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleHelpCenter = () => {
    Linking.openURL("https://support.bridge.app");
  };

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@bridge.app?subject=Help%20with%20Bridge");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={SETTINGS_SECTIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ThemedView style={styles.sectionCard}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {item.title}
            </ThemedText>
            {item.items.map((setting) => (
              <TouchableOpacity
                key={setting.id}
                style={styles.settingRow}
                activeOpacity={0.8}
                onPress={() => {
                  if (setting.type === "nav") {
                    if (setting.id === "account") setActiveModal("account");
                    if (setting.id === "password") setActiveModal("password");
                    if (setting.id === "help") setActiveModal("help");
                    if (setting.id === "contact") setActiveModal("contact");
                  }
                }}
                disabled={setting.type === "toggle"}
              >
                <View style={styles.iconWrapper}>
                  <MaterialIcons
                    name={setting.icon}
                    size={20}
                    color="#0f172a"
                  />
                </View>
                <View style={styles.settingBody}>
                  <ThemedText style={styles.settingLabel}>
                    {setting.label}
                  </ThemedText>
                  {setting.description && (
                    <ThemedText style={styles.settingDescription}>
                      {setting.description}
                    </ThemedText>
                  )}
                </View>
                {setting.type === "nav" ? (
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color="#94a3b8"
                  />
                ) : (
                  <Switch
                    value={notificationPrefs[setting.id as "push" | "email"]}
                    onValueChange={(val) =>
                      setNotificationPrefs((prev) => ({ ...prev, [setting.id]: val }))
                    }
                  />
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerBar}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.headerIcon}
              />
              <ThemedText type="title">Settings</ThemedText>
            </View>
            <View style={styles.headerRow}>
              <ThemedText type="defaultSemiBold">Your space</ThemedText>
            </View>
            <ThemedText style={styles.headerSubtitle}>
              Customize your account, privacy, and notifications.
            </ThemedText>
            <TouchableOpacity style={styles.profileButton} activeOpacity={0.85} onPress={() => setActiveModal("account")}>
              <View>
                <ThemedText type="defaultSemiBold">
                  {loadingUser ? "Loading..." : user?.DisplayName || user?.Username || "Account"}
                </ThemedText>
                <ThemedText style={styles.profileEmail}>
                  {user?.Email || ""}
                </ThemedText>
              </View>
              <ThemedText style={styles.manageProfileLabel}>
                Manage profile
              </ThemedText>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity style={styles.linkRow} activeOpacity={0.8}>
              <ThemedText style={styles.linkText}>Terms of Service</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} activeOpacity={0.8}>
              <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} activeOpacity={0.8} onPress={() => signOut()}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ThemedText style={[styles.linkText, styles.dangerText]}>Sign out</ThemedText>
                <MaterialIcons name="logout" size={18} color="#ef4444" />
              </View>
            </TouchableOpacity>
          </View>
        }
      />
      <Modal visible={activeModal === "account"} animationType="slide" transparent>
        <View style={styles.fullscreenModal}>
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <MaterialIcons name="close" size={24} color="#e5e7eb" />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.modalTitle}>Account details</ThemedText>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.modalBody}>
            <View style={styles.accountRow}>
              <ThemedText style={styles.accountLabel}>Username</ThemedText>
              <ThemedText style={styles.accountValue}>{user?.Username || "—"}</ThemedText>
            </View>
            <View style={styles.accountRow}>
              <ThemedText style={styles.accountLabel}>Email</ThemedText>
              <ThemedText style={styles.accountValue}>{user?.Email || "—"}</ThemedText>
            </View>
            <View style={styles.accountRow}>
              <ThemedText style={styles.accountLabel}>Display name</ThemedText>
              <ThemedText style={styles.accountValue}>{user?.DisplayName || "—"}</ThemedText>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === "password"} animationType="slide" transparent>
        <View style={styles.fullscreenModal}>
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <MaterialIcons name="close" size={24} color="#e5e7eb" />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.modalTitle}>Password & Login</ThemedText>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.modalBody}>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.settingLabel}>Current password</ThemedText>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(t) => setPasswordForm((p) => ({ ...p, currentPassword: t }))}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.settingLabel}>New password</ThemedText>
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(t) => setPasswordForm((p) => ({ ...p, newPassword: t }))}
                placeholder="New password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.settingLabel}>Confirm new password</ThemedText>
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(t) => setPasswordForm((p) => ({ ...p, confirmPassword: t }))}
                placeholder="Confirm password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
              />
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePasswordUpdate}
              disabled={updatingPassword}
              activeOpacity={0.85}
            >
              <ThemedText style={styles.primaryButtonText}>
                {updatingPassword ? "Updating..." : "Update password"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === "help"} animationType="slide" transparent>
        <View style={styles.fullscreenModal}>
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <MaterialIcons name="close" size={24} color="#e5e7eb" />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.modalTitle}>Help Center</ThemedText>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.modalBody}>
            <ThemedText style={styles.settingDescription}>
              Browse FAQs and troubleshooting guides in our help center.
            </ThemedText>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleHelpCenter}>
              <ThemedText style={styles.secondaryButtonText}>Open help center</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === "contact"} animationType="slide" transparent>
        <View style={styles.fullscreenModal}>
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <MaterialIcons name="close" size={24} color="#e5e7eb" />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.modalTitle}>Contact Support</ThemedText>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.modalBody}>
            <ThemedText style={styles.settingDescription}>
              Email our team and we’ll get back to you shortly.
            </ThemedText>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleContactSupport}>
              <ThemedText style={styles.secondaryButtonText}>Email support</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 12,
    marginBottom: 4,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSubtitle: {
    color: "#6b7280",
    fontSize: 16,
    lineHeight: 22,
  },
  profileButton: {
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileEmail: {
    color: "#6b7280",
  },
  manageProfileLabel: {
    color: "#0ea5e9",
    fontWeight: "600",
  },
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: "#ffffffff",
    fontWeight: "bold",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  settingBody: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDescription: {
    color: "#6b7280",
    fontSize: 13,
  },
  accountCard: {
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accountLabel: {
    color: "#cbd5e1",
  },
  accountValue: {
    fontWeight: "600",
    color: "#f8fafc",
  },
  fieldGroup: {
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#0ea5e9",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  supportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: "#0369a1",
    fontWeight: "600",
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: "#0b1220",
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  fullscreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalBody: {
    gap: 12,
  },
  footer: {
    marginTop: 8,
    gap: 12,
  },
  linkRow: {
    paddingVertical: 8,
  },
  linkText: {
    color: "#0ea5e9",
    fontSize: 15,
  },
  dangerText: {
    color: "#ef4444",
  },
});
