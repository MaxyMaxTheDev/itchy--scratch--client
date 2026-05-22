import { Stack } from "expo-router";
import { View } from "react-native";
import WebView from "react-native-webview";
import { useTheme } from "../utils/theme";

const isBlockedScratchRootUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    const isScratch =
      url.hostname === "scratch.mit.edu" ||
      url.hostname.endsWith(".scratch.mit.edu");
    const isRoot = url.pathname === "/" || url.pathname === "";
    return isScratch && isRoot;
  } catch {
    return false;
  }
};

export default function RegisterScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: "Create Scratch Account" }} />
      <WebView
        source={{ uri: "https://scratch.mit.edu/join" }}
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={(request) =>
          !isBlockedScratchRootUrl(request.url)
        }
      />
    </View>
  );
}
