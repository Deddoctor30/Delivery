import { useNetworkState } from "expo-network";
import { WifiOff } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function OfflineBanner() {
  const state = useNetworkState();
  // isInternetReachable бывает undefined пока идёт проверка — баннер только при явном false
  const offline = state.isConnected === false || state.isInternetReachable === false;

  if (!offline) return null;

  return (
    <SafeAreaView edges={["top"]} pointerEvents="none" className="absolute inset-x-0 top-0 z-50">
      <View className="m-2 flex-row items-center justify-center gap-2 rounded-lg bg-destructive px-3 py-2">
        <WifiOff size={16} color="#ffffff" />
        <Text className="font-inter-medium text-sm text-destructive-foreground">
          Нет подключения к интернету
        </Text>
      </View>
    </SafeAreaView>
  );
}
