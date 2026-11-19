import { useEffect, useState, type ReactNode } from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { cn } from "@/shared/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, children, className }: BottomSheetProps) {
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(open);
  const [overlay] = useState(() => new Animated.Value(0)); // 0 → 0.5 (затемнение)
  const [translateY] = useState(() => new Animated.Value(height)); // height → 0 (выезд)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- монтируем лист перед анимацией
      setMounted(true);
      Animated.parallel([
        Animated.timing(overlay, {
          toValue: 0.5,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(overlay, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);


  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* затемнение — отдельный слой на весь экран, анимируется только opacity */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: "#000", opacity: overlay }]}
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* панель — выезжает снизу, полностью непрозрачная */}
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Pressable onPress={() => {}} className={cn("rounded-t-2xl bg-card p-4 pb-8", className)}>
            <View className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            {children}
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
