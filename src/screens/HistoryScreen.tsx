import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav";
import { CORPUS } from "../corpus";
import { useStore } from "../store";
import { Btn, C, Card, FadeInUp, IconBadge } from "../ui";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export default function HistoryScreen(_: Props) {
  const { t } = useTranslation();
  const { history, clearHistory, lang } = useStore();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 20 }}>
      <FlatList
        data={history}
        keyExtractor={(item) => String(item.ts)}
        ListEmptyComponent={
          <FadeInUp style={s.empty}>
            <IconBadge name="time" fg={C.sub} bg={C.primarySoft} size={72} round />
            <Text style={s.emptyText}>{t("historyEmpty")}</Text>
          </FadeInUp>
        }
        renderItem={({ item, index }) => {
          const entry = item.entryId ? CORPUS.find((e) => e.id === item.entryId) : null;
          return (
            <FadeInUp delay={Math.min(index, 6) * 50}>
              <Card style={s.row}>
                <IconBadge
                  name={entry ? "checkmark-circle" : "help-circle"}
                  fg={entry ? C.ok : C.sub}
                  bg={entry ? C.okSoft : C.primarySoft}
                  size={40}
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.q}>“{item.query}”</Text>
                  <Text style={[s.a, entry && { color: C.primary }]}>
                    {entry ? (lang === "bn" ? `${entry.act_bn} — ${entry.section}` : `${entry.act_en} — ${entry.section}`) : t("cannotVerify")}
                  </Text>
                  <View style={s.tsRow}>
                    <Ionicons name="time-outline" size={12} color={C.sub} />
                    <Text style={s.ts}>{new Date(item.ts).toLocaleString()}</Text>
                  </View>
                </View>
              </Card>
            </FadeInUp>
          );
        }}
      />
      {history.length > 0 && <Btn label={t("clearHistory")} icon="trash" variant="danger" onPress={clearHistory} />}
    </View>
  );
}

const s = StyleSheet.create({
  empty: { alignItems: "center", gap: 16, marginTop: 64 },
  emptyText: { textAlign: "center", color: C.sub, fontSize: 16 },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  q: { fontSize: 16, color: C.text, fontWeight: "700", lineHeight: 24 },
  a: { fontSize: 14, color: C.sub, marginTop: 4, fontWeight: "600" },
  tsRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  ts: { fontSize: 12, color: C.sub },
});
