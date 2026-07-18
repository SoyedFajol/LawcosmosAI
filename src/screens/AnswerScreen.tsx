// THE ANSWER CARD — the one screen the whole product lives on.
// 5 fields: law+citation, verdict, penalty, next steps, lawyer button. Disclaimer ALWAYS (A6).
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav";
import { useStore } from "../store";
import { Banner, Btn, C, Card, Chip, Divider, FadeInUp, IconBadge, IconName, Label, serif } from "../ui";

type Props = NativeStackScreenProps<RootStackParamList, "Answer">;

function Section({ icon, label, children }: { icon: IconName; label: string; children: React.ReactNode }) {
  return (
    <View>
      <View style={s.sectionHead}>
        <Ionicons name={icon} size={15} color={C.primary} />
        <Label>{label}</Label>
      </View>
      {children}
    </View>
  );
}

export default function AnswerScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const { answer } = route.params;
  const e = answer.entry;
  const bn = lang === "bn";

  const tone =
    e == null
      ? { fg: C.sub, soft: C.primarySoft, icon: "help-circle" as IconName, text: t("cannotVerify") }
      : e.verdict === "illegal"
        ? { fg: C.danger, soft: C.dangerSoft, icon: "close-circle" as IconName, text: t("illegal") }
        : { fg: C.warn, soft: C.warnSoft, icon: "alert-circle" as IconName, text: t("civil") };

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={s.wrap}>
      <FadeInUp>
        <View style={s.queryRow}>
          <Ionicons name="chatbubble-ellipses" size={16} color={C.sub} style={{ marginTop: 2 }} />
          <Text style={s.query}>“{answer.query}”</Text>
        </View>
        {answer.demoNote && <Banner tone="info" icon="flask" text={t("demoAnalysis")} />}
      </FadeInUp>

      <FadeInUp delay={70}>
        <View style={[s.verdictCard, { backgroundColor: tone.soft, borderColor: tone.fg }]}>
          <View style={s.verdictRow}>
            <IconBadge name={tone.icon} fg="#fff" bg={tone.fg} size={46} round />
            <View style={{ flex: 1 }}>
              <Label color={tone.fg}>{t("verdictLabel")}</Label>
              <Text style={[s.verdict, { color: tone.fg }]}>{tone.text}</Text>
            </View>
          </View>
          {e != null && <Text style={s.offense}>{bn ? e.offense_bn : e.offense_en}</Text>}
          {e == null && <Text style={s.offense}>{answer.source === "text" ? t("cannotVerifyBody") : t("couldntRead")}</Text>}
        </View>
      </FadeInUp>

      {e != null && (
        <FadeInUp delay={140}>
          <Card>
            <Section icon="book" label={t("lawLabel")}>
              <Text style={s.body}>
                {bn ? e.act_bn : e.act_en} — {e.section}
              </Text>
            </Section>
            <Divider />
            <Section icon="cash" label={t("penaltyLabel")}>
              <View style={s.penaltyBox}>
                <Text style={s.penalty}>{bn ? e.penalty_bn : e.penalty_en}</Text>
              </View>
            </Section>
            <Divider />
            <Section icon="footsteps" label={t("nextLabel")}>
              <Text style={s.body}>{bn ? e.next_bn : e.next_en}</Text>
            </Section>
            <View style={s.metaRow}>
              <Chip icon="link" text={`${t("sourceLabel")}: ${e.source}`} />
              <Chip
                icon={e.last_verified === "PENDING-HUMAN" ? "hourglass" : "checkmark-circle"}
                fg={e.last_verified === "PENDING-HUMAN" ? C.warn : C.ok}
                bg={e.last_verified === "PENDING-HUMAN" ? C.warnSoft : C.okSoft}
                text={`${t("verifiedLabel")}: ${e.last_verified === "PENDING-HUMAN" ? t("pendingVerify") : e.last_verified}`}
              />
            </View>
          </Card>
        </FadeInUp>
      )}

      <FadeInUp delay={210}>
        <Btn label={t("needLawyer")} icon="people" variant="success" onPress={() => navigation.navigate("Lawyers")} />
        <Btn label={t("backHome")} icon="home" variant="ghost" onPress={() => navigation.popToTop()} />
        <Banner text={t("disclaimer")} />
      </FadeInUp>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 36 },
  queryRow: { flexDirection: "row", gap: 8, marginBottom: 10, paddingHorizontal: 2 },
  query: { flex: 1, fontSize: 15.5, fontStyle: "italic", color: C.sub, lineHeight: 22 },
  verdictCard: { borderRadius: 20, borderWidth: 1.5, padding: 16, marginVertical: 7 },
  verdictRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  verdict: { fontSize: 20, fontFamily: serif, fontWeight: "700", lineHeight: 27 },
  offense: { fontSize: 15, color: C.text, lineHeight: 23, marginTop: 12 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  body: { fontSize: 16.5, color: C.text, lineHeight: 26 },
  penaltyBox: { backgroundColor: C.dangerSoft, borderRadius: 12, padding: 12 },
  penalty: { fontSize: 16, fontWeight: "700", color: C.danger, lineHeight: 24 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
});
