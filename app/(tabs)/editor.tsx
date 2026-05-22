import React, { useMemo, useRef, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsTablet } from "utils/hooks/useIsTablet";
import WebView from "react-native-webview";
import { useMMKVObject, useMMKVString } from "react-native-mmkv";
import { useTheme } from "../../utils/theme";
import ItchyText from "../../components/ItchyText";
import ScratchAPIWrapper from "../../utils/api-wrapper";

interface UserData {
  username: string;
  token: string;
}

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

const injectedLogoBlocker = `
(function () {
  const shouldBlock = (href) => {
    if (!href) return false;
    try {
      const url = new URL(href, window.location.origin);
      const isScratch = url.hostname === 'scratch.mit.edu' || url.hostname.endsWith('.scratch.mit.edu');
      const isRoot = url.pathname === '/' || url.pathname === '';
      return isScratch && isRoot;
    } catch (e) {
      return false;
    }
  };

  const neutralizeLinks = () => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (shouldBlock(href)) {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
        }, { capture: true });
      }
    });
  };

  neutralizeLinks();
  const observer = new MutationObserver(neutralizeLinks);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
true;
`;

export default function EditorScreen() {
  const { colors } = useTheme();
  const [user] = useMMKVObject<UserData | null>("user");
  const insets = useSafeAreaInsets();
  const isTablet = useIsTablet();
  const [csrf] = useMMKVString("csrfToken");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const webRef = useRef<WebView>(null);

  const editorUrl = useMemo(() => {
    const usernameParam = user?.username
      ? `?username=${encodeURIComponent(user.username)}`
      : "";

    if (currentProjectId) {
      return `https://scratch.mit.edu/projects/${currentProjectId}/editor${usernameParam}`;
    }

    return `https://scratch.mit.edu/projects/editor/${usernameParam}`;
  }, [currentProjectId, user?.username]);

  const onShare = async () => {
    if (!user?.username || !user?.token || !csrf || !currentProjectId) {
      Alert.alert(
        "Cannot Share",
        "Open a project while logged in before sharing.",
      );
      return;
    }
    try {
      await ScratchAPIWrapper.project.shareProject(currentProjectId, user.token, csrf);
      Alert.alert("Shared", "Project was shared to Scratch.");
    } catch (e) {
      Alert.alert("Share Failed", "Could not share project to Scratch.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: isTablet ? 24 : 16,
          paddingTop: insets.top + 8,
          paddingBottom: 10,
          width: "100%",
          maxWidth: 1100,
          alignSelf: "center",
        }}
      >
        <ItchyText style={{ color: colors.text, fontWeight: "700", fontSize: 18 }}>
          Scratch Editor
        </ItchyText>
        <TouchableOpacity
          onPress={onShare}
          style={{
            backgroundColor: colors.accent,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
          }}
        >
          <ItchyText style={{ color: "white", fontWeight: "600" }}>
            Share
          </ItchyText>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, width: "100%", maxWidth: 1100, alignSelf: "center" }}>
      <WebView
        ref={webRef}
        source={{ uri: editorUrl }}
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        setSupportMultipleWindows={false}
        injectedJavaScript={injectedLogoBlocker}
        onShouldStartLoadWithRequest={(request) =>
          !isBlockedScratchRootUrl(request.url)
        }
        onNavigationStateChange={(state) => {
          const match = state.url.match(/projects\/(\d+)\/editor/);
          setCurrentProjectId(match?.[1] ?? null);
        }}
      />
      </View>
    </View>
  );
}
