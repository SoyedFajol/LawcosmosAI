// MOCK bKash checkout — SANDBOX ONLY (gate B3 / D). No real money, no real booking.
import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav";
import { LAWYERS } from "../lawyers";
import { Banner, Btn, C, Card, IconBadge, useReducedMotion } from "../ui";

type Props = NativeStackScreenProps<RootStackParamList, "Payment">;

export default function PaymentScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);
  const [phone, setPhone] = useState("");
  const reduced = useReducedMotion();
  const pop = useRef(new Animated.Value(0)).current;
  const lawyer = LAWYERS.find((l) => l.id === route.params.lawyerId);

  useEffect(() => {
    if (!done) return;
    if (reduced) pop.setValue(1);
    else Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 5, tension: 120 }).start();
  }, [done]);

  if (!lawyer) return null;

  return (
    <LinearGradient colors={["#E2136E", "#B80D57"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Card style={s.sheet}>
          <View style={{ alignItems: "center" }}>
            <IconBadge name="wallet" fg={C.bkash} bg={C.bkashSoft} size={56} round />
            <Text style={s.title}>{t("paymentTitle")}</Text>
          </View>
          <Banner text={t("paymentDemo")} />

          {done ? (
            <View style={{ alignItems: "center" }}>
              <Animated.View style={{ transform: [{ scale: pop }], marginVertical: 14 }}>
                <IconBadge name="checkmark" fg="#fff" bg={C.ok} size={88} round />
              </Animated.View>
              <Text style={s.success}>{t("paymentDone")}</Text>
              <Btn label={t("backHome")} icon="home" onPress={() => navigation.popToTop()} style={{ alignSelf: "stretch" }} />
            </View>
          ) : (
            <>
              <Text style={s.amount}>৳{lawyer.fee}</Text>
              <View style={s.inputRow}>
                <Ionicons name="call" size={18} color={C.sub} />
                <TextInput
                  style={s.input}
                  placeholder="01XXXXXXXXX (DEMO)"
                  placeholderTextColor={C.sub}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={11}
                  accessibilityLabel="01XXXXXXXXX (DEMO)"
                />
              </View>
              <Btn label={t("payNow")} icon="lock-closed" variant="bkash" onPress={() => setDone(true)} disabled={phone.length < 11} />
            </>
          )}
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingTop: 40, paddingBottom: 36 },
  sheet: { borderRadius: 24, padding: 20 },
  title: { fontSize: 19, fontWeight: "800", color: C.bkash, textAlign: "center", marginTop: 10 },
  amount: { fontSize: 40, fontWeight: "800", color: C.text, textAlign: "center", marginVertical: 14 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 17, color: C.text, letterSpacing: 1 },
  success: { fontSize: 16.5, color: C.ok, textAlign: "center", marginBottom: 14, fontWeight: "700", lineHeight: 24 },
});
