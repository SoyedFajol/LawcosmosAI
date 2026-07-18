// Lawyer profile + booking in one screen (demo flow: profile -> slot -> pay).
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav";
import { LAWYERS } from "../lawyers";
import { useStore } from "../store";
import { Avatar, Banner, Btn, C, Card, Chip, Divider, FadeInUp, IconBadge, Label } from "../ui";

type Props = NativeStackScreenProps<RootStackParamList, "Booking">;

export default function BookingScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const bn = lang === "bn";
  const lawyer = LAWYERS.find((l) => l.id === route.params.lawyerId);
  if (!lawyer) return null;

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
      <FadeInUp>
        <Banner text={t("demoData")} />
        <Card style={s.profile}>
          <Avatar name={bn ? lawyer.name_bn : lawyer.name_en} size={72} />
          <Text style={s.name}>{bn ? lawyer.name_bn : lawyer.name_en}</Text>
          <View style={s.chipRow}>
            <Chip icon="briefcase" text={t(`specialty_${lawyer.specialty}`)} fg={C.primary} bg={C.primarySoft} />
            <Chip icon="location" text={bn ? lawyer.city_bn : lawyer.city_en} />
            <Chip icon="ribbon" text={`${lawyer.years} ${t("years")}`} />
          </View>
        </Card>
      </FadeInUp>

      <FadeInUp delay={80}>
        <Card>
          <View style={s.row}>
            <IconBadge name="calendar" />
            <View style={{ flex: 1 }}>
              <Label>{t("bookingTitle")}</Label>
              <Text style={s.value}>{t("bookingSlot")}</Text>
            </View>
          </View>
          <Divider />
          <View style={s.row}>
            <IconBadge name="cash" fg={C.ok} bg={C.okSoft} />
            <View style={{ flex: 1 }}>
              <Label>{t("feeLabel")}</Label>
              <Text style={s.fee}>৳{lawyer.fee}</Text>
            </View>
          </View>
        </Card>
      </FadeInUp>

      <FadeInUp delay={160}>
        <Btn
          label={t("payBtn")}
          icon="wallet"
          variant="bkash"
          onPress={() => navigation.navigate("Payment", { lawyerId: lawyer.id })}
        />
      </FadeInUp>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  profile: { alignItems: "center", paddingVertical: 24 },
  name: { fontSize: 19, fontWeight: "800", color: C.text, marginTop: 12, textAlign: "center" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  value: { fontSize: 16, color: C.text, fontWeight: "600" },
  fee: { fontSize: 21, fontWeight: "800", color: C.accentDeep },
});
