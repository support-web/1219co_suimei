# 四柱推命（BaZi）Webアプリ実装のための完全技術仕様書

四柱推命のWebアプリケーションを構築するために必要な全計算ロジック・データ構造・アルゴリズムを網羅した技術仕様書です。日本語話者向け、標準的計算流派に基づいています。

---

## 第1章：基本要素の定義

### 1.1 十干（天干）

十干は五行と陰陽の組み合わせで構成される10種類の要素です。

| Index | 天干 | 読み | 五行 | 陰陽 | elementIndex |
|-------|------|------|------|------|--------------|
| 0 | 甲 | きのえ | 木 | 陽 | 0 |
| 1 | 乙 | きのと | 木 | 陰 | 0 |
| 2 | 丙 | ひのえ | 火 | 陽 | 1 |
| 3 | 丁 | ひのと | 火 | 陰 | 1 |
| 4 | 戊 | つちのえ | 土 | 陽 | 2 |
| 5 | 己 | つちのと | 土 | 陰 | 2 |
| 6 | 庚 | かのえ | 金 | 陽 | 3 |
| 7 | 辛 | かのと | 金 | 陰 | 3 |
| 8 | 壬 | みずのえ | 水 | 陽 | 4 |
| 9 | 癸 | みずのと | 水 | 陰 | 4 |

**計算式**:
- 五行インデックス: `elementIndex = Math.floor(stemIndex / 2)`
- 陰陽判定: `polarity = (stemIndex % 2 === 0) ? "陽" : "陰"`

### 1.2 十二支（地支）

| Index | 地支 | 読み | 五行 | 陰陽 | 時刻 |
|-------|------|------|------|------|------|
| 0 | 子 | ね | 水 | 陽 | 23:00-01:00 |
| 1 | 丑 | うし | 土 | 陰 | 01:00-03:00 |
| 2 | 寅 | とら | 木 | 陽 | 03:00-05:00 |
| 3 | 卯 | う | 木 | 陰 | 05:00-07:00 |
| 4 | 辰 | たつ | 土 | 陽 | 07:00-09:00 |
| 5 | 巳 | み | 火 | 陰 | 09:00-11:00 |
| 6 | 午 | うま | 火 | 陽 | 11:00-13:00 |
| 7 | 未 | ひつじ | 土 | 陰 | 13:00-15:00 |
| 8 | 申 | さる | 金 | 陽 | 15:00-17:00 |
| 9 | 酉 | とり | 金 | 陰 | 17:00-19:00 |
| 10 | 戌 | いぬ | 土 | 陽 | 19:00-21:00 |
| 11 | 亥 | い | 水 | 陰 | 21:00-23:00 |

### 1.3 蔵干（地支に内包される天干）

各地支には1〜3個の天干が内包されており、本気・中気・余気として分類されます。

| 地支 | 本気 | 中気 | 余気 | 重み配分 |
|------|------|------|------|----------|
| 子 | 癸 | - | - | 100% |
| 丑 | 己 | 癸 | 辛 | 60%/30%/10% |
| 寅 | 甲 | 丙 | 戊 | 60%/30%/10% |
| 卯 | 乙 | - | - | 100% |
| 辰 | 戊 | 乙 | 癸 | 60%/30%/10% |
| 巳 | 丙 | 庚 | 戊 | 60%/30%/10% |
| 午 | 丁 | 己 | - | 70%/30% |
| 未 | 己 | 丁 | 乙 | 60%/30%/10% |
| 申 | 庚 | 壬 | 戊 | 60%/30%/10% |
| 酉 | 辛 | - | - | 100% |
| 戌 | 戊 | 辛 | 丁 | 60%/30%/10% |
| 亥 | 壬 | 甲 | - | 70%/30% |

### 1.4 五行の相生・相剋関係

**相生（生じる関係）**: 木→火→土→金→水→木...
```javascript
function isGenerating(element1, element2) {
  return (element1 + 1) % 5 === element2;
}
// 木(0)→火(1)→土(2)→金(3)→水(4)→木(0)
```

**相剋（剋す関係）**: 木→土→水→火→金→木...
```javascript
function isControlling(element1, element2) {
  return (element1 + 2) % 5 === element2;
}
// 木(0)→土(2)→水(4)→火(1)→金(3)→木(0)
```

### 1.5 六十干支の計算

**天干・地支インデックスから干支番号を計算**:
```javascript
function getSexagenaryIndex(stemIndex, branchIndex) {
  // stemIndex: 0-9, branchIndex: 0-11
  let k = 6 * stemIndex - 5 * branchIndex;
  return ((k % 60) + 60) % 60; // 0-59
}
```

**干支番号から天干・地支を逆算**:
```javascript
function getStemBranchFromNumber(num) {
  // num: 0-59
  const stemIndex = num % 10;
  const branchIndex = num % 12;
  return { stemIndex, branchIndex };
}
```

---

