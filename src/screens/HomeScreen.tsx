import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav";
import { ask, analyzeImage, analyzePdf, MAX_QUERY_LEN } from "../engine";
import { CORPUS_VERSION } from "../corpus";
import { useStore } from "../store";
import { Banner, Btn, C, Card, Chip, FadeInUp, IconBadge, IconName, Tappable } from "../ui";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const { lang, toggleLang, addHistory } = useStore();

  const deliver = (answer: ReturnType<typeof ask>) => {
    addHistory(answer);
    navigation.navigate("Answer", { answer });
  };

  const onAsk = () => {
    if (!q.trim()) return;
    deliver(ask(q.trim(), Date.now()));
    setQ("");
  };

  const onPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.5 });
      if (res.canceled || !res.assets?.length) return;
      const a = res.assets[0];
      deliver(analyzeImage(a.fileName ?? a.uri.split("/").pop() ?? "photo", Date.now()));
    } catch {
      Alert.alert(t("couldntRead")); // picker unavailable / permission denied (H4): graceful, no crash
    }
  };

  const onPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (res.canceled || !res.assets?.length) return;
      deliver(analyzePdf(res.assets[0].name ?? "document.pdf", Date.now()));
    } catch {
      Alert.alert(t("couldntRead"));
    }
  };

  const quickLinks: { icon: IconName; fg: string; bg: string; label: string; go: () => void }[] = [
    { icon: "people", fg: C.ok, bg: C.okSoft, label: t("lawyersBtn"), go: () => navigation.navigate("Lawyers") },
    { icon: "time", fg: C.primary, bg: C.primarySoft, label: t("historyBtn"), go: () => navigation.navigate("History") },
    { icon: "shield-checkmark", fg: C.accent, bg: C.accentSoft, label: t("aboutBtn"), go: () => navigation.navigate("About") },
  ];

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={[s.wrap, { paddingTop: insets.top + 16 }]}>
      <FadeInUp>
        <View style={s.topRow}>
          <View style={s.brandRow}>
            <IconBadge name="scale" fg="#fff" bg={C.primary} size={38} />
            <Text style={s.brand}>{t("appName")}</Text>
          </View>
          <Tappable onPress={toggleLang} style={s.langBtn} accessibilityLabel={t("langToggle")}>
            <Ionicons name="language" size={16} color={C.primary} />
            <Text style={s.langText}>{t("langToggle")}</Text>
          </Tappable>
        </View>
      </FadeInUp>

      <FadeInUp delay={70}>
        <LinearGradient colors={C.heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <View pointerEvents="none" style={[s.orb, s.orb1]} />
          <View pointerEvents="none" style={[s.orb, s.orb2]} />
          <Text style={s.heroTitle}>{t("tagline")}</Text>

          <View style={s.askCard}>
            <TextInput
              style={s.input}
              placeholder={t("askPlaceholder")}
              placeholderTextColor={C.sub}
              value={q}
              onChangeText={(v) => setQ(v.slice(0, MAX_QUERY_LEN))}
              multiline
              accessibilityLabel={t("askPlaceholder")}
            />
            <Btn label={t("askBtn")} icon="arrow-forward" variant="accent" onPress={onAsk} disabled={!q.trim()} style={{ marginBottom: 0 }} />
          </View>

          <View style={s.tileRow}>
            <Tappable onPress={onPhoto} style={s.tile} accessibilityLabel={t("photoBtn")}>
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={s.tileText}>{t("photoBtn")}</Text>
            </Tappable>
            <Tappable onPress={onPdf} style={s.tile} accessibilityLabel={t("pdfBtn")}>
              <Ionicons name="document-text" size={18} color="#fff" />
              <Text style={s.tileText}>{t("pdfBtn")}</Text>
            </Tappable>
          </View>
        </LinearGradient>
      </FadeInUp>

      <View style={{ marginTop: 10 }}>
        {quickLinks.map((l, i) => (
          <FadeInUp key={l.label} delay={140 + i * 60}>
            <Card onPress={l.go} style={s.linkCard}>
              <IconBadge name={l.icon} fg={l.fg} bg={l.bg} />
              <Text style={s.linkText}>{l.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={C.sub} />
            </Card>
          </FadeInUp>
        ))}
      </View>

      <FadeInUp delay={340}>
        <View style={s.footerRow}>
          <Chip icon="library" text={`${t("corpusNote")}: ${CORPUS_VERSION}`} />
          <Chip icon="globe-outline" text={lang === "bn" ? "বাংলা" : "English"} />
        </View>
        <Banner text={t("disclaimer")} />
      </FadeInUp>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 36 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { fontSize: 22, fontWeight: "800", color: C.primary, letterSpacing: -0.3 },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  langText: { color: C.primary, fontWeight: "700", fontSize: 14 },
  hero: { borderRadius: 24, padding: 20, overflow: "hidden" },
  orb: { position: "absolute", borderRadius: 999 },
  orb1: { width: 220, height: 220, top: -90, right: -70, backgroundColor: "rgba(255,255,255,0.07)" },
  orb2: { width: 140, height: 140, bottom: -60, left: -40, backgroundColor: "rgba(180,83,9,0.28)" },
  heroTitle: { color: "#fff", fontSize: 23, fontWeight: "800", lineHeight: 32, marginBottom: 16 },
  askCard: { backgroundColor: C.card, borderRadius: 16, padding: 12 },
  input: {
    minHeight: 84,
    fontSize: 16,
    color: C.text,
    textAlignVertical: "top",
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  tileRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  tile: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  tileText: { color: "#fff", fontWeight: "700", fontSize: 13.5 },
  linkCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  linkText: { flex: 1, fontSize: 16, fontWeight: "700", color: C.text },
  footerRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 14, marginBottom: 4 },
});
