import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../src/state";
import { Card } from "../src/ui";

type Sec = { icon: string; title: string; items: string[] };

const CONTENT: Record<"en" | "hi", Sec[]> = {
  en: [
    { icon: "🎲", title: "How matches work", items: [
      "Create a match with an entry fee, or join an open one. Your stake is held safely in one pot.",
      "The creator makes a private room in Ludo King and pastes its code. Opponents see it after they join and pay.",
      "Open Ludo King and play the match with that shared room code.",
      "When it ends, report who won. Both players report before any payout.",
      "The pot is the entry fee times the number of players. The winner gets 95%, the platform keeps 5%.",
    ]},
    { icon: "💳", title: "Deposits", items: [
      "Minimum deposit is ₹5.",
      "Deposit balance is used to join matches and is also withdrawable.",
      "Payments route to a licensed payment partner; no money is taken in demo mode.",
    ]},
    { icon: "💸", title: "Withdrawals", items: [
      "Minimum withdrawal is ₹10.",
      "You can withdraw both winnings and unused deposit balance.",
      "Payouts go only to a KYC-verified UPI you set as default.",
      "Withdrawals usually settle within a few minutes.",
    ]},
    { icon: "🛡", title: "Fair play", items: [
      "Both players report the result; we cross-check the two reports and any screenshots.",
      "If results don't match, the pot is frozen until proof decides it — no money moves during a dispute.",
      "Bots, teaming and result manipulation lead to a permanent ban and forfeited balance.",
      "Dice are provably fair and matches are skill-based.",
    ]},
    { icon: "🎁", title: "Referrals", items: [
      "Share your referral code from Refer & earn.",
      "When a friend you referred wins a match, you earn 3% of their winnings.",
      "Commission is paid straight to your withdrawable balance.",
    ]},
    { icon: "⚖️", title: "Responsible play", items: [
      "18+ only. Play within your limits and only with money you can afford to stake.",
      "Skill-based real-money gaming may be restricted in some regions — check your local rules.",
    ]},
  ],
  hi: [
    { icon: "🎲", title: "मैच कैसे काम करता है", items: [
      "एंट्री फीस के साथ मैच बनाएं या किसी खुले मैच में जुड़ें। आपका स्टेक एक पॉट में सुरक्षित रखा जाता है।",
      "बनाने वाला लूडो किंग में प्राइवेट रूम बनाकर उसका कोड पेस्ट करता है। जॉइन और भुगतान के बाद प्रतिद्वंद्वी इसे देखते हैं।",
      "उसी रूम कोड से लूडो किंग में मैच खेलें।",
      "खत्म होने पर बताएं कौन जीता। भुगतान से पहले दोनों खिलाड़ी रिपोर्ट करते हैं।",
      "पॉट = एंट्री फीस × खिलाड़ी। विजेता को 95% मिलता है, 5% प्लेटफ़ॉर्म रखता है।",
    ]},
    { icon: "💳", title: "जमा (डिपॉज़िट)", items: [
      "न्यूनतम जमा ₹5 है।",
      "जमा राशि मैच जॉइन के लिए और निकासी के लिए भी इस्तेमाल होती है।",
      "भुगतान लाइसेंस प्राप्त पार्टनर से होता है; डेमो मोड में कोई पैसा नहीं लिया जाता।",
    ]},
    { icon: "💸", title: "निकासी (विदड्रॉल)", items: [
      "न्यूनतम निकासी ₹10 है।",
      "आप जीती गई राशि और बची हुई जमा राशि दोनों निकाल सकते हैं।",
      "भुगतान केवल आपके डिफ़ॉल्ट KYC-सत्यापित UPI पर जाता है।",
      "निकासी आमतौर पर कुछ मिनटों में हो जाती है।",
    ]},
    { icon: "🛡", title: "निष्पक्ष खेल", items: [
      "दोनों खिलाड़ी नतीजा रिपोर्ट करते हैं; हम दोनों रिपोर्ट और स्क्रीनशॉट मिलाते हैं।",
      "नतीजे न मिलने पर पॉट प्रूफ़ तक फ्रीज़ रहता है — विवाद के दौरान पैसा नहीं हिलता।",
      "बॉट, टीमिंग या धांधली पर स्थायी बैन और बैलेंस ज़ब्त होता है।",
      "डाइस निष्पक्ष हैं और मैच स्किल-आधारित हैं।",
    ]},
    { icon: "🎁", title: "रेफरल", items: [
      "रेफर & कमाएं से अपना कोड शेयर करें।",
      "आपका रेफर किया दोस्त मैच जीते, तो आपको उसकी जीत का 3% मिलता है।",
      "कमीशन सीधे आपकी निकासी-योग्य राशि में जुड़ता है।",
    ]},
    { icon: "⚖️", title: "ज़िम्मेदार खेल", items: [
      "केवल 18+। अपनी सीमा में और उतने ही पैसे से खेलें जितना आप लगा सकते हैं।",
      "स्किल-आधारित रियल-मनी गेमिंग कुछ क्षेत्रों में प्रतिबंधित हो सकती है — अपने स्थानीय नियम जाँचें।",
    ]},
  ],
};

export default function Rules() {
  const { colors, t, lang } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const secs = CONTENT[lang] ?? CONTENT.en;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 8, paddingBottom: 28 }}>
      <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: colors.fgDim, fontWeight: "800" }}>← {t("back")}</Text></Pressable>
      <Text style={{ color: colors.fg, fontSize: 24, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 10, marginBottom: 14 }}>{t("rules_policies")}</Text>

      {secs.map((sec, i) => (
        <Card key={i} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 19 }}>{sec.icon}</Text>
            </View>
            <Text style={{ color: colors.fg, fontWeight: "800", fontSize: 15.5, flex: 1, textTransform: "uppercase", letterSpacing: 0.2 }}>{sec.title}</Text>
          </View>
          {sec.items.map((it, j) => (
            <View key={j} style={{ flexDirection: "row", gap: 9, marginTop: j === 0 ? 0 : 9 }}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.gold, marginTop: 7 }} />
              <Text style={{ color: colors.fgDim, fontSize: 13.5, lineHeight: 20, flex: 1 }}>{it}</Text>
            </View>
          ))}
        </Card>
      ))}
    </ScrollView>
  );
}