## 第2章：四柱の算出方法

### 2.1 年柱の計算

**基本公式**:
```javascript
function getYearPillar(year) {
  const stemIndex = (year - 4) % 10;   // 年干
  const branchIndex = (year - 4) % 12; // 年支
  return { stemIndex, branchIndex };
}
```

**立春による年の切り替え**: 立春前に生まれた場合は前年として扱います。
```javascript
function getEffectiveYear(birthDateTime, lichunDateTime) {
  if (birthDateTime < lichunDateTime) {
    return birthDateTime.getFullYear() - 1;
  }
  return birthDateTime.getFullYear();
}
```

**計算例**:
| 西暦年 | 年干インデックス | 年支インデックス | 年柱 |
|--------|------------------|------------------|------|
| 2024 | (2024-4)%10 = 0 | (2024-4)%12 = 4 | 甲辰 |
| 2025 | (2025-4)%10 = 1 | (2025-4)%12 = 5 | 乙巳 |

### 2.2 月柱の計算

月柱は「節」を基準に月が切り替わります。節入り前は前月として扱います。

**節気と月支の対応表**:

| 月 | 節気 | 太陽黄経 | 月支 | おおよその日付 |
|----|------|----------|------|----------------|
| 1 | 立春 | 315° | 寅 | 2月4日頃 |
| 2 | 啓蟄 | 345° | 卯 | 3月5日頃 |
| 3 | 清明 | 15° | 辰 | 4月5日頃 |
| 4 | 立夏 | 45° | 巳 | 5月6日頃 |
| 5 | 芒種 | 75° | 午 | 6月6日頃 |
| 6 | 小暑 | 105° | 未 | 7月7日頃 |
| 7 | 立秋 | 135° | 申 | 8月7日頃 |
| 8 | 白露 | 165° | 酉 | 9月8日頃 |
| 9 | 寒露 | 195° | 戌 | 10月8日頃 |
| 10 | 立冬 | 225° | 亥 | 11月7日頃 |
| 11 | 大雪 | 255° | 子 | 12月7日頃 |
| 12 | 小寒 | 285° | 丑 | 1月6日頃 |

**年上起月法（年干から月干を求める公式）**:

| 年干 | 寅月の月干 | 基準値 |
|------|------------|--------|
| 甲・己 | 丙 | 2 |
| 乙・庚 | 戊 | 4 |
| 丙・辛 | 庚 | 6 |
| 丁・壬 | 壬 | 8 |
| 戊・癸 | 甲 | 0 |

```javascript
function getMonthStem(yearStemIndex, monthBranchIndex) {
  // monthBranchIndex: 寅=2, 卯=3, ..., 丑=1
  const baseStems = [2, 4, 6, 8, 0]; // 甲己年=丙寅, 乙庚年=戊寅...
  const group = yearStemIndex % 5;
  const baseStem = baseStems[group];
  // 寅月からの差分を加算
  const diff = (monthBranchIndex - 2 + 12) % 12;
  return (baseStem + diff) % 10;
}
```

### 2.3 日柱の計算

**ユリウス日を使用した計算式**:
```javascript
function getDayPillar(year, month, day) {
  // ユリウス日の計算
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + 
           Math.floor(y / 400) - 32045;
  
  // 日干支番号の計算（0-59）
  const dayIndex = (jd + 49) % 60;
  
  return {
    stemIndex: dayIndex % 10,
    branchIndex: dayIndex % 12
  };
}
```

**基準日からの簡易計算**:
```javascript
// 基準日: 1900年1月31日 = 甲戌（干支番号10）
function getDayPillarSimple(year, month, day) {
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
  const dayIndex = ((daysDiff + 10) % 60 + 60) % 60;
  return {
    stemIndex: dayIndex % 10,
    branchIndex: dayIndex % 12
  };
}
```

### 2.4 時柱の計算

**時支の決定（時刻→時支）**:
```javascript
function getHourBranch(hour) {
  if (hour >= 23 || hour < 1) return 0;  // 子
  if (hour < 3) return 1;   // 丑
  if (hour < 5) return 2;   // 寅
  if (hour < 7) return 3;   // 卯
  if (hour < 9) return 4;   // 辰
  if (hour < 11) return 5;  // 巳
  if (hour < 13) return 6;  // 午
  if (hour < 15) return 7;  // 未
  if (hour < 17) return 8;  // 申
  if (hour < 19) return 9;  // 酉
  if (hour < 21) return 10; // 戌
  return 11; // 亥
}
```

**日上起時法（日干から時干を求める）**:

| 日干 | 子刻の時干 | 乗数 |
|------|------------|------|
| 甲・己 | 甲 | 0 |
| 乙・庚 | 丙 | 2 |
| 丙・辛 | 戊 | 4 |
| 丁・壬 | 庚 | 6 |
| 戊・癸 | 壬 | 8 |

