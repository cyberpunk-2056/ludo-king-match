export interface Colors {
  bg: string; bg2: string; surface: string; surface2: string;
  line: string; fg: string; fgDim: string; muted: string;
  violet: string; indigo: string; green: string; red: string; yellow: string; blue: string;
  isDark: boolean;
}

export const darkColors: Colors = {
  bg: "#080B13", bg2: "#0B0F1A", surface: "#101524", surface2: "#161D30",
  line: "rgba(255,255,255,0.09)", fg: "#F1F4FB", fgDim: "#9AA5C2", muted: "#68728F",
  violet: "#8B6CFF", indigo: "#5B8DEF", green: "#32D583", red: "#FF5A6A", yellow: "#FFC94D", blue: "#4B9BFF",
  isDark: true,
};

export const lightColors: Colors = {
  bg: "#F3F6FD", bg2: "#EAEEF8", surface: "#FFFFFF", surface2: "#F2F5FC",
  line: "rgba(22,32,64,0.10)", fg: "#131A2E", fgDim: "#525C78", muted: "#8891AC",
  violet: "#7A5CF5", indigo: "#5B8DEF", green: "#22B06E", red: "#F0455A", yellow: "#F2A81E", blue: "#2E86E0",
  isDark: false,
};

// fresh look: violet → pink
export const gradient = ["#7A5CFF", "#FF5AA8"] as const;
export const greenGradient = ["#2BD3A7", "#17B8C4"] as const;
