import {
  BASE_SOLAR_TERMS,
  BRANCHES,
  BRANCH_NAMES,
  FIVE_ELEMENTS,
  STEMS,
  STEM_NAMES,
  TEN_GODS,
  TWELVE_STAGES,
} from "./constants.js";

const BASE_STEMS_FOR_MONTH = [2, 4, 6, 8, 0]; // 甲己=丙寅, 乙庚=戊寅...
const BASE_STEMS_FOR_HOUR = [0, 2, 4, 6, 8]; // 甲己日=甲子...

export function getEffectiveYear(date) {
  const lichun = new Date(date.getFullYear(), 1, 4, 0, 0, 0); // 2/4 00:00
  if (date < lichun) {
    return date.getFullYear() - 1;
  }
  return date.getFullYear();
}

export function getYearPillar(date) {
  const year = getEffectiveYear(date);
  const stemIndex = ((year - 4) % 10 + 10) % 10;
  const branchIndex = ((year - 4) % 12 + 12) % 12;
  return { stemIndex, branchIndex };
}

export function getSolarTermMonth(date) {
  // Uses representative solar term dates per specification table.
  const year = date.getFullYear();

  for (let i = 0; i < BASE_SOLAR_TERMS.length; i++) {
    const term = BASE_SOLAR_TERMS[i];
    const termDate = new Date(year, term.month - 1, term.day, 0, 0, 0);
    if (date >= termDate) {
      return term.branch;
    }
  }
  return 1; // Default to 丑 for very early January dates
}

export function getMonthStem(yearStemIndex, monthBranchIndex) {
  const group = yearStemIndex % 5;
  const baseStem = BASE_STEMS_FOR_MONTH[group];
  const diff = (monthBranchIndex - 2 + 12) % 12;
  return (baseStem + diff) % 10;
}

export function getMonthPillar(date, yearStemIndex) {
  const monthBranchIndex = getSolarTermMonth(date);
  const stemIndex = getMonthStem(yearStemIndex, monthBranchIndex);
  return { stemIndex, branchIndex: monthBranchIndex };
}

export function getDayPillar(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  let jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  const dayIndex = (jd + 49) % 60;

  return { stemIndex: dayIndex % 10, branchIndex: dayIndex % 12 };
}

export function getHourBranch(hour) {
  if (hour >= 23 || hour < 1) return 0;
  if (hour < 3) return 1;
  if (hour < 5) return 2;
  if (hour < 7) return 3;
  if (hour < 9) return 4;
  if (hour < 11) return 5;
  if (hour < 13) return 6;
  if (hour < 15) return 7;
  if (hour < 17) return 8;
  if (hour < 19) return 9;
  if (hour < 21) return 10;
  return 11;
}

export function getHourStem(dayStemIndex, hourBranchIndex) {
  const group = dayStemIndex % 5;
  const baseStem = BASE_STEMS_FOR_HOUR[group];
  return (baseStem + hourBranchIndex) % 10;
}

export function getHourPillar(dayStemIndex, date, useMidnightSwitch = true) {
  const hour = date.getHours();
  let effectiveDayStem = dayStemIndex;

  if (!useMidnightSwitch && hour >= 23) {
    effectiveDayStem = (dayStemIndex + 1) % 10;
  }

  const branchIndex = getHourBranch(hour);
  const stemIndex = getHourStem(effectiveDayStem, branchIndex);
  return { stemIndex, branchIndex };
}

export function getTsuhensei(dayStemIndex, targetStemIndex) {
  const dayElement = STEMS[dayStemIndex].element;
  const targetElement = STEMS[targetStemIndex].element;
  const samePolarity = dayStemIndex % 2 === targetStemIndex % 2;

  if (dayElement === targetElement) {
    return samePolarity ? "比肩" : "劫財";
  }
  if ((dayElement + 1) % 5 === targetElement) {
    return samePolarity ? "食神" : "傷官";
  }
  if ((dayElement + 2) % 5 === targetElement) {
    return samePolarity ? "偏財" : "正財";
  }
  if ((targetElement + 2) % 5 === dayElement) {
    return samePolarity ? "偏官" : "正官";
  }
  if ((targetElement + 1) % 5 === dayElement) {
    return samePolarity ? "偏印" : "印綬";
  }
  return null;
}

