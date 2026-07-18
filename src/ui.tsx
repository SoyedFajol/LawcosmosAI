// Design system — "Trust & Authority": deep navy + gold accent on soft slate surfaces.
// Tokens + a small animated kit. Micro-interactions respect the OS reduce-motion setting.
import React from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export const C = {
  bg: "#F4F6FB",
  card: "#FFFFFF",
  primary: "#1E3A8A",
  primaryDark: "#13255C",
  primarySoft: "#E8EDFB",
  accent: "#B45309",
  accentSoft: "#FBF0DF",
  danger: "#DC2626",
  dangerSoft: "#FDECEC",
  ok: "#15803D",
  okSoft: "#E8F5EC",
  warn: "#B45309",
  warnSoft: "#FFF6E9",
  bkash: "#E2136E",
  bkashSoft: "#FDE9F2",
  text: "#0F172A",
  sub: "#5B6779",
  border: "#E3E8F0",
  heroGrad: ["#2A4CA8", "#1E3A8A", "#13255C"] as const,
};

export const shadow: ViewStyle = {
  shadowColor: "#13255C",
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

/** Entrance animation: fade + rise. Pass a `delay` to stagger lists. */
export function FadeInUp({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: ViewStyle }) {
  const reduced = useReducedMotion();
  const a = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (reduced) {
      a.setValue(1);
      return;
    }
    Animated.timing(a, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [reduced]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: a,
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Pressable with spring scale-down feedback (0.97) — the one press interaction everywhere. */
export function Tappable({
  onPress,
  disabled,
  style,
  children,
  accessibilityLabel,
}: {
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  accessibilityLabel?: string;
}) {
  const reduced = useReducedMotion();
  const scale = React.useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => !reduced && to(0.97)}
      onPressOut={() => !reduced && to(1)}
    >
      {({ pressed }) => (
        <Animated.View style={[style, { transform: [{ scale }], opacity: disabled ? 0.45 : pressed ? 0.9 : 1 }]}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void }) {
  if (onPress) {
    return (
      <Tappable onPress={onPress} style={[s.card, style ?? {}]}>
        {children}
      </Tappable>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}

const BTN = {
  primary: { bg: C.primary, fg: "#FFFFFF" },
  accent: { bg: C.accent, fg: "#FFFFFF" },
  success: { bg: C.ok, fg: "#FFFFFF" },
  danger: { bg: C.danger, fg: "#FFFFFF" },
  bkash: { bg: C.bkash, fg: "#FFFFFF" },
  ghost: { bg: C.primarySoft, fg: C.primary },
} as const;

export function Btn({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: keyof typeof BTN;
  icon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const v = BTN[variant];
  return (
    <Tappable onPress={onPress} disabled={disabled} accessibilityLabel={label} style={[s.btn, { backgroundColor: v.bg }, style ?? {}]}>
      {icon && <Ionicons name={icon} size={19} color={v.fg} style={{ marginRight: 8 }} />}
      <Text style={[s.btnText, { color: v.fg }]}>{label}</Text>
    </Tappable>
  );
}

export function Label({ children, color = C.sub }: { children: React.ReactNode; color?: string }) {
  return <Text style={[s.label, { color }]}>{children}</Text>;
}

/** Small meta pill: optional icon + text. */
export function Chip({ icon, text, fg = C.sub, bg = C.bg }: { icon?: IconName; text: string; fg?: string; bg?: string }) {
  return (
    <View style={[s.chip, { backgroundColor: bg }]}>
      {icon && <Ionicons name={icon} size={13} color={fg} style={{ marginRight: 5 }} />}
      <Text style={[s.chipText, { color: fg }]}>{text}</Text>
    </View>
  );
}

/** Icon inside a tinted rounded square — the visual anchor of cards and rows. */
export function IconBadge({
  name,
  fg = C.primary,
  bg = C.primarySoft,
  size = 42,
  round,
}: {
  name: IconName;
  fg?: string;
  bg?: string;
  size?: number;
  round?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: round ? size / 2 : size * 0.32,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={name} size={size * 0.52} color={fg} />
    </View>
  );
}

/** Inline notice bar (demo/data warnings, disclaimers). */
export function Banner({ text, tone = "warn", icon }: { text: string; tone?: "warn" | "info"; icon?: IconName }) {
  const fg = tone === "warn" ? C.warn : C.primary;
  const bg = tone === "warn" ? C.warnSoft : C.primarySoft;
  return (
    <View style={[s.banner, { backgroundColor: bg }]}>
      <Ionicons name={icon ?? (tone === "warn" ? "warning" : "information-circle")} size={17} color={fg} style={{ marginTop: 1 }} />
      <Text style={[s.bannerText, { color: fg }]}>{text}</Text>
    </View>
  );
}

/** Initials avatar (skips honorific/parenthetical words, handles Bangla). */
export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => w && !w.includes(".") && !w.startsWith("("))
    .slice(0, 2)
    .map((w) => Array.from(w)[0])
    .join("");
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: C.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: size * 0.36, fontWeight: "700" }}>{initials}</Text>
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: C.border, marginVertical: 14 }, style]} />;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow,
  },
  btn: {
    minHeight: 52,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  btnText: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  chipText: { fontSize: 12.5, fontWeight: "600" },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 14,
    padding: 12,
    marginVertical: 7,
  },
  bannerText: { flex: 1, fontSize: 13.5, lineHeight: 20, fontWeight: "500" },
});
