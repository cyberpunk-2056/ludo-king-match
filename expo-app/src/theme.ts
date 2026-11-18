export interface Colors {
  bg: string; bg2: string; surface: string; surface2: string;
  line: string; fg: string; fgDim: string; muted: string;
  violet: string; indigo: string; green: string; red: string; yellow: string; blue: string; gold: string;
  isDark: boolean;
}

// Bold esports palette — royal blue primary, gold for prizes/winners/rank.
// `violet` is kept as the field name used across screens but now holds the blue accent.
export const darkColors: Colors = {
  bg: "#060912", bg2: "#090D18", surface: "#0E1322", surface2: "#141C30",
  line: "rgba(130,160,230,0.14)", fg: "#EEF2FC", fgDim: "#97A3C2", muted: "#5C688A",
  violet: "#4C84FF", indigo: "#6FA0FF", green: "#2BD98A", red: "#FF5B6E", yellow: "#FFC53D", blue: "#6FA0FF", gold: "#FFC53D",
  isDark: true,
};

export const lightColors: Colors = {
  bg: "#EEF2FB", bg2: "#E4EAF7", surface: "#FFFFFF", surface2: "#F3F6FD",
  line: "rgba(18,28,56,0.12)", fg: "#0E1526", fgDim: "#46506C", muted: "#808BA6",
  violet: "#2457E6", indigo: "#3B74FF", green: "#0FA866", red: "#E23B52", yellow: "#C98A00", blue: "#2457E6", gold: "#C98A00",
  isDark: false,
};

// primary (royal blue), gold (prizes/CTA highlight), green (cash).
export const gradient = ["#4C84FF", "#1E4FE0"] as const;
export const goldGradient = ["#FFD15C", "#F5A623"] as const;
export const greenGradient = ["#2BD98A", "#12A594"] as const;