```javascript
function getHourStem(dayStemIndex, hourBranchIndex) {
  const baseStems = [0, 2, 4, 6, 8]; // 甲己日=甲子, 乙庚日=丙子...
  const group = dayStemIndex % 5;
  const baseStem = baseStems[group];
  return (baseStem + hourBranchIndex) % 10;
}
```

**夜子時（23:00-24:00）の処理**:
- **0時切り替え派（推奨）**: 日付は0:00で切り替え
- **23時切り替え派**: 23:00から翌日として計算

```javascript
function getTimePillar(dayStemIndex, hour, minute, useMidnightSwitch = true) {
  let effectiveDayStem = dayStemIndex;
  
  if (!useMidnightSwitch && hour >= 23) {
    // 23時切り替え：翌日の日干を使用
    effectiveDayStem = (dayStemIndex + 1) % 10;
  }
  
  const hourBranch = getHourBranch(hour);
  const hourStem = getHourStem(effectiveDayStem, hourBranch);
  
  return { stemIndex: hourStem, branchIndex: hourBranch };
}
```

---

## 第3章：二十四節気と暦計算

### 3.1 二十四節気の完全リスト

| 順 | 名称 | 太陽黄経 | 種類 | 月柱に使用 |
|----|------|----------|------|------------|
| 1 | 立春 | 315° | 節 | ✓ |
| 2 | 雨水 | 330° | 中気 | |
| 3 | 啓蟄 | 345° | 節 | ✓ |
| 4 | 春分 | 0° | 中気 | |
| 5 | 清明 | 15° | 節 | ✓ |
| 6 | 穀雨 | 30° | 中気 | |
| 7 | 立夏 | 45° | 節 | ✓ |
| 8 | 小満 | 60° | 中気 | |
| 9 | 芒種 | 75° | 節 | ✓ |
| 10 | 夏至 | 90° | 中気 | |
| 11 | 小暑 | 105° | 節 | ✓ |
| 12 | 大暑 | 120° | 中気 | |
| 13 | 立秋 | 135° | 節 | ✓ |
| 14 | 処暑 | 150° | 中気 | |
| 15 | 白露 | 165° | 節 | ✓ |
| 16 | 秋分 | 180° | 中気 | |
| 17 | 寒露 | 195° | 節 | ✓ |
| 18 | 霜降 | 210° | 中気 | |
| 19 | 立冬 | 225° | 節 | ✓ |
| 20 | 小雪 | 240° | 中気 | |
| 21 | 大雪 | 255° | 節 | ✓ |
| 22 | 冬至 | 270° | 中気 | |
| 23 | 小寒 | 285° | 節 | ✓ |
| 24 | 大寒 | 300° | 中気 | |

### 3.2 節入り日時データの取得方法

**推奨方法**: 事前計算したJSONデータベースを使用

```json
{
  "2025": {
    "立春": "2025-02-03T23:10:00+09:00",
    "啓蟄": "2025-03-05T17:07:00+09:00",
    "清明": "2025-04-04T22:02:00+09:00"
  }
}
```

**データソース**:
- 国立天文台暦計算室: https://eco.mtk.nao.ac.jp/koyomi/
- lunar-javascript ライブラリ内蔵データ（1900-2100年）

### 3.3 四柱推命における暦の使い方

| 項目 | 切り替え基準 |
|------|--------------|
| 年 | 立春（太陽黄経315°） |
| 月 | 各月の「節」入り日時 |
| 日 | 午前0時（標準）または23時（流派による） |
| 時 | 2時間ごとの時辰 |

**重要**: 四柱推命では旧暦（太陰暦）は直接使用しません。定気法（太陽黄経）に基づく節気で月を判定します。

---

## 第4章：通変星（十神）の計算

### 4.1 通変星の定義と導出ロジック

| 通変星 | 五行関係 | 陰陽関係 |
|--------|----------|----------|
| 比肩 | 同じ五行 | 同じ |
| 劫財 | 同じ五行 | 異なる |
| 食神 | 日干が生じる | 同じ |
| 傷官 | 日干が生じる | 異なる |
| 偏財 | 日干が剋す | 同じ |
| 正財 | 日干が剋す | 異なる |
| 偏官 | 日干を剋す | 同じ |
| 正官 | 日干を剋す | 異なる |
| 偏印 | 日干を生じる | 同じ |
| 印綬 | 日干を生じる | 異なる |

### 4.2 通変星計算アルゴリズム

