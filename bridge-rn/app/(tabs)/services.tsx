import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/constants/api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type ServicePlace = {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  coordinate?: { latitude: number; longitude: number };
  googleMapsUri?: string;
  phoneNumber?: string;
  website?: string;
};

const FALLBACK_COORDINATE = { latitude: 30.2672, longitude: -97.7431 };
const MILES_TO_METERS = 1609.34;

export default function ServicesScreen() {
  const [cityQuery, setCityQuery] = useState("Austin");
  const [radiusMiles, setRadiusMiles] = useState("10");
  const [addressQuery, setAddressQuery] = useState("");
  const [services, setServices] = useState<ServicePlace[]>([]);
  const [selected, setSelected] = useState<ServicePlace | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [region, setRegion] = useState<Region>({
    ...FALLBACK_COORDINATE,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  });
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(coords);
      setRegion((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    })();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const radiusValue = Number(radiusMiles);
      const radiusMeters = Number.isFinite(radiusValue)
        ? Math.round(radiusValue * MILES_TO_METERS)
        : undefined;
      const placeQuery = addressQuery.trim() || cityQuery.trim() || undefined;

      const params: any = {};
      if (placeQuery) {
        params.place = placeQuery;
        params.radiusMeters = radiusMeters ?? Math.round(50 * MILES_TO_METERS);
      } else {
        params.lat = userLocation?.latitude;
        params.lng = userLocation?.longitude;
        params.radiusMeters = radiusMeters;
      }

      const res = await api.searchPlaces(params);

      const mapped: ServicePlace[] = (res.places || []).map((item: any) => ({
        id: item.id || item.place_id || Math.random().toString(),
        name: item.name,
        address: item.address,
        rating: item.rating,
        userRatingsTotal: item.userRatingsTotal,
        coordinate:
          item.location?.lat && item.location?.lng
            ? { latitude: item.location.lat, longitude: item.location.lng }
            : undefined,
        googleMapsUri: item.googleMapsUri,
        phoneNumber: item.phoneNumber,
        website: item.website,
      }));

      setServices(mapped);
      if (mapped[0]?.coordinate) {
        focusOnPlace(mapped[0]);
      }
    } catch (err) {
      console.error("Failed to search places", err);
    } finally {
      setLoading(false);
    }
  };

  const focusOnPlace = (place: ServicePlace) => {
    if (!place.coordinate) return;
    setSelected(place);
    const targetRegion = {
      latitude: place.coordinate.latitude,
      longitude: place.coordinate.longitude,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    };
    setRegion(targetRegion);
    mapRef.current?.animateToRegion(targetRegion, 350);
  };

  const renderService = ({ item }: { item: ServicePlace }) => (
    <TouchableOpacity activeOpacity={0.85} onPress={() => focusOnPlace(item)}>
      <ThemedView style={styles.serviceCard}>
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.cardTitle}
              numberOfLines={3}
            >
              {item.name}
            </ThemedText>
            {item.rating ? (
              <ThemedText style={styles.distance}>
                ⭐ {item.rating.toFixed(1)}
              </ThemedText>
            ) : null}
          </View>
          <ThemedText style={styles.address}>{item.address}</ThemedText>
          <View style={styles.metaRow}>
            {item.userRatingsTotal ? (
              <ThemedText style={styles.metaText}>
                {item.userRatingsTotal} reviews
              </ThemedText>
            ) : null}
          </View>
          {item.phoneNumber ? (
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaText}>{item.phoneNumber}</ThemedText>
            </View>
          ) : null}
          {(item.googleMapsUri || item.website) ? (
            <View style={styles.mapButtonsRow}>
              {item.googleMapsUri ? (
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => Linking.openURL(item.googleMapsUri || "")}
                >
                  <ThemedText style={styles.mapButtonText}>Open in Maps</ThemedText>
                </TouchableOpacity>
              ) : null}
              {item.website ? (
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => Linking.openURL(item.website || "")}
                >
                  <ThemedText style={styles.mapButtonText}>Website</ThemedText>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );

  const recenter = () => {
    const target = userLocation || FALLBACK_COORDINATE;
    const targetRegion = {
      latitude: target.latitude,
      longitude: target.longitude,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
    setRegion(targetRegion);
    mapRef.current?.animateToRegion(targetRegion, 300);
  };

  const MapShell = () => (
    <View style={[styles.mapWrapper, styles.mapWrapperExpanded]}>
      <View style={styles.mapHeader}>
        <ThemedText type="subtitle">Map preview</ThemedText>
        <ThemedText style={styles.mapMeta}>
          {services.length} results
        </ThemedText>
      </View>
      <View style={styles.mapContainer}>
        <MapView
          ref={(ref) => (mapRef.current = ref)}
          style={[styles.mapSurface, styles.mapSurfaceCompact]}
          region={region}
          onRegionChangeComplete={(r) => setRegion(r)}
          showsUserLocation={!!userLocation}
        >
          {userLocation ? (
            <Marker coordinate={userLocation} title="You" pinColor="#2563eb" />
          ) : (
            <Marker
              coordinate={FALLBACK_COORDINATE}
              title="Austin"
              pinColor="#2563eb"
            />
          )}
          {services.map((svc) =>
            svc.coordinate ? (
              <Marker
                key={svc.id}
                coordinate={svc.coordinate}
                title={svc.name}
                description={svc.address}
                pinColor="#0ea5e9"
                onPress={() => focusOnPlace(svc)}
              />
            ) : null
          )}
        </MapView>
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={recenter}
          activeOpacity={0.8}
        >
          <MaterialIcons name="my-location" size={18} color="#0ea5e9" />
          <ThemedText style={styles.recenterLabel}>Recenter</ThemedText>
        </TouchableOpacity>
      </View>
      {selected ? (
        <ThemedView style={styles.selectedCard}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            {selected.name}
          </ThemedText>
          <ThemedText style={styles.address}>{selected.address}</ThemedText>
          <View style={styles.metaRow}>
            {selected.rating ? (
              <ThemedText style={styles.metaText}>
                ⭐ {selected.rating.toFixed(1)}
              </ThemedText>
            ) : null}
            {selected.userRatingsTotal ? (
              <ThemedText style={styles.metaText}>
                {selected.userRatingsTotal} reviews
              </ThemedText>
            ) : null}
          </View>
        </ThemedView>
      ) : (
        <ThemedText style={styles.mapHint}>
          Tap a pin or card to preview details.
        </ThemedText>
      )}
    </View>
  );

  const filterSection = (
    <View style={styles.listHeader}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Find Services
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Search by city, radius, or address to see nearby providers on the map.
        </ThemedText>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>City</ThemedText>
          <TextInput
            value={cityQuery}
            onChangeText={setCityQuery}
            placeholder="e.g. Austin"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            selectionColor="#38bdf8"
          />
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Radius (miles)</ThemedText>
          <TextInput
            value={radiusMiles}
            onChangeText={setRadiusMiles}
            keyboardType="numeric"
            placeholder="10"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            selectionColor="#38bdf8"
          />
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Address (optional)</ThemedText>
          <TextInput
            value={addressQuery}
            onChangeText={setAddressQuery}
            placeholder="Street, neighborhood, etc."
            placeholderTextColor="#9ca3af"
            style={styles.input}
            selectionColor="#38bdf8"
          />
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          activeOpacity={0.85}
          onPress={handleSearch}
          disabled={loading}
        >
          <ThemedText style={styles.searchButtonText}>
            {loading ? "Searching..." : "Search"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {filterSection}
            <MapShell />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <ThemedText style={styles.emptyText}>
              Search to see nearby providers.
            </ThemedText>
          )
        }
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  listHeader: {
    gap: 14,
  },
  header: {
    gap: 6,
    alignItems: "center",
  },
  headerTitle: {
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  searchSection: {
    borderRadius: 18,
    padding: 14,
    gap: 12,
    backgroundColor: "#111827",
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: "#9ca3af",
  },
  input: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#1f2937",
  },
  searchButton: {
    backgroundColor: "#0ea5e9",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  viewToggle: {
    display: "none",
  },
  toggleButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  toggleLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  toggleLabelActive: {
    color: "#0f172a",
    fontWeight: "600",
  },
  mapWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 12,
    gap: 10,
    backgroundColor: "#0b1220",
    position: "relative",
  },
  mapWrapperExpanded: {
    borderColor: "#1f2937",
    backgroundColor: "#0b1220",
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapMeta: {
    color: "#e5e7eb",
  },
  mapSurface: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  mapContainer: {
    position: "relative",
  },
  mapSurfaceCompact: {
    height: 280,
  },
  mapSurfaceFull: {
    height: 440,
  },
  mapHint: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 10,
  },
  serviceCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#0f172a",
  },
  cardBody: {
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // flexWrap: "wrap",
  },
  cardTitle: {
    color: "#f8fafc",
    width: "70%",
  },
  distance: {
    color: "#e5e7eb",
  },
  address: {
    color: "#cbd5e1",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  recenterButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    zIndex: 2,
  },
  recenterLabel: {
    color: "#0f172a",
    fontWeight: "600",
  },
  metaText: {
    color: "#e5e7eb",
  },
  metaDivider: {
    color: "#cbd5f5",
  },
  link: {
    color: "#0ea5e9",
    fontWeight: "600",
  },
  mapButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  mapButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#0ea5e9",
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  mapButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  selectedCard: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
});
