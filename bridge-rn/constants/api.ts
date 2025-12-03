import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

function resolveBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) return envUrl;

  // When running on a device, derive the LAN IP from the dev server host.
  const expoHost =
    Constants.expoConfig?.hostUri ||
    Constants.expoConfig?.debuggerHost ||
    Constants.manifest?.debuggerHost;
  const hostname = expoHost?.split(":")?.[0];
  if (hostname) return `http://${hostname}:8080`;

  // Android emulator uses a special host to reach localhost of the dev machine.
  if (Platform.OS === "android") return "http://10.0.2.2:8080";

  return "http://localhost:8080";
}

const BASE_URL = resolveBaseUrl();

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  auth?: boolean;
};

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await AsyncStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res
    .json()
    .catch(async () => {
      const text = await res.text().catch(() => "");
      return text ? { message: text } : {};
    });
  if (!res.ok) {
    const message =
      (data && (data.message as string)) ||
      `Request failed (HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""})`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  signup: (payload: {
    Username: string;
    Email: string;
    Password: string;
    DisplayName?: string;
  }) =>
    request<{ token: string; user: unknown }>("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    }),
  login: (payload: { Username: string; Password: string }) =>
    request<{ token: string; user: unknown }>("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    }),
  me: () => request<any>("/auth/me"),
  updatePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>("/auth/password", { method: "PUT", body: payload }),
  getPosts: () => request<any[]>("/posts"),
  getPost: (id: number | string) => request<any>(`/posts/${id}`),
  createPost: (payload: {
    Text: string;
    ImageUrl?: string | null;
    VideoUrl?: string | null;
  }) => request<any>("/posts", { method: "POST", body: payload }),
  updatePost: (
    id: number | string,
    payload: { Text?: string; ImageUrl?: string | null; VideoUrl?: string | null }
  ) => request<any>(`/posts/${id}`, { method: "PUT", body: payload }),
  deletePost: (id: number | string) => request<void>(`/posts/${id}`, { method: "DELETE" }),
  likePost: (id: number | string) => request<any>(`/posts/${id}/like`, { method: "POST" }),
  addComment: (payload: { PostId: number | string; Text: string }) =>
    request<any>("/comments", { method: "POST", body: payload }),
  searchPlaces: (params: { place?: string; lat?: number; lng?: number; radiusMeters?: number; keyword?: string }) => {
    const query = new URLSearchParams();
    if (params.place) query.append("place", params.place);
    if (params.lat) query.append("lat", String(params.lat));
    if (params.lng) query.append("lng", String(params.lng));
    if (params.radiusMeters) query.append("radius", String(params.radiusMeters));
    if (params.keyword) query.append("keyword", params.keyword);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<{ count: number; places: any[] }>(`/places${qs}`);
  },
};

export async function saveToken(token: string) {
  await AsyncStorage.setItem("token", token);
}

export async function clearToken() {
  await AsyncStorage.removeItem("token");
}

export async function getToken() {
  return AsyncStorage.getItem("token");
}