```javascript
const GOGYO = {
  0: 0, 1: 0,  // 甲乙 = 木(0)
  2: 1, 3: 1,  // 丙丁 = 火(1)
  4: 2, 5: 2,  // 戊己 = 土(2)
  6: 3, 7: 3,  // 庚辛 = 金(3)
  8: 4, 9: 4   // 壬癸 = 水(4)
};

// 相生: (e+1)%5, 相剋: (e+2)%5
function getTsuhensei(nikkanIndex, targetIndex) {
  const nikkanGogyo = GOGYO[nikkanIndex];
  const targetGogyo = GOGYO[targetIndex];
  const sameInyo = (nikkanIndex % 2) === (targetIndex % 2);
  
  if (nikkanGogyo === targetGogyo) {
    return sameInyo ? '比肩' : '劫財';
  }
  if ((nikkanGogyo + 1) % 5 === targetGogyo) { // 日干が生じる
    return sameInyo ? '食神' : '傷官';
  }
  if ((nikkanGogyo + 2) % 5 === targetGogyo) { // 日干が剋す
    return sameInyo ? '偏財' : '正財';
  }
  if ((targetGogyo + 2) % 5 === nikkanGogyo) { // 日干を剋す
    return sameInyo ? '偏官' : '正官';
  }
  if ((targetGogyo + 1) % 5 === nikkanGogyo) { // 日干を生じる
    return sameInyo ? '偏印' : '印綬';
  }
}
```

### 4.3 通変星対応表（10×10マトリクス）

```javascript
const TSUHENSEI_TABLE = {
  '甲': {'甲':'比肩','乙':'劫財','丙':'食神','丁':'傷官','戊':'偏財','己':'正財','庚':'偏官','辛':'正官','壬':'偏印','癸':'印綬'},
  '乙': {'甲':'劫財','乙':'比肩','丙':'傷官','丁':'食神','戊':'正財','己':'偏財','庚':'正官','辛':'偏官','壬':'印綬','癸':'偏印'},
  '丙': {'甲':'偏印','乙':'印綬','丙':'比肩','丁':'劫財','戊':'食神','己':'傷官','庚':'偏財','辛':'正財','壬':'偏官','癸':'正官'},
  '丁': {'甲':'印綬','乙':'偏印','丙':'劫財','丁':'比肩','戊':'傷官','己':'食神','庚':'正財','辛':'偏財','壬':'正官','癸':'偏官'},
  '戊': {'甲':'偏官','乙':'正官','丙':'偏印','丁':'印綬','戊':'比肩','己':'劫財','庚':'食神','辛':'傷官','壬':'偏財','癸':'正財'},
  '己': {'甲':'正官','乙':'偏官','丙':'印綬','丁':'偏印','戊':'劫財','己':'比肩','庚':'傷官','辛':'食神','壬':'正財','癸':'偏財'},
  '庚': {'甲':'偏財','乙':'正財','丙':'偏官','丁':'正官','戊':'偏印','己':'印綬','庚':'比肩','辛':'劫財','壬':'食神','癸':'傷官'},
  '辛': {'甲':'正財','乙':'偏財','丙':'正官','丁':'偏官','戊':'印綬','己':'偏印','庚':'劫財','辛':'比肩','壬':'傷官','癸':'食神'},
  '壬': {'甲':'食神','乙':'傷官','丙':'偏財','丁':'正財','戊':'偏官','己':'正官','庚':'偏印','辛':'印綬','壬':'比肩','癸':'劫財'},
  '癸': {'甲':'傷官','乙':'食神','丙':'正財','丁':'偏財','戊':'正官','己':'偏官','庚':'印綬','辛':'偏印','壬':'劫財','癸':'比肩'}
};
```

---

## 第5章：十二運星の計算

### 5.1 十二運星の定義

周期順序: 長生→沐浴→冠帯→建禄→帝旺→衰→病→死→墓→絶→胎→養

| 十二運 | エネルギー値 | 強弱 |
|--------|--------------|------|
| 帝旺 | 12 | 強 |
| 建禄 | 11 | 強 |
| 冠帯 | 10 | 強 |
| 長生 | 9 | 並 |
| 衰 | 8 | 並 |
| 沐浴 | 7 | 並 |
| 養 | 6 | 並 |
| 墓 | 5 | 並 |
| 病 | 4 | 弱 |
| 胎 | 3 | 弱 |
| 死 | 2 | 弱 |
| 絶 | 1 | 弱 |

### 5.2 各天干の長生の位置

| 天干 | 長生の地支 | 方向 |
|------|------------|------|
| 甲 | 亥 | 順行 |
| 乙 | 午 | 逆行 |
| 丙 | 寅 | 順行 |
| 丁 | 酉 | 逆行 |
| 戊 | 寅 | 順行 |
| 己 | 酉 | 逆行 |
| 庚 | 巳 | 順行 |
| 辛 | 子 | 逆行 |
| 壬 | 申 | 順行 |
| 癸 | 卯 | 逆行 |

### 5.3 十二運星対応表（10×12マトリクス）

