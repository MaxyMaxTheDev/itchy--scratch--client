import React from "react";
import { View } from "react-native";
import { useMMKVString } from "react-native-mmkv";
import { Redirect } from "expo-router";
import useSWR from "swr";
import ScratchAPIWrapper from "../../utils/api-wrapper";
import InfiniteScrollContentList from "../../components/InfiniteScrollContentList";

const InfiniteScrollContentListAny: any = InfiniteScrollContentList;
import ItchyText from "../../components/ItchyText";
import { useTheme } from "../../utils/theme";

export default function MyStuffScreen() {
  const [username] = useMMKVString("username");
  const { colors } = useTheme();

  const { data: projects = [] } = useSWR<any[]>( 
    username ? ["my-projects", username] : null,
    () => ScratchAPIWrapper.user.getProjects(username as string, 0),
  );

  if (!username) return <Redirect href="/login" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <ItchyText style={{ color: colors.text, fontWeight: "700", fontSize: 20 }}>My Stuff</ItchyText>
      </View>
      <InfiniteScrollContentListAny
        data={projects}
        itemType="projects"
        onEndReached={() => {}}
      />
    </View>
  );
}
