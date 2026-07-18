import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav";
import { answerFor, ask, analyzeImage, analyzePdf, MAX_QUERY_LEN } from "../engine";
import { CORPUS, CORPUS_VERSION } from "../corpus";
import { useStore } from "../store";
import {
  Banner,
  Btn,
  C,
  Card,
  Chip,
  display,
  Divider,
  FadeInUp,
  IconBadge,
  IconName,
  Label,
  shadowLg,
  Tappable,
  useReducedMotion,
} from "../ui";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [openDomain, setOpenDomain] = useState<string | null>(null);
  const { lang, toggleLang, addHistory } = useStore();
  const bn = lang === "bn";
  const reduced = useReducedMotion();

  // The placeholder itself teaches what the app can answer: it rotates real example questions.
  const examples = [t("ex1"), t("ex2"), t("ex3")];
  const [ph, setPh] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setPh((p) => (p + 1) % examples.length), 4000);
    return () => clearInterval(id);
  }, [reduced, lang]);

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

  const domains: { key: "traffic" | "family" | "land"; icon: IconName }[] = [
    { key: "traffic", icon: "car" },
    { key: "family", icon: "home" },
    { key: "land", icon: "map" },
  ];

  const tiles: { icon: IconName; label: string; go: () => void }[] = [
    { icon: "people", label: t("lawyersBtn"), go: () => navigation.navigate("Lawyers") },
    { icon: "time", label: t("historyBtn"), go: () => navigation.navigate("History") },
    { icon: "shield-checkmark", label: t("aboutBtn"), go: () => navigation.navigate("About") },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: C.bg }}
      contentContainerStyle={[s.wrap, { paddingTop: insets.top + 12 }]}
      keyboardShouldPersistTaps="handled"
    >
      <FadeInUp>
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View style={s.brandRow}>
              <Image source={require("../../assets/logo-mark-brass.png")} style={{ width: 30, height: 30 }} accessibilityLabel={t("appName")} />
              <Text style={s.brand}>{t("appName")}</Text>
            </View>
            <Tappable onPress={toggleLang} style={s.langBtn} accessibilityLabel={t("langToggle")}>
              <Ionicons name="language" size={16} color="#FFFFFF" />
              <Text style={s.langText}>{t("langToggle")}</Text>
            </Tappable>
          </View>
          <Text style={s.heroTitle}>{t("tagline")}</Text>
        </View>
      </FadeInUp>

      <FadeInUp delay={80}>
        <Card style={s.askCard}>
          <Label>{t("questionLabel")}</Label>
          <TextInput
            style={[s.input, focused && s.inputFocused]}
            placeholder={examples[ph]}
            placeholderTextColor={C.sub}
            value={q}
            onChangeText={(v) => setQ(v.slice(0, MAX_QUERY_LEN))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            multiline
            accessibilityLabel={t("questionLabel")}
          />
          <Btn label={t("askBtn")} icon="send" onPress={onAsk} disabled={!q.trim()} style={{ marginBottom: 0 }} />
          <View style={s.attachRow}>
            <Tappable onPress={onPhoto} style={s.attach} accessibilityLabel={t("photoBtn")}>
              <Ionicons name="camera-outline" size={18} color={C.text} />
              <Text style={s.attachText}>{t("photoBtn")}</Text>
            </Tappable>
            <Tappable onPress={onPdf} style={s.attach} accessibilityLabel={t("pdfBtn")}>
              <Ionicons name="document-outline" size={18} color={C.text} />
              <Text style={s.attachText}>{t("pdfBtn")}</Text>
            </Tappable>
          </View>
        </Card>
      </FadeInUp>

      <FadeInUp delay={160}>
        <View style={s.tileRow}>
          {tiles.map((tile) => (
            <Tappable key={tile.label} onPress={tile.go} style={s.tile} accessibilityLabel={tile.label}>
              <IconBadge name={tile.icon} size={44} round />
              <Text style={s.tileText} numberOfLines={2}>
                {tile.label}
              </Text>
            </Tappable>
          ))}
        </View>
      </FadeInUp>

      <FadeInUp delay={240}>
        <View style={s.sectionHead}>
          <Label>{t("browseLabel")}</Label>
        </View>
        {domains.map((d) => {
          const entries = CORPUS.filter((e) => e.domain === d.key);
          const open = openDomain === d.key;
          return (
            <Card key={d.key} style={{ paddingVertical: 4 }}>
              <Tappable
                onPress={() => setOpenDomain(open ? null : d.key)}
                style={s.row}
                accessibilityLabel={t(`specialty_${d.key}`)}
              >
                <IconBadge name={d.icon} size={32} round fg={C.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={s.rowText}>{t(`specialty_${d.key}`)}</Text>
                  <Text style={s.rowSub}>{t("browseCount", { n: entries.length })}</Text>
                </View>
                <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={C.sub} />
              </Tappable>
              {open &&
                entries.map((e) => (
                  <View key={e.id}>
                    <Divider style={{ marginVertical: 0 }} />
                    <Tappable
                      onPress={() => deliver(answerFor(e, bn ? e.offense_bn : e.offense_en, Date.now()))}
                      style={s.row}
                      accessibilityLabel={bn ? e.offense_bn : e.offense_en}
                    >
                      <Ionicons
                        name={e.verdict === "illegal" ? "close-circle" : "alert-circle"}
                        size={18}
                        color={e.verdict === "illegal" ? C.danger : C.warn}
                      />
                      <Text style={s.entryText} numberOfLines={2}>
                        {bn ? e.offense_bn : e.offense_en}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={C.sub} />
                    </Tappable>
                  </View>
                ))}
            </Card>
          );
        })}
      </FadeInUp>

      <FadeInUp delay={320}>
        <View style={s.footerRow}>
          <Chip icon="library-outline" text={`${t("corpusNote")}: ${CORPUS_VERSION}`} />
          <Chip icon="globe-outline" text={lang === "bn" ? "বাংলা" : "English"} />
        </View>
        <Banner text={t("disclaimer")} />
        <Text style={s.byline}>© 2026 · {t("byLine")}</Text>
      </FadeInUp>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 32 },
  hero: {
    backgroundColor: C.primaryDeep,
    borderRadius: 24,
    padding: 20,
    paddingBottom: 52,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { fontSize: 18, ...display, color: "#FFFFFF" },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  langText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  heroTitle: { fontSize: 32, ...display, lineHeight: 40, color: "#FFFFFF", marginTop: 24 },
  askCard: { marginTop: -32, marginHorizontal: 4, ...shadowLg },
  input: {
    minHeight: 96,
    maxHeight: 180,
    fontSize: 16,
    lineHeight: 24,
    color: C.text,
    textAlignVertical: "top",
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  inputFocused: { borderColor: C.primary },
  attachRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  attach: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  attachText: { fontSize: 14, fontWeight: "600", color: C.text },
  tileRow: { flexDirection: "row", gap: 8, marginTop: 16, marginHorizontal: 4 },
  tile: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  tileText: { fontSize: 12, fontWeight: "600", color: C.text, textAlign: "center", lineHeight: 16 },
  sectionHead: { marginTop: 16, marginLeft: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 8 },
  rowText: { flex: 1, fontSize: 14, fontWeight: "600", color: C.text, lineHeight: 20 },
  rowSub: { fontSize: 12, color: C.sub, marginTop: 2 },
  entryText: { flex: 1, fontSize: 14, color: C.text, lineHeight: 20 },
  footerRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 24, marginBottom: 4 },
  byline: { textAlign: "center", color: C.sub, fontSize: 12, marginTop: 8 },
});