```javascript
const JUNIUNSEI_TABLE = {
  '甲': {'子':'沐浴','丑':'冠帯','寅':'建禄','卯':'帝旺','辰':'衰','巳':'病','午':'死','未':'墓','申':'絶','酉':'胎','戌':'養','亥':'長生'},
  '乙': {'子':'病','丑':'衰','寅':'帝旺','卯':'建禄','辰':'冠帯','巳':'沐浴','午':'長生','未':'養','申':'胎','酉':'絶','戌':'墓','亥':'死'},
  '丙': {'子':'胎','丑':'養','寅':'長生','卯':'沐浴','辰':'冠帯','巳':'建禄','午':'帝旺','未':'衰','申':'病','酉':'死','戌':'墓','亥':'絶'},
  '丁': {'子':'絶','丑':'墓','寅':'死','卯':'病','辰':'衰','巳':'帝旺','午':'建禄','未':'冠帯','申':'沐浴','酉':'長生','戌':'養','亥':'胎'},
  '戊': {'子':'胎','丑':'養','寅':'長生','卯':'沐浴','辰':'冠帯','巳':'建禄','午':'帝旺','未':'衰','申':'病','酉':'死','戌':'墓','亥':'絶'},
  '己': {'子':'絶','丑':'墓','寅':'死','卯':'病','辰':'衰','巳':'帝旺','午':'建禄','未':'冠帯','申':'沐浴','酉':'長生','戌':'養','亥':'胎'},
  '庚': {'子':'死','丑':'墓','寅':'絶','卯':'胎','辰':'養','巳':'長生','午':'沐浴','未':'冠帯','申':'建禄','酉':'帝旺','戌':'衰','亥':'病'},
  '辛': {'子':'長生','丑':'養','寅':'胎','卯':'絶','辰':'墓','巳':'死','午':'病','未':'衰','申':'帝旺','酉':'建禄','戌':'冠帯','亥':'沐浴'},
  '壬': {'子':'帝旺','丑':'衰','寅':'病','卯':'死','辰':'墓','巳':'絶','午':'胎','未':'養','申':'長生','酉':'沐浴','戌':'冠帯','亥':'建禄'},
  '癸': {'子':'建禄','丑':'冠帯','寅':'沐浴','卯':'長生','辰':'養','巳':'胎','午':'絶','未':'墓','申':'死','酉':'病','戌':'衰','亥':'帝旺'}
};
```

---

## 第6章：大運の計算

### 6.1 順行・逆行の判定

| 性別 | 年干の陰陽 | 大運の方向 |
|------|------------|------------|
| 男性 | 陽干（甲丙戊庚壬） | 順行 |
| 男性 | 陰干（乙丁己辛癸） | 逆行 |
| 女性 | 陽干 | 逆行 |
| 女性 | 陰干 | 順行 |

```javascript
function getDaiunDirection(gender, yearStemIndex) {
  const isYangStem = yearStemIndex % 2 === 0;
  const isMale = gender === 'male';
  return (isMale === isYangStem) ? 'forward' : 'backward';
}
```

### 6.2 大運開始年齢（立運）の計算

```javascript
function calculateRitsunAge(birthDate, direction, solarTerms) {
  let targetDate;
  
  if (direction === 'forward') {
    // 順行：次の節入り日までの日数
    targetDate = getNextSetsuniri(birthDate, solarTerms);
  } else {
    // 逆行：前の節入り日までの日数
    targetDate = getPrevSetsuniri(birthDate, solarTerms);
  }
  
  const daysDiff = Math.abs(Math.floor((targetDate - birthDate) / (1000 * 60 * 60 * 24)));
  
  // 3日 = 1年
  const years = Math.floor(daysDiff / 3);
  const remainderDays = daysDiff % 3;
  const months = remainderDays * 4; // 余り1日 = 4ヶ月
  
  return { years, months };
}
```

### 6.3 大運の干支算出

```javascript
const SIXTY_KANSHI = [
  '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
  '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
  '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
  '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
  '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
  '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥'
];

function getDaiunKanshi(monthPillarIndex, direction, daiunNumber) {
  // monthPillarIndex: 月柱の六十干支インデックス（0-59）
  // daiunNumber: 第何大運か（1,2,3...）
  
  if (direction === 'forward') {
    return SIXTY_KANSHI[(monthPillarIndex + daiunNumber) % 60];
  } else {
    return SIXTY_KANSHI[(monthPillarIndex - daiunNumber + 60) % 60];
  }
}
```

---

## 第7章：流年（歳運）の計算

### 7.1 流年干支の算出

```javascript
function getNenunKanshi(targetYear) {
  const stemIndex = (targetYear - 4) % 10;
  const branchIndex = (targetYear - 4) % 12;
  
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  
  return stems[stemIndex] + branches[branchIndex];
}
```

---

## 第8章：運勢判定のロジック

### 8.1 日主の強弱判定（身強・身弱）

