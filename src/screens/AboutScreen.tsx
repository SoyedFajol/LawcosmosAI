// Privacy note + terms + contact (gates B1, B2, G1, G2).
// Wording is DRAFT — flagged in-text; final approval is a HALT item for the human.
import React from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Btn, C, Card, Chip, display, FadeInUp, IconBadge, IconName } from "../ui";

const CONTACT = "tariqbin004@gmail.com";
const VERSION = require("../../package.json").version as string;

export default function AboutScreen() {
  const { t } = useTranslation();
  const sections: { icon: IconName; fg: string; bg: string; text: string }[] = [
    { icon: "warning", fg: C.warn, bg: C.warnSoft, text: t("disclaimer") },
    { icon: "lock-closed", fg: C.primary, bg: C.primarySoft, text: t("privacyNote") },
    { icon: "document-text", fg: C.accent, bg: C.accentSoft, text: t("termsNote") },
  ];

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
      <FadeInUp>
        <Card style={s.header}>
          <Image source={require("../../assets/logo-mark.png")} style={{ width: 48, height: 48 }} accessibilityLabel={t("appName")} />
          <Text style={s.appName}>{t("appName")}</Text>
          <Text style={s.byline}>{t("byLine")}</Text>
          <Chip icon="pricetag-outline" text={`v${VERSION}`} />
        </Card>
      </FadeInUp>
      {sections.map((sec, i) => (
        <FadeInUp key={sec.icon} delay={80 + i * 70}>
          <Card style={s.row}>
            <IconBadge name={sec.icon} fg={sec.fg} bg={sec.bg} size={40} />
            <Text style={s.body}>{sec.text}</Text>
          </Card>
        </FadeInUp>
      ))}
      <FadeInUp delay={220}>
        <Btn
          label={t("contact")}
          icon="mail"
          onPress={() => Linking.openURL(`mailto:${CONTACT}?subject=LawCosmosAI feedback`).catch(() => {})}
        />
        <Text style={s.email}>{CONTACT}</Text>
      </FadeInUp>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { alignItems: "center", gap: 8, paddingVertical: 24 },
  appName: { fontSize: 20, ...display, color: C.text },
  byline: { fontSize: 14, color: C.sub },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  body: { flex: 1, fontSize: 16, color: C.text, lineHeight: 24 },
  email: { textAlign: "center", color: C.sub, fontSize: 14, marginTop: 4 },
});
