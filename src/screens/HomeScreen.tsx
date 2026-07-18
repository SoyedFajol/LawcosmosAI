import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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
import { Banner, C, Card, Chip, display, Divider, FadeInUp, IconName, Tappable } from "../ui";

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

  const examples = [t("ex1"), t("ex2"), t("ex3")];

  const quickLinks: { icon: IconName; label: string; go: () => void }[] = [
    { icon: "people-outline", label: t("lawyersBtn"), go: () => navigation.navigate("Lawyers") },
    { icon: "time-outline", label: t("historyBtn"), go: () => navigation.navigate("History") },
    { icon: "shield-checkmark-outline", label: t("aboutBtn"), go: () => navigation.navigate("About") },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: C.bg }}
      contentContainerStyle={[s.wrap, { paddingTop: insets.top + 14 }]}
      keyboardShouldPersistTaps="handled"
    >
      <FadeInUp>
        <View style={s.topRow}>
          <View style={s.brandRow}>
            <Image source={require("../../assets/logo-mark.png")} style={{ width: 30, height: 30 }} accessibilityLabel={t("appName")} />
            <Text style={s.brand}>{t("appName")}</Text>
          </View>
          <Tappable onPress={toggleLang} style={s.langBtn} accessibilityLabel={t("langToggle")}>
            <Ionicons name="language" size={15} color={C.text} />
            <Text style={s.langText}>{t("langToggle")}</Text>
          </Tappable>
        </View>
      </FadeInUp>

      <View style={s.center}>
        <FadeInUp>
          <Text style={s.tagline}>{t("tagline")}</Text>
        </FadeInUp>

        <FadeInUp delay={70}>
          <View style={s.composer}>
            <TextInput
              style={s.input}
              placeholder={t("askPlaceholder")}
              placeholderTextColor={C.sub}
              value={q}
              onChangeText={(v) => setQ(v.slice(0, MAX_QUERY_LEN))}
              multiline
              accessibilityLabel={t("askPlaceholder")}
            />
            <View style={s.composerRow}>
              <Tappable onPress={onPhoto} style={s.attachBtn} accessibilityLabel={t("photoBtn")}>
                <Ionicons name="camera-outline" size={20} color={C.text} />
              </Tappable>
              <Tappable onPress={onPdf} style={s.attachBtn} accessibilityLabel={t("pdfBtn")}>
                <Ionicons name="document-outline" size={20} color={C.text} />
              </Tappable>
              <View style={{ flex: 1 }} />
              <Tappable onPress={onAsk} disabled={!q.trim()} style={s.sendBtn} accessibilityLabel={t("askBtn")}>
                <Ionicons name="arrow-up" size={24} color="#fff" />
              </Tappable>
            </View>
          </View>
        </FadeInUp>

        <FadeInUp delay={140}>
          <View style={s.chipsWrap}>
            {examples.map((ex) => (
              <Tappable key={ex} onPress={() => deliver(ask(ex, Date.now()))} style={s.exChip} accessibilityLabel={ex}>
                <Text style={s.exText}>{ex}</Text>
              </Tappable>
            ))}
          </View>
        </FadeInUp>
      </View>

      <FadeInUp delay={200}>
        <Card style={{ paddingVertical: 4 }}>
          {quickLinks.map((l, i) => (
            <View key={l.label}>
              {i > 0 && <Divider style={{ marginVertical: 0 }} />}
              <Tappable onPress={l.go} style={s.linkRow} accessibilityLabel={l.label}>
                <Ionicons name={l.icon} size={20} color={C.text} />
                <Text style={s.linkText}>{l.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={C.sub} />
              </Tappable>
            </View>
          ))}
        </Card>
      </FadeInUp>

      <FadeInUp delay={260}>
        <View style={s.footerRow}>
          <Chip icon="library-outline" text={`${t("corpusNote")}: ${CORPUS_VERSION}`} />
          <Chip icon="globe-outline" text={lang === "bn" ? "বাংলা" : "English"} />
        </View>
        <Banner text={t("disclaimer")} />
      </FadeInUp>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { fontSize: 20, ...display, color: C.text },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  langText: { color: C.text, fontWeight: "600", fontSize: 14 },
  center: { flexGrow: 1, justifyContent: "center", paddingVertical: 32 },
  tagline: {
    fontSize: 28,
    ...display,
    lineHeight: 36,
    color: C.text,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  composer: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 8,
    shadowColor: "#1D1B16",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  input: {
    minHeight: 72,
    maxHeight: 160,
    fontSize: 16,
    lineHeight: 24,
    color: C.text,
    textAlignVertical: "top",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  composerRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 2, paddingBottom: 2 },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16 },
  exChip: {
    backgroundColor: C.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exText: { fontSize: 14, color: C.primaryDeep, fontWeight: "600" },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 8 },
  linkText: { flex: 1, fontSize: 16, fontWeight: "600", color: C.text },
  footerRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12, marginBottom: 4 },
});