export function getJuniunsei(dayStemIndex, branchIndex) {
  const stem = STEMS[dayStemIndex].kanji;
  const branch = BRANCHES[branchIndex].kanji;

  const JUNI_TABLE = {
    甲: { 子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6, 午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 0 },
    乙: { 子: 6, 丑: 5, 寅: 4, 卯: 3, 辰: 2, 巳: 1, 午: 0, 未: 11, 申: 10, 酉: 9, 戌: 8, 亥: 7 },
    丙: { 子: 10, 丑: 11, 寅: 0, 卯: 1, 辰: 2, 巳: 3, 午: 4, 未: 5, 申: 6, 酉: 7, 戌: 8, 亥: 9 },
    丁: { 子: 9, 丑: 8, 寅: 7, 卯: 6, 辰: 5, 巳: 4, 午: 3, 未: 2, 申: 1, 酉: 0, 戌: 11, 亥: 10 },
    戊: { 子: 10, 丑: 11, 寅: 0, 卯: 1, 辰: 2, 巳: 3, 午: 4, 未: 5, 申: 6, 酉: 7, 戌: 8, 亥: 9 },
    己: { 子: 9, 丑: 8, 寅: 7, 卯: 6, 辰: 5, 巳: 4, 午: 3, 未: 2, 申: 1, 酉: 0, 戌: 11, 亥: 10 },
    庚: { 子: 7, 丑: 8, 寅: 9, 卯: 10, 辰: 11, 巳: 0, 午: 1, 未: 2, 申: 3, 酉: 4, 戌: 5, 亥: 6 },
    辛: { 子: 0, 丑: 11, 寅: 10, 卯: 9, 辰: 8, 巳: 7, 午: 6, 未: 5, 申: 4, 酉: 3, 戌: 2, 亥: 1 },
    壬: { 子: 4, 丑: 5, 寅: 6, 卯: 7, 辰: 8, 巳: 9, 午: 10, 未: 11, 申: 0, 酉: 1, 戌: 2, 亥: 3 },
    癸: { 子: 3, 丑: 2, 寅: 1, 卯: 0, 辰: 11, 巳: 10, 午: 9, 未: 8, 申: 7, 酉: 6, 戌: 5, 亥: 4 },
  };

  const idx = JUNI_TABLE[stem][branch];
  return { name: TWELVE_STAGES[idx], index: idx };
}

export function determineDayMasterStrength(dayStemIndex, monthBranchIndex, pillars) {
  const dayElement = STEMS[dayStemIndex].element;
  const BRANCH_ELEMENTS = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
  const monthElement = BRANCH_ELEMENTS[monthBranchIndex];

  let support = 0;
  let exhaust = 0;

  for (const pillar of pillars) {
    const el = STEMS[pillar.stemIndex].element;
    if (el === dayElement || (el + 1) % 5 === dayElement) {
      support++;
    } else {
      exhaust++;
    }
  }

  const monthSupports =
    monthElement === dayElement || (monthElement + 1) % 5 === dayElement;

  if (monthSupports && support >= exhaust) {
    return "身強";
  }
  return "身弱";
}

export function getDaiunDirection(gender, yearStemIndex) {
  const isYangStem = yearStemIndex % 2 === 0;
  const isMale = gender === "male";
  return isMale === isYangStem ? "順行" : "逆行";
}

export function buildMeishiki(date, gender, useMidnightSwitch = true) {
  const yearPillar = getYearPillar(date);
  const monthPillar = getMonthPillar(date, yearPillar.stemIndex);
  const dayPillar = getDayPillar(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  const hourPillar = getHourPillar(dayPillar.stemIndex, date, useMidnightSwitch);

  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];

  const strength = determineDayMasterStrength(
    dayPillar.stemIndex,
    monthPillar.branchIndex,
    pillars,
  );

  const direction = getDaiunDirection(gender, yearPillar.stemIndex);

  const enriched = pillars.map((pillar, idx) => {
    const tsuhensei = getTsuhensei(dayPillar.stemIndex, pillar.stemIndex);
    const juniunsei = getJuniunsei(dayPillar.stemIndex, pillar.branchIndex);
    const pillarName = ["年柱", "月柱", "日柱", "時柱"][idx];
    return {
      ...pillar,
      tsuhensei,
      juniunsei,
      name: pillarName,
      stem: STEM_NAMES[pillar.stemIndex],
      branch: BRANCH_NAMES[pillar.branchIndex],
      element: FIVE_ELEMENTS[STEMS[pillar.stemIndex].element].kanji,
      polarity: pillar.stemIndex % 2 === 0 ? "陽" : "陰",
      hiddenStems: BRANCHES[pillar.branchIndex].hiddenStems.map(
        (i) => STEM_NAMES[i],
      ),
    };
  });

  return {
    date,
    gender,
    direction,
    strength,
    pillars: enriched,
    dayStemIndex: dayPillar.stemIndex,
  };
}
