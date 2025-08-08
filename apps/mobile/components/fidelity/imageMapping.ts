export const imageMapping = {
  "ptit_duo.png": require("../../assets/images/ptit_duo.png"),
  "le_gourmand.png": require("../../assets/images/le_gourmand.png"),
  "le_mix_parfait.png": require("../../assets/images/le_mix_parfait.png"),
} as const;

export type ImageKey = keyof typeof imageMapping;
