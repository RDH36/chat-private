import { View } from "react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/lib/theme";

export function RoomCardSkeleton() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: 14,
        padding: 16,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="55%" height={18} borderRadius={6} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Skeleton width={70} height={12} borderRadius={4} />
          <Skeleton width={90} height={12} borderRadius={4} />
        </View>
      </View>
      <Skeleton width={18} height={18} borderRadius={9} />
    </View>
  );
}

export function RoomListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <RoomCardSkeleton key={i} />
      ))}
    </View>
  );
}
