export const STEMS = [
  { index: 0, kanji: "甲", element: 0, polarity: 0 },
  { index: 1, kanji: "乙", element: 0, polarity: 1 },
  { index: 2, kanji: "丙", element: 1, polarity: 0 },
  { index: 3, kanji: "丁", element: 1, polarity: 1 },
  { index: 4, kanji: "戊", element: 2, polarity: 0 },
  { index: 5, kanji: "己", element: 2, polarity: 1 },
  { index: 6, kanji: "庚", element: 3, polarity: 0 },
  { index: 7, kanji: "辛", element: 3, polarity: 1 },
  { index: 8, kanji: "壬", element: 4, polarity: 0 },
  { index: 9, kanji: "癸", element: 4, polarity: 1 },
];

export const BRANCHES = [
  { index: 0, kanji: "子", element: 4, polarity: 0, hiddenStems: [9] },
  { index: 1, kanji: "丑", element: 2, polarity: 1, hiddenStems: [5, 9, 7] },
  { index: 2, kanji: "寅", element: 0, polarity: 0, hiddenStems: [0, 2, 4] },
  { index: 3, kanji: "卯", element: 0, polarity: 1, hiddenStems: [1] },
  { index: 4, kanji: "辰", element: 2, polarity: 0, hiddenStems: [4, 1, 9] },
  { index: 5, kanji: "巳", element: 1, polarity: 1, hiddenStems: [2, 6, 4] },
  { index: 6, kanji: "午", element: 1, polarity: 0, hiddenStems: [3, 5] },
  { index: 7, kanji: "未", element: 2, polarity: 1, hiddenStems: [5, 3, 1] },
  { index: 8, kanji: "申", element: 3, polarity: 0, hiddenStems: [6, 8, 4] },
  { index: 9, kanji: "酉", element: 3, polarity: 1, hiddenStems: [7] },
  { index: 10, kanji: "戌", element: 2, polarity: 0, hiddenStems: [4, 7, 3] },
  { index: 11, kanji: "亥", element: 4, polarity: 1, hiddenStems: [8, 0] },
];

export const FIVE_ELEMENTS = [
  { index: 0, kanji: "木", generates: 1, controls: 2 },
  { index: 1, kanji: "火", generates: 2, controls: 3 },
  { index: 2, kanji: "土", generates: 3, controls: 4 },
  { index: 3, kanji: "金", generates: 4, controls: 0 },
  { index: 4, kanji: "水", generates: 0, controls: 1 },
];

export const TWELVE_STAGES = [
  "長生",
  "沐浴",
  "冠帯",
  "建禄",
  "帝旺",
  "衰",
  "病",
  "死",
  "墓",
  "絶",
  "胎",
  "養",
];

export const STEM_NAMES = STEMS.map((s) => s.kanji);
export const BRANCH_NAMES = BRANCHES.map((b) => b.kanji);

export const TEN_GODS = [
  "比肩",
  "劫財",
  "食神",
  "傷官",
  "偏財",
  "正財",
  "偏官",
  "正官",
  "偏印",
  "印綬",
];

export const BASE_SOLAR_TERMS = [
  { month: 2, day: 4, branch: 2 }, // 立春: 寅
  { month: 3, day: 5, branch: 3 }, // 啓蟄: 卯
  { month: 4, day: 5, branch: 4 }, // 清明: 辰
  { month: 5, day: 6, branch: 5 }, // 立夏: 巳
  { month: 6, day: 6, branch: 6 }, // 芒種: 午
  { month: 7, day: 7, branch: 7 }, // 小暑: 未
  { month: 8, day: 7, branch: 8 }, // 立秋: 申
  { month: 9, day: 8, branch: 9 }, // 白露: 酉
  { month: 10, day: 8, branch: 10 }, // 寒露: 戌
  { month: 11, day: 7, branch: 11 }, // 立冬: 亥
  { month: 12, day: 7, branch: 0 }, // 大雪: 子
  { month: 1, day: 6, branch: 1 }, // 小寒: 丑
];