```javascript
function determineDayMasterStrength(dayStemIndex, monthBranchIndex, meishiki) {
  const dayElement = Math.floor(dayStemIndex / 2);
  
  // 月令（月支の五行）が日主を助けるか
  const BRANCH_ELEMENTS = [4,2,0,0,2,1,1,2,3,3,2,4]; // 子丑寅卯...の五行
  const monthElement = BRANCH_ELEMENTS[monthBranchIndex];
  
  // 日主と同じ五行（比劫）または日主を生じる五行（印星）をカウント
  let supportCount = 0;
  let exhaustCount = 0;
  
  meishiki.forEach(pillar => {
    const element = Math.floor(pillar.stemIndex / 2);
    if (element === dayElement || (element + 1) % 5 === dayElement) {
      supportCount++;
    } else {
      exhaustCount++;
    }
  });
  
  // 月令の支援 + 比劫印星の数で判定
  const monthSupports = monthElement === dayElement || (monthElement + 1) % 5 === dayElement;
  
  if (monthSupports && supportCount >= exhaustCount) {
    return 'strong'; // 身強
  }
  return 'weak'; // 身弱
}
```

### 8.2 喜神・忌神の判定

```javascript
function determineKishinGishin(strength) {
  if (strength === 'strong') {
    // 身強：日主を弱める星が喜神
    return {
      kishin: ['食神','傷官','偏財','正財','偏官','正官'],
      gishin: ['比肩','劫財','偏印','印綬']
    };
  } else {
    // 身弱：日主を助ける星が喜神
    return {
      kishin: ['比肩','劫財','偏印','印綬'],
      gishin: ['食神','傷官','偏財','正財','偏官','正官']
    };
  }
}
```

### 8.3 地支の特殊関係

**冲（相冲）** - 最も強い凶作用:
```javascript
const CHONG = {
  0: 6, 1: 7, 2: 8, 3: 9, 4: 10, 5: 11,
  6: 0, 7: 1, 8: 2, 9: 3, 10: 4, 11: 5
}; // 子午冲、丑未冲...
```

**支合** - 吉作用:
```javascript
const SHIGO = {
  0: 1, 1: 0,   // 子丑合
  2: 11, 11: 2, // 寅亥合
  3: 10, 10: 3, // 卯戌合
  4: 9, 9: 4,   // 辰酉合
  5: 8, 8: 5,   // 巳申合
  6: 7, 7: 6    // 午未合
};
```

### 8.4 運勢スコアリング

```javascript
function calculateFortuneScore(meishiki, daiunKanshi, nenunKanshi) {
  const { kishin, gishin } = determineKishinGishin(meishiki.strength);
  
  // 大運の通変星
  const daiunTsuhen = getTsuhensei(meishiki.dayStemIndex, daiunKanshi.stemIndex);
  // 流年の通変星
  const nenunTsuhen = getTsuhensei(meishiki.dayStemIndex, nenunKanshi.stemIndex);
  
  let score = 50; // 基準値
  
  // 大運評価（重み: 60%）
  if (kishin.includes(daiunTsuhen)) score += 20;
  if (gishin.includes(daiunTsuhen)) score -= 20;
  
  // 流年評価（重み: 40%）
  if (kishin.includes(nenunTsuhen)) score += 15;
  if (gishin.includes(nenunTsuhen)) score -= 15;
  
  // 冲のチェック
  if (CHONG[meishiki.dayBranchIndex] === nenunKanshi.branchIndex) {
    score -= 10;
  }
  
  // 支合のチェック
  if (SHIGO[meishiki.dayBranchIndex] === nenunKanshi.branchIndex) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}
```

### 8.5 金運判定

```javascript
function calculateMoneyFortune(meishiki, nenunKanshi) {
  const nenunTsuhen = getTsuhensei(meishiki.dayStemIndex, nenunKanshi.stemIndex);
  let score = 50;
  
  // 財星の年は金運上昇
  if (['偏財','正財'].includes(nenunTsuhen)) score += 25;
  
  // 食傷星は財を生む
  if (['食神','傷官'].includes(nenunTsuhen)) score += 10;
  
  // 比劫星は財を奪う
  if (['比肩','劫財'].includes(nenunTsuhen)) score -= 15;
  
  // 印星は財を剋す
  if (['偏印','印綬'].includes(nenunTsuhen)) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}
```

---

## 第9章：運勢グラフ・年表の実装

### 9.1 年表データ構造

```javascript
function generateFortuneTimeline(meishiki, startYear, endYear) {
  const timeline = [];
  
  for (let year = startYear; year <= endYear; year++) {
    const age = year - meishiki.birthYear;
    
    // 大運の特定
    const daiunIndex = Math.floor((age - meishiki.ritsunAge.years) / 10);
    const daiun = getDaiunKanshi(meishiki.monthPillarIndex, meishiki.direction, daiunIndex);
    
    // 流年
    const nenun = getNenunKanshi(year);
    
    // スコア計算
    const overallScore = calculateFortuneScore(meishiki, daiun, nenun);
    const moneyScore = calculateMoneyFortune(meishiki, nenun);
    
    timeline.push({
      year,
      age,
      daiun: { kanshi: daiun, period: `${daiunIndex * 10 + meishiki.ritsunAge.years}〜歳` },
      nenun: { kanshi: nenun },
      scores: {
        overall: overallScore,
        money: moneyScore,
        love: calculateLoveFortune(meishiki, nenun),
        work: calculateWorkFortune(meishiki, nenun)
      }
    });
  }
  
  return timeline;
}
```

