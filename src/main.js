import { buildMeishiki } from "./calculations.js";
import { STEMS } from "./constants.js";

const form = document.getElementById("bazi-form");
const resultCard = document.getElementById("result-card");
const pillarsContainer = document.getElementById("pillars");
const derivedContainer = document.getElementById("derived");
const directionChip = document.getElementById("direction-chip");
const resetButton = document.getElementById("reset-button");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const dateInput = document.getElementById("birth-date").value;
  const timeInput = document.getElementById("birth-time").value || "00:00";
  const gender = document.getElementById("gender").value;
  const useMidnightSwitch =
    document.getElementById("midnight-switch").value === "true";

  if (!dateInput) return;

  const [hours, minutes] = timeInput.split(":").map((n) => Number(n));
  const [year, month, day] = dateInput.split("-").map((n) => Number(n));
  const date = new Date(year, month - 1, day, hours, minutes, 0);

  const meishiki = buildMeishiki(date, gender, useMidnightSwitch);
  renderResult(meishiki);
});

resetButton.addEventListener("click", () => {
  form.reset();
  resultCard.hidden = true;
});

function renderResult(meishiki) {
  resultCard.hidden = false;
  directionChip.textContent = `大運: ${meishiki.direction}（日干 ${
    STEMS[meishiki.dayStemIndex].kanji
  }） / 日主: ${meishiki.strength}`;

  const rows = meishiki.pillars
    .map(
      (p) => `
      <tr>
        <th scope="row">${p.name}</th>
        <td><span class="badge">${p.stem}${p.branch}</span></td>
        <td>${p.element}</td>
        <td>${p.polarity}</td>
        <td>${p.tsuhensei ?? "-"}</td>
        <td>${p.juniunsei.name}（${p.juniunsei.index}）</td>
        <td>${p.hiddenStems.join("・")}</td>
      </tr>
    `,
    )
    .join("");

  pillarsContainer.innerHTML = `
    <table class="table" aria-label="四柱一覧">
      <thead>
        <tr>
          <th>柱</th>
          <th>干支</th>
          <th>五行</th>
          <th>陰陽</th>
          <th>通変星</th>
          <th>十二運</th>
          <th>蔵干</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  derivedContainer.innerHTML = `
    <div class="meta-grid">
      <div class="meta-item">
        <h3>日主</h3>
        <p>${pLabel(meishiki.pillars[2])}</p>
      </div>
      <div class="meta-item">
        <h3>身強/身弱</h3>
        <p>${meishiki.strength}</p>
      </div>
      <div class="meta-item">
        <h3>計算日時</h3>
        <p>${meishiki.date.toLocaleString("ja-JP")}</p>
      </div>
      <div class="meta-item">
        <h3>性別</h3>
        <p>${meishiki.gender === "male" ? "男性" : "女性"}</p>
      </div>
    </div>
  `;
}

function pLabel(pillar) {
  return `${pillar.stem}${pillar.branch}（${pillar.element} / ${pillar.polarity}）`;
}
