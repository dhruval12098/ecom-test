// components/FAQ.tsx
import ApiService from "@/lib/api";
import FAQClient from "./FAQClient";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export default async function FAQ() {
  const faqs = (await ApiService.getFaqs(true)) as FaqItem[];
  return <FAQClient faqs={faqs || []} />;
}
