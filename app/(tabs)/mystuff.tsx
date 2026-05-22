import React from "react";
import { View } from "react-native";
import { useMMKVString } from "react-native-mmkv";
import { Redirect } from "expo-router";
import useSWR from "swr";
import ScratchAPIWrapper from "../../utils/api-wrapper";
import InfiniteScrollContentList from "../../components/InfiniteScrollContentList";
import ItchyText from "../../components/ItchyText";
import { useTheme } from "../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsTablet } from "utils/hooks/useIsTablet";

const InfiniteScrollContentListAny: any = InfiniteScrollContentList;

export default function MyStuffScreen() {
  const [username] = useMMKVString("username");
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isTablet = useIsTablet();

  const { data: projects = [] } = useSWR<any[]>(
    username ? ["my-projects", username] : null,
    () => ScratchAPIWrapper.user.getProjects(username as string, 0),
  );

  if (!username) return <Redirect href="/login" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingHorizontal: isTablet ? 24 : 16,
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          width: "100%",
          maxWidth: 1100,
          alignSelf: "center",
        }}
      >
        <ItchyText style={{ color: colors.text, fontWeight: "700", fontSize: 20 }}>
          My Stuff
        </ItchyText>
      </View>
      <View style={{ flex: 1, width: "100%", maxWidth: 1100, alignSelf: "center" }}>
        <InfiniteScrollContentListAny
          data={projects}
          itemType="projects"
          onEndReached={() => {}}
        />
      </View>
    </View>
  );
}
