import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import "./src/i18n";
import { RootStackParamList } from "./src/nav";
import { useStore } from "./src/store";
import { C } from "./src/ui";
import HomeScreen from "./src/screens/HomeScreen";
import AnswerScreen from "./src/screens/AnswerScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import LawyersScreen from "./src/screens/LawyersScreen";
import BookingScreen from "./src/screens/BookingScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import AboutScreen from "./src/screens/AboutScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Production crash containment: never show users a white screen.
// Hardcoded bilingual copy — must not depend on anything that could itself crash.
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: C.text, textAlign: "center" }}>
          কিছু ভুল হয়েছে · Something went wrong
        </Text>
        <Text
          onPress={() => this.setState({ error: false })}
          accessibilityRole="button"
          style={{
            marginTop: 16,
            color: "#fff",
            backgroundColor: C.primary,
            fontWeight: "700",
            fontSize: 16,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          আবার চেষ্টা করুন · Retry
        </Text>
      </View>
    );
  }
}

export default function App() {
  const { t } = useTranslation();
  const { hydrated, hydrate, lang } = useStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (!hydrated) return null; // instant local hydration — no splash needed

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer key={lang}>
        <StatusBar style="dark" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: C.bg },
            headerTintColor: C.primary,
            headerTitleStyle: { fontWeight: "800", color: C.text },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: C.bg },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Answer" component={AnswerScreen} options={{ title: t("answerTitle") }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: t("historyTitle") }} />
          <Stack.Screen name="Lawyers" component={LawyersScreen} options={{ title: t("lawyersTitle") }} />
          <Stack.Screen name="Booking" component={BookingScreen} options={{ title: t("bookingTitle") }} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: t("paymentTitle") }} />
          <Stack.Screen name="About" component={AboutScreen} options={{ title: t("aboutTitle") }} />
        </Stack.Navigator>
      </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