### 9.2 グラフ表示用データ形式

```javascript
{
  "chartData": {
    "labels": [2020, 2021, 2022, 2023, 2024, 2025],
    "datasets": [
      {
        "label": "総合運",
        "data": [65, 72, 58, 80, 75, 82]
      },
      {
        "label": "金運",
        "data": [55, 78, 62, 85, 70, 88]
      }
    ]
  }
}
```

---

## 第10章：技術実装ガイド

### 10.1 推奨ライブラリ

**JavaScript/TypeScript（最推奨）**:
- **lunar-javascript** (`npm install lunar-javascript`)
  - 四柱推命計算に最も包括的
  - 節気計算内蔵
  - 1900-2100年対応
  - MIT License、活発にメンテナンス

```javascript
const { Solar, Lunar } = require('lunar-javascript');

// 四柱推命計算例
const solar = Solar.fromYmd(1990, 5, 15);
const lunar = solar.getLunar();
const bazi = lunar.getEightChar();

console.log('年柱:', bazi.getYear());
console.log('月柱:', bazi.getMonth());
console.log('日柱:', bazi.getDay());
console.log('時柱:', bazi.getTime());
```

**Python**:
- **lunar-python** (`pip install lunar_python`)
  - lunar-javascriptのPython版、同等機能

### 10.2 日付ライブラリ

| ライブラリ | 特徴 | 推奨度 |
|-----------|------|--------|
| date-fns + date-fns-tz | モジュラー、軽量 | ⭐⭐⭐ |
| Luxon | タイムゾーン処理が直感的 | ⭐⭐⭐ |
| Day.js | 軽量、Moment.js互換 | ⭐⭐ |

### 10.3 データベース設計

```sql
-- 命式データ
CREATE TABLE fortune_charts (
  id UUID PRIMARY KEY,
  user_id UUID,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_time_known BOOLEAN DEFAULT true,
  gender VARCHAR(10) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
  
  -- 四柱（JSON形式）
  year_pillar JSONB,
  month_pillar JSONB,
  day_pillar JSONB,
  hour_pillar JSONB,
  
  -- 計算済み属性
  day_master_strength VARCHAR(10),
  direction VARCHAR(10),
  ritsun_age_years INTEGER,
  ritsun_age_months INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 節入り日時マスター
CREATE TABLE solar_terms (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  term_index INTEGER NOT NULL,
  term_name VARCHAR(10) NOT NULL,
  term_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  is_jie BOOLEAN NOT NULL,
  UNIQUE(year, term_index)
);
```

### 10.4 実装の優先順位

**Phase 1（MVP）**:
1. 入力フォーム（生年月日、時刻、性別）
2. 四柱計算（lunar-javascript使用）
3. 命式表示（天干地支、五行）

**Phase 2**:
4. 通変星計算・表示
5. 十二運星計算・表示
6. 蔵干の表示

**Phase 3**:
7. 大運・流年計算
8. 運勢スコアリング
9. 運勢グラフ表示

**Phase 4**:
10. 詳細な解釈文生成
11. PDF出力
12. 相性診断

---

## 第11章：完全なJSONデータ定義

