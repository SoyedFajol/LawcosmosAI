// Design system — minimal modern AI: warm paper, ink text, one ember accent.
// Serif display for brand moments, pill buttons, hairline borders, quiet shadows.
// Micro-interactions respect the OS reduce-motion setting.
import React from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export const C = {
  bg: "#FAF9F5",
  card: "#FFFFFF",
  primary: "#1D1B16",
  primarySoft: "#F1EFE8",
  accent: "#C65D3B",
  accentDeep: "#9E4526",
  accentSoft: "#F7E9E2",
  danger: "#BF3B2B",
  dangerSoft: "#F9E9E6",
  ok: "#3E7C4F",
  okSoft: "#E9F2EB",
  warn: "#A16207",
  warnSoft: "#F8F0DC",
  bkash: "#E2136E",
  bkashSoft: "#FCE9F1",
  text: "#1D1B16",
  sub: "#6B675C",
  border: "#E7E4DB",
};

/** Serif display face for brand moments (tagline, wordmark, verdicts). */
export const serif = Platform.select({
  web: "Georgia, 'Times New Roman', serif",
  ios: "Georgia",
  default: "serif",
});

export const shadow: ViewStyle = {
  shadowColor: "#1D1B16",
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
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
        <Animated.View style={[style, { transform: [{ scale }], opacity: disabled ? 0.4 : pressed ? 0.85 : 1 }]}>
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
  ghost: { bg: "transparent", fg: C.text, border: C.border },
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
  const border = "border" in v ? { borderWidth: 1, borderColor: v.border } : null;
  return (
    <Tappable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={[s.btn, { backgroundColor: v.bg }, border ?? {}, style ?? {}]}
    >
      {icon && <Ionicons name={icon} size={18} color={v.fg} style={{ marginRight: 8 }} />}
      <Text style={[s.btnText, { color: v.fg }]}>{label}</Text>
    </Tappable>
  );
}

export function Label({ children, color = C.sub }: { children: React.ReactNode; color?: string }) {
  return <Text style={[s.label, { color }]}>{children}</Text>;
}

/** Small meta pill: optional icon + text. */
export function Chip({ icon, text, fg = C.sub, bg = C.primarySoft }: { icon?: IconName; text: string; fg?: string; bg?: string }) {
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
  fg = C.text,
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
  const fg = tone === "warn" ? C.warn : C.sub;
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
        backgroundColor: C.accent,
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
    borderRadius: 20,
    padding: 16,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow,
  },
  btn: {
    minHeight: 50,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  btnText: { fontSize: 15.5, fontWeight: "600" },
  label: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 },
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
    borderRadius: 16,
    padding: 12,
    marginVertical: 7,
  },
  bannerText: { flex: 1, fontSize: 13.5, lineHeight: 20, fontWeight: "500" },
});
