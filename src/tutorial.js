// 遊び方の、チュートリアルムービー。絵と動きで、6つの場面を見せる(動画ファイルではなく、画面の中で動かす)。
// 場面は、「次へ」ボタンを押したときだけ進む(自動では進まない)。「戻る」「閉じる」も、ボタンで。

// 場面の見せ方の部品
const seq = (items, cls = "") => `<div class="tg-seq ${cls}">${SEQ(items)}</div>`;
const SEQ = (items) => items.map(([icon, note], n) => `<span class="tg-seq-item" style="--n:${n}"><b>${icon}</b><small>${note}</small></span>`).join("");

// 毎日1問の説明
const DAILY_SCENES = [
  {
    title: "毎日1問",
    caption: "1日に1問だけ出る 今日の問題だよ。1日1回 挑戦できるよ。",
    html: `<div class="tg">${seq([["📅", "今日の問題"], ["❓", "1問だけ"]], "wide")}</div>`,
  },
  {
    title: "毎日1問",
    caption: "毎日続けて解くと 連続の日数がのびて ご褒美がもらえるよ。",
    html: `<div class="tg">${seq([["📅", "1日目"], ["📅", "2日目"], ["📅", "3日目"], ["🎁", "ご褒美"]])}</div>`,
  },
];

// 復習の説明
const REVIEW_SCENES = [
  {
    title: "復習",
    caption: "間違えた問題と ヒントを見て解いた問題が 出るよ。",
    html: `<div class="tg">${seq([["❌", "間違えた問題"], ["💡", "ヒントを見た問題"]], "wide")}</div>`,
  },
  {
    title: "復習",
    caption: "ヒントを見ないで 正解すると 復習から消えるよ。",
    html: `<div class="tg">${seq([["📖", "復習"], ["✅", "正解"], ["✨", "消える"]], "wide")}</div>`,
  },
  {
    title: "復習",
    caption: "制限時間は付かないよ(急がず じっくり 思い出す練習にするため)。",
    html: `<div class="tg">${seq([["⏱", "制限時間"], ["🚫", "付かない"]], "wide")}</div>`,
  },
];

const RPG_SCENES = [
  {
    title: "RPGクエスト",
    caption: "5つのマスを 進んで ボスの ドラゴンを 倒そう! ハートは 4つだよ。",
    html: `<div class="tg">${seq([["🐭", "ザコ"], ["🎁", "宝箱"], ["🦂", "強い敵"], ["🐉", "ボス"]])}</div>`,
  },
  {
    title: "戦い",
    caption: "正解すると 敵に 攻撃! 間違えると ハートが 1つ 減るよ。",
    html: `<div class="tg">${seq([["✅", "正解"], ["⚔️", "攻撃"], ["❌", "間違い"], ["💔", "ハート -1"]])}</div>`,
  },
  {
    title: "ヒント",
    caption: "ヒントを見ると ハートが 半分 減るよ。ハートが 半分しか ない時は 見られないよ。",
    html: `<div class="tg">${seq([["💡", "ヒント"], ["💔", "ハート 半分"]], "wide")}</div>`,
  },
  {
    title: "宝箱・ボス",
    caption: "宝箱は 正解で ハートが 1つ 回復! ボスは 2回 正解すると 倒せるよ。",
    html: `<div class="tg">${seq([["🎁", "回復"], ["🐉", "ボス"], ["⚔️", "2回 攻撃"]])}</div>`,
  },
  {
    title: "間違い・クリア",
    caption: "間違えた問題は 間違いノートに 入るよ。ハートが 0になる前に ドラゴンを 倒そう!",
    html: `<div class="tg">${seq([["❌", "間違い"], ["📓", "ノート"], ["🏆", "クリア"]])}</div>`,
  },
];
const SCENE_SETS = { daily: DAILY_SCENES, review: REVIEW_SCENES, rpg: RPG_SCENES };
let SCENES = RPG_SCENES;

let index = 0;
let onClose = null;
let options = {}; // startLabel:最後の場面の「次へ」を、この名前の「始めるボタン」にする / skipLabel:閉じるボタンの名前 / skipStarts:閉じるボタンでも、始める

const $ = (id) => document.getElementById(id);

function render() {
  const scene = SCENES[index];
  $("tut-title").textContent = scene.title;
  $("tut-caption").textContent = scene.caption;
  const stage = $("tut-stage");
  stage.replaceChildren();
  stage.insertAdjacentHTML("beforeend", scene.html);
  stage.className = `tut-stage tut-scene-${index + 1}`;
  void stage.offsetWidth; // 動きを、初めからやりなおす
  $("tut-dots").replaceChildren(
    ...SCENES.map((_, i) => {
      const dot = document.createElement("span");
      dot.className = `tut-dot${i === index ? " is-on" : i < index ? " is-done" : ""}`;
      return dot;
    }),
  );
  $("tut-prev").disabled = index === 0;
  const last = index === SCENES.length - 1;
  $("tut-next").textContent = last ? (options.startLabel ?? "もう1度 見る") : "次へ ▶";
  $("tut-next").classList.toggle("is-start", last && Boolean(options.startLabel));
  $("tut-skip").textContent = options.skipLabel ?? "閉じる";
}

function go(next) {
  index = Math.min(SCENES.length - 1, Math.max(0, next));
  render();
}

export function openTutorial(closed, kind = "play", opts = {}) {
  onClose = closed ?? null;
  options = opts;
  SCENES = SCENE_SETS[kind] ?? RPG_SCENES;
  index = 0;
  $("tutorial").hidden = false;
  render();
  $("tut-next").focus({ preventScroll: true });
}

// started:始めるボタンで閉じた(true)か、ただ閉じた(false)か
export function closeTutorial(started = false) {
  $("tutorial").hidden = true;
  const callback = onClose;
  onClose = null;
  callback?.(started || Boolean(options.skipStarts));
}

export function initTutorial() {
  $("tut-next").addEventListener("click", () => {
    if (index === SCENES.length - 1 && options.startLabel) closeTutorial(true);
    else go(index === SCENES.length - 1 ? 0 : index + 1);
  });
  $("tut-prev").addEventListener("click", () => go(index - 1));
  $("tut-skip").addEventListener("click", () => closeTutorial());
  $("tutorial").addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTutorial();
  });
}
