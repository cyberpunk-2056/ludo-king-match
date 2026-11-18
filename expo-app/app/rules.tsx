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
    { icon: "➕", title: "How to create a match", items: [
      "1. Make sure your wallet has enough for the entry fee (add money if needed).",
      "2. Open Ludo King and create a private room; copy its room code.",
      "3. In Ludora, go to Play → Create match.",
      "4. Pick 1v1 or 4-player, set the entry fee, and paste the Ludo King room code.",
      "5. Tap Create. Your stake is held and the match opens for others to join.",
    ]},
    { icon: "🤝", title: "How to join a match", items: [
      "1. Go to the Play tab and look under 'Open to join'.",
      "2. Pick a match and tap Join. Your entry fee is held in the pot.",
      "3. You'll instantly see the creator's Ludo King room code.",
      "4. Open Ludo King and join that exact room code.",
    ]},
    { icon: "🎮", title: "How to play & get paid", items: [
      "1. All players enter the same Ludo King room with the shared code.",
      "2. Play the game to the finish inside Ludo King.",
      "3. Come back to Ludora and tap 'I won' or 'I lost'.",
      "4. Once everyone reports and results agree, the winner gets 95% of the pot automatically; the platform keeps 5%.",
      "5. If results clash, the pot is frozen for a quick review.",
    ]},
    { icon: "⬇️", title: "How to deposit — steps", items: [
      "1. Open the Wallet tab and tap 'Add money' (or the + in the header).",
      "2. Enter an amount (minimum ₹5) and choose a payment method.",
      "3. Confirm; your deposit balance updates and is ready for matches.",
    ]},
    { icon: "⬆️", title: "How to withdraw — steps", items: [
      "1. Open Wallet → Withdraw.",
      "2. First time: add a UPI ID and verify it (KYC) under 'Pay out to'.",
      "3. Enter an amount (minimum ₹10) from winnings or deposit balance.",
      "4. Request withdrawal; it settles to your verified UPI within minutes.",
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
    { icon: "➕", title: "मैच कैसे बनाएं", items: [
      "1. वॉलेट में एंट्री फीस के लिए पर्याप्त राशि रखें (ज़रूरत हो तो पैसे जोड़ें)।",
      "2. लूडो किंग खोलकर प्राइवेट रूम बनाएं; उसका रूम कोड कॉपी करें।",
      "3. लूडोरा में Play → मैच बनाएं पर जाएं।",
      "4. 1v1 या 4-प्लेयर चुनें, एंट्री फीस डालें, और लूडो किंग रूम कोड पेस्ट करें।",
      "5. बनाएं दबाएं। आपका स्टेक रख लिया जाता है और मैच जॉइन के लिए खुल जाता है।",
    ]},
    { icon: "🤝", title: "मैच कैसे जॉइन करें", items: [
      "1. Play टैब में 'जॉइन के लिए खुले' देखें।",
      "2. कोई मैच चुनकर जॉइन दबाएं। आपकी एंट्री फीस पॉट में रख ली जाती है।",
      "3. आपको तुरंत बनाने वाले का लूडो किंग रूम कोड दिखेगा।",
      "4. लूडो किंग खोलकर उसी रूम कोड से जॉइन करें।",
    ]},
    { icon: "🎮", title: "कैसे खेलें और भुगतान पाएं", items: [
      "1. सभी खिलाड़ी एक ही रूम कोड से लूडो किंग में जुड़ें।",
      "2. लूडो किंग में गेम पूरा खेलें।",
      "3. लूडोरा में वापस आकर 'मैं जीता' या 'मैं हारा' दबाएं।",
      "4. सभी के रिपोर्ट करने और नतीजे मिलने पर विजेता को पॉट का 95% अपने-आप मिलता है; 5% प्लेटफ़ॉर्म रखता है।",
      "5. नतीजे न मिलें तो पॉट समीक्षा के लिए फ्रीज़ रहता है।",
    ]},
    { icon: "⬇️", title: "जमा कैसे करें — स्टेप्स", items: [
      "1. वॉलेट टैब खोलकर 'पैसे जोड़ें' (या हेडर का +) दबाएं।",
      "2. राशि डालें (न्यूनतम ₹5) और भुगतान का तरीका चुनें।",
      "3. पुष्टि करें; जमा राशि अपडेट होकर मैच के लिए तैयार।",
    ]},
    { icon: "⬆️", title: "निकासी कैसे करें — स्टेप्स", items: [
      "1. वॉलेट → निकासी खोलें।",
      "2. पहली बार: 'भुगतान खाता' में UPI ID जोड़कर सत्यापित (KYC) करें।",
      "3. जीत या जमा राशि से रकम डालें (न्यूनतम ₹10)।",
      "4. निकासी का अनुरोध करें; कुछ मिनटों में आपके सत्यापित UPI पर मिल जाता है।",
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
