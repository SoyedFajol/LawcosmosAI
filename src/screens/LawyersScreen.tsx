import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav";
import { LAWYERS } from "../lawyers";
import { useStore } from "../store";
import { Avatar, Banner, Btn, C, Card, Chip, FadeInUp } from "../ui";

type Props = NativeStackScreenProps<RootStackParamList, "Lawyers">;

export default function LawyersScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const bn = lang === "bn";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 20 }}>
      <FlatList
        data={LAWYERS}
        keyExtractor={(l) => l.id}
        ListHeaderComponent={<Banner text={t("demoData")} />}
        renderItem={({ item, index }) => (
          <FadeInUp delay={index * 60}>
            <Card>
              <View style={s.head}>
                <Avatar name={bn ? item.name_bn : item.name_en} size={52} />
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{bn ? item.name_bn : item.name_en}</Text>
                  <Chip icon="briefcase" text={t(`specialty_${item.specialty}`)} fg={C.primary} bg={C.primarySoft} />
                </View>
              </View>
              <View style={s.metaRow}>
                <View style={s.meta}>
                  <Ionicons name="location" size={14} color={C.sub} />
                  <Text style={s.metaText}>{bn ? item.city_bn : item.city_en}</Text>
                </View>
                <View style={s.meta}>
                  <Ionicons name="ribbon" size={14} color={C.sub} />
                  <Text style={s.metaText}>
                    {item.years} {t("years")}
                  </Text>
                </View>
              </View>
              <View style={s.footRow}>
                <View>
                  <Text style={s.feeLabel}>{t("feeLabel")}</Text>
                  <Text style={s.fee}>৳{item.fee}</Text>
                </View>
                <Btn
                  label={t("bookBtn")}
                  icon="calendar"
                  variant="success"
                  onPress={() => navigation.navigate("Booking", { lawyerId: item.id })}
                  style={{ marginVertical: 0, paddingHorizontal: 24 }}
                />
              </View>
            </Card>
          </FadeInUp>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 16.5, fontWeight: "800", color: C.text, marginBottom: 5 },
  metaRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 13.5, color: C.sub, fontWeight: "600" },
  footRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  feeLabel: { fontSize: 12, color: C.sub, fontWeight: "600" },
  fee: { fontSize: 20, fontWeight: "800", color: C.primary },
});
