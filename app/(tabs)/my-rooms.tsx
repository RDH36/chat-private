import { useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instant";
import { isRoomActive, isRoomMember } from "@/lib/room";
import { useCurrentUser } from "@/lib/identity";
import { theme } from "@/lib/theme";
import { RoomCard } from "@/components/home/RoomCard";
import { RoomListSkeleton } from "@/components/home/RoomCardSkeleton";

export default function MyRoomsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useCurrentUser();
  const senderId = user?.id ?? "";

  const roomsQuery = db.useQuery({
    rooms: { $: { order: { createdAt: "desc" as const } } },
  });
  const allRooms = roomsQuery.data?.rooms ?? [];

  const myRooms = useMemo(
    () => allRooms.filter((r) => isRoomActive(r) && isRoomMember(r.members, senderId)),
    [allRooms, senderId]
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={{ marginTop: 16, marginBottom: 24 }}>
          <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "bold" }}>{t("tabs.rooms")}</Text>
        </View>

        <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
          {t("home.joinedRooms", { count: myRooms.length })}
        </Text>

        {roomsQuery.isLoading ? (
          <RoomListSkeleton />
        ) : myRooms.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 15 }}>{t("home.noRoom")}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 4 }}>
              {t("home.joinHint")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={myRooms}
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
