// Help & how-to content, shown as separate expandable sections on the profile.
export type Guide = { icon: string; title: string; items: string[] };

export const GUIDES: Record<"en" | "hi", Guide[]> = {
  en: [
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
      "4. When everyone reports and results agree, the winner gets 95% of the pot automatically; the platform keeps 5%.",
      "5. If results clash, the pot is frozen for a quick review.",
    ]},
    { icon: "⬇️", title: "How to deposit money", items: [
      "1. Open the Wallet tab and tap 'Add money' (or the + in the header).",
      "2. Enter an amount (minimum ₹5) and choose a payment method.",
      "3. Confirm; your deposit balance updates and is ready for matches.",
    ]},
    { icon: "⬆️", title: "How to withdraw money", items: [
      "1. Open Wallet → Withdraw.",
      "2. First time: add a UPI ID and verify it (KYC) under 'Pay out to'.",
      "3. Enter an amount (minimum ₹10) from winnings or deposit balance.",
      "4. Request withdrawal; it settles to your verified UPI within minutes.",
    ]},
    { icon: "🛡", title: "Fair play rules", items: [
      "Both players report the result; we cross-check the two reports and any screenshots.",
      "If results don't match, the pot is frozen until proof decides it — no money moves during a dispute.",
      "Bots, teaming and result manipulation lead to a permanent ban and forfeited balance.",
      "Dice are provably fair and every match is skill-based.",
    ]},
    { icon: "🎁", title: "Referral rules", items: [
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
    { icon: "⬇️", title: "पैसे कैसे जमा करें", items: [
      "1. वॉलेट टैब खोलकर 'पैसे जोड़ें' (या हेडर का +) दबाएं।",
      "2. राशि डालें (न्यूनतम ₹5) और भुगतान का तरीका चुनें।",
      "3. पुष्टि करें; जमा राशि अपडेट होकर मैच के लिए तैयार।",
    ]},
    { icon: "⬆️", title: "पैसे कैसे निकालें", items: [
      "1. वॉलेट → निकासी खोलें।",
      "2. पहली बार: 'भुगतान खाता' में UPI ID जोड़कर सत्यापित (KYC) करें।",
      "3. जीत या जमा राशि से रकम डालें (न्यूनतम ₹10)।",
      "4. निकासी का अनुरोध करें; कुछ मिनटों में आपके सत्यापित UPI पर मिल जाता है।",
    ]},
    { icon: "🛡", title: "निष्पक्ष खेल के नियम", items: [
      "दोनों खिलाड़ी नतीजा रिपोर्ट करते हैं; हम दोनों रिपोर्ट और स्क्रीनशॉट मिलाते हैं।",
      "नतीजे न मिलने पर पॉट प्रूफ़ तक फ्रीज़ रहता है — विवाद के दौरान पैसा नहीं हिलता।",
      "बॉट, टीमिंग या धांधली पर स्थायी बैन और बैलेंस ज़ब्त होता है।",
      "डाइस निष्पक्ष हैं और हर मैच स्किल-आधारित है।",
    ]},
    { icon: "🎁", title: "रेफरल नियम", items: [
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