```json
{
  "heavenlyStems": [
    {"index": 0, "kanji": "甲", "reading": "きのえ", "element": 0, "polarity": 0},
    {"index": 1, "kanji": "乙", "reading": "きのと", "element": 0, "polarity": 1},
    {"index": 2, "kanji": "丙", "reading": "ひのえ", "element": 1, "polarity": 0},
    {"index": 3, "kanji": "丁", "reading": "ひのと", "element": 1, "polarity": 1},
    {"index": 4, "kanji": "戊", "reading": "つちのえ", "element": 2, "polarity": 0},
    {"index": 5, "kanji": "己", "reading": "つちのと", "element": 2, "polarity": 1},
    {"index": 6, "kanji": "庚", "reading": "かのえ", "element": 3, "polarity": 0},
    {"index": 7, "kanji": "辛", "reading": "かのと", "element": 3, "polarity": 1},
    {"index": 8, "kanji": "壬", "reading": "みずのえ", "element": 4, "polarity": 0},
    {"index": 9, "kanji": "癸", "reading": "みずのと", "element": 4, "polarity": 1}
  ],
  "earthlyBranches": [
    {"index": 0, "kanji": "子", "reading": "ね", "element": 4, "polarity": 0, "hiddenStems": [9]},
    {"index": 1, "kanji": "丑", "reading": "うし", "element": 2, "polarity": 1, "hiddenStems": [5,9,7]},
    {"index": 2, "kanji": "寅", "reading": "とら", "element": 0, "polarity": 0, "hiddenStems": [0,2,4]},
    {"index": 3, "kanji": "卯", "reading": "う", "element": 0, "polarity": 1, "hiddenStems": [1]},
    {"index": 4, "kanji": "辰", "reading": "たつ", "element": 2, "polarity": 0, "hiddenStems": [4,1,9]},
    {"index": 5, "kanji": "巳", "reading": "み", "element": 1, "polarity": 1, "hiddenStems": [2,6,4]},
    {"index": 6, "kanji": "午", "reading": "うま", "element": 1, "polarity": 0, "hiddenStems": [3,5]},
    {"index": 7, "kanji": "未", "reading": "ひつじ", "element": 2, "polarity": 1, "hiddenStems": [5,3,1]},
    {"index": 8, "kanji": "申", "reading": "さる", "element": 3, "polarity": 0, "hiddenStems": [6,8,4]},
    {"index": 9, "kanji": "酉", "reading": "とり", "element": 3, "polarity": 1, "hiddenStems": [7]},
    {"index": 10, "kanji": "戌", "reading": "いぬ", "element": 2, "polarity": 0, "hiddenStems": [4,7,3]},
    {"index": 11, "kanji": "亥", "reading": "い", "element": 4, "polarity": 1, "hiddenStems": [8,0]}
  ],
  "fiveElements": [
    {"index": 0, "kanji": "木", "reading": "もく", "generates": 1, "controls": 2},
    {"index": 1, "kanji": "火", "reading": "か", "generates": 2, "controls": 3},
    {"index": 2, "kanji": "土", "reading": "ど", "generates": 3, "controls": 4},
    {"index": 3, "kanji": "金", "reading": "きん", "generates": 4, "controls": 0},
    {"index": 4, "kanji": "水", "reading": "すい", "generates": 0, "controls": 1}
  ],
  "tenGods": [
    {"name": "比肩", "reading": "ひけん", "relation": "same_element_same_polarity"},
    {"name": "劫財", "reading": "ごうざい", "relation": "same_element_diff_polarity"},
    {"name": "食神", "reading": "しょくしん", "relation": "generates_same_polarity"},
    {"name": "傷官", "reading": "しょうかん", "relation": "generates_diff_polarity"},
    {"name": "偏財", "reading": "へんざい", "relation": "controls_same_polarity"},
    {"name": "正財", "reading": "せいざい", "relation": "controls_diff_polarity"},
    {"name": "偏官", "reading": "へんかん", "relation": "controlled_same_polarity"},
    {"name": "正官", "reading": "せいかん", "relation": "controlled_diff_polarity"},
    {"name": "偏印", "reading": "へんいん", "relation": "generated_same_polarity"},
    {"name": "印綬", "reading": "いんじゅ", "relation": "generated_diff_polarity"}
  ],
  "twelveStages": [
    {"name": "長生", "reading": "ちょうせい", "energy": 9, "order": 0},
    {"name": "沐浴", "reading": "もくよく", "energy": 7, "order": 1},
    {"name": "冠帯", "reading": "かんたい", "energy": 10, "order": 2},
    {"name": "建禄", "reading": "けんろく", "energy": 11, "order": 3},
    {"name": "帝旺", "reading": "ていおう", "energy": 12, "order": 4},
    {"name": "衰", "reading": "すい", "energy": 8, "order": 5},
    {"name": "病", "reading": "びょう", "energy": 4, "order": 6},
    {"name": "死", "reading": "し", "energy": 2, "order": 7},
    {"name": "墓", "reading": "ぼ", "energy": 5, "order": 8},
    {"name": "絶", "reading": "ぜつ", "energy": 1, "order": 9},
    {"name": "胎", "reading": "たい", "energy": 3, "order": 10},
    {"name": "養", "reading": "よう", "energy": 6, "order": 11}
  ]
}
```

---

## まとめ

本仕様書では、四柱推命Webアプリケーションの実装に必要な以下の情報を網羅しました：

- **基本要素**: 十干・十二支・五行・蔵干の完全な定義とデータ構造
- **四柱算出**: 年柱・月柱・日柱・時柱の具体的計算アルゴリズム
- **暦計算**: 二十四節気、節入り日時データの取得方法
- **派生要素**: 通変星・十二運星の計算ロジックと対応表
- **運勢計算**: 大運・流年の算出、運勢スコアリングロジック
- **技術実装**: 推奨ライブラリ（lunar-javascript）、データベース設計、実装優先順位

**推奨技術スタック**:
- フロントエンド: React/Next.js + date-fns-tz
- 四柱計算: lunar-javascript（npm install lunar-javascript）
- データベース: PostgreSQL（JSONB対応）
- 節気データ: lunar-javascript内蔵 または 国立天文台データ

この仕様書を基に、生成AIまたは開発者が四柱推命システムを構築することが可能です。