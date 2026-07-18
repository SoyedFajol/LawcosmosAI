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
import { Banner, Btn, C, Card, Chip, display, Divider, FadeInUp, IconName, Label, Tappable } from "../ui";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
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
      contentContainerStyle={[s.wrap, { paddingTop: insets.top + 16 }]}
      keyboardShouldPersistTaps="handled"
    >
      <FadeInUp>
        <View style={s.topRow}>
          <View style={s.brandRow}>
            <Image source={require("../../assets/logo-mark.png")} style={{ width: 28, height: 28 }} accessibilityLabel={t("appName")} />
            <Text style={s.brand}>{t("appName")}</Text>
          </View>
          <Tappable onPress={toggleLang} style={s.langBtn} accessibilityLabel={t("langToggle")}>
            <Ionicons name="language" size={16} color={C.text} />
            <Text style={s.langText}>{t("langToggle")}</Text>
          </Tappable>
        </View>
      </FadeInUp>

      <FadeInUp delay={60}>
        <Text style={s.title}>{t("tagline")}</Text>
      </FadeInUp>

      <FadeInUp delay={120}>
        <Card>
          <Label>{t("questionLabel")}</Label>
          <TextInput
            style={[s.input, focused && s.inputFocused]}
            placeholder={t("askPlaceholder")}
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

      <FadeInUp delay={180}>
        <View style={s.sectionHead}>
          <Label>{t("examplesLabel")}</Label>
        </View>
        <Card style={{ paddingVertical: 4 }}>
          {examples.map((ex, i) => (
            <View key={ex}>
              {i > 0 && <Divider style={{ marginVertical: 0 }} />}
              <Tappable onPress={() => deliver(ask(ex, Date.now()))} style={s.row} accessibilityLabel={ex}>
                <Ionicons name="help-circle-outline" size={20} color={C.primary} />
                <Text style={s.rowText}>{ex}</Text>
                <Ionicons name="chevron-forward" size={16} color={C.sub} />
              </Tappable>
            </View>
          ))}
        </Card>
      </FadeInUp>

      <FadeInUp delay={240}>
        <View style={s.sectionHead}>
          <Label>{t("moreLabel")}</Label>
        </View>
        <Card style={{ paddingVertical: 4 }}>
          {quickLinks.map((l, i) => (
            <View key={l.label}>
              {i > 0 && <Divider style={{ marginVertical: 0 }} />}
              <Tappable onPress={l.go} style={s.row} accessibilityLabel={l.label}>
                <Ionicons name={l.icon} size={20} color={C.text} />
                <Text style={s.rowText}>{l.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={C.sub} />
              </Tappable>
            </View>
          ))}
        </Card>
      </FadeInUp>

      <FadeInUp delay={300}>
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
  wrap: { padding: 20, paddingBottom: 32 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { fontSize: 18, ...display, color: C.text },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 40,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  langText: { color: C.text, fontWeight: "600", fontSize: 14 },
  title: { fontSize: 24, ...display, lineHeight: 32, color: C.text, marginTop: 24, marginBottom: 12 },
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
  sectionHead: { marginTop: 16, marginLeft: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 8 },
  rowText: { flex: 1, fontSize: 14, fontWeight: "600", color: C.text, lineHeight: 20 },
  footerRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 24, marginBottom: 4 },
  byline: { textAlign: "center", color: C.sub, fontSize: 12, marginTop: 8 },
});
