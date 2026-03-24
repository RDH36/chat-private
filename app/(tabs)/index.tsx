import { useState, useEffect, useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instant";
import { isRoomActive, cleanupExpiredRooms } from "@/lib/room";
import { useCurrentUser } from "@/lib/identity";
import { theme } from "@/lib/theme";
import { HomeHeader } from "@/components/home/HomeHeader";
import { RoomCard } from "@/components/home/RoomCard";
import { RoomListSkeleton } from "@/components/home/RoomCardSkeleton";
import { SearchBar } from "@/components/home/SearchBar";

export default function PublicRoomsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useCurrentUser();
  const senderId = user?.id ?? "";
  const [search, setSearch] = useState("");

  const roomsQuery = db.useQuery({
    rooms: { $: { order: { createdAt: "desc" as const } } },
  });
  const allRooms = roomsQuery.data?.rooms ?? [];

  useEffect(() => {
    if (allRooms.length > 0) cleanupExpiredRooms(allRooms);
  }, [allRooms]);

  const publicRooms = useMemo(() => {
    const active = allRooms.filter((r) => isRoomActive(r) && r.isPublic);
    if (!search.trim()) return active;
    const q = search.trim().toLowerCase();
    return active.filter((r) => {
      const name = (r.name || r.roomId).toLowerCase();
      return name.includes(q) || r.roomId.toLowerCase().includes(q);
    });
  }, [allRooms, search]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <HomeHeader />

        <SearchBar value={search} onChangeText={setSearch} placeholder={t("home.searchPlaceholder")} />

        <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
          {t("home.publicRooms", { count: publicRooms.length })}
        </Text>

        {roomsQuery.isLoading ? (
          <RoomListSkeleton />
        ) : publicRooms.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 15 }}>
              {search ? t("home.noResult") : t("home.noPublicRoom")}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 4 }}>
              {search ? t("home.tryOther") : t("home.createPublicHint")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={publicRooms}
            keyExtractor={(r) => r.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <RoomCard
                room={item}
                senderId={senderId}
                onPress={() => router.push(`/chat/${item.roomId}`)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
