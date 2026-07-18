import { Answer } from "./engine";

export type RootStackParamList = {
  Home: undefined;
  Answer: { answer: Answer };
  History: undefined;
  Lawyers: undefined;
  Booking: { lawyerId: string };
  Payment: { lawyerId: string };
  About: undefined;
};
