// クイズのルール:フリップ(めくる板)形式。遊び方のチュートリアルと同じように、「次へ」を押すと次の場面へ進む。
// 選んだ遊び方に合わせて、場面が変わる:普通(黄色)・難しい(オレンジ)・RPGクエスト(赤)。画面の色も、遊び方で変わる。

const Q = '<div class="rf-q"><span class="rf-qn">Q</span> りんご3こ+みかん2こ=?</div>';
const CH = (cls = "") => `<div class="rf-ch ${cls}"><span>4こ</span><span class="rf-ok">5こ</span><span>6こ</span></div>`;

const COMMON = [
  {
    title: "① 答えを選ぶ",
    caption: "問題の答えを選ぼう。正解すると点がもらえるよ!",
    html: `${Q}${CH("f1")}<span class="rf-badge rf-good b1">⭕ 正解! +1点</span><span class="rf-finger fg1">👆</span>`,
  },
  {
    title: "② ヒント",
    caption: "ヒントを見るとその問題の点が半分になるよ。",
    html: `${Q}${CH()}<span class="rf-btn rf-hintbtn">💡 ヒント</span><span class="rf-hinttext">たし算をしてみよう</span><span class="rf-pts"><s>1点</s> → <b>0.5点</b><small>半分</small></span><span class="rf-finger fg2">👆</span>`,
  },
  {
    title: "③ 分からない",
    caption: "「分からない」を押すと答えが見られるよ。でも不正解になるよ。",
    html: `${Q}${CH()}<span class="rf-btn rf-givebtn">🤔 分からない</span><span class="rf-answer">答えは「5こ」</span><span class="rf-badge rf-bad b3">❌ 不正解 0点</span><span class="rf-finger fg3">👆</span>`,
  },
  {
    title: "④ 制限時間",
    caption: "制限時間をつけると 1問 30秒。時間切れは不正解。",
    html: `<div class="rf-clock"><span class="rf-clock-n">⏱ 30秒</span><span class="rf-bar"><i></i></span><span class="rf-over">⏰ 時間切れ!</span></div>`,
  },
];

const SOLO = [
  {
    title: "① 1回は 5問",
    caption: "1回は 5問。正解すると 1問で 1点。5問全部で 5点満点だよ。",
    html: `<div class="rf-five">${[1, 2, 3, 4, 5].map((n) => `<span style="--n:${n - 1}"><b>${n}</b><em>+1</em></span>`).join("")}</div><span class="rf-total">合計 5点満点</span>`,
  },
  {
    title: "② 続くと難しく",
    caption: "正解が続くと問題が難しく。全部の問題で 100点満点の総合得点を目指そう!",
    html: `<div class="rf-ladder"><span class="l1">難しさ ★☆☆☆</span><span class="l2">難しさ ★★☆☆</span><span class="l3">難しさ ★★★☆</span></div><div class="rf-chain"><span>⭕</span><span>⭕</span><span>⭕</span><em>⬆ 難しく!</em></div><span class="rf-total t100">🏆 総合得点 100点満点</span>`,
  },
];

const HEART = '<img class="rf-heart" src="../assets/illust/heart.webp" alt="">';
const HEART_HALF = `<span class="rf-hw">${'<img class="rf-heart is-off" src="../assets/illust/heart.webp" alt="">'}<img class="rf-heart is-half" src="../assets/illust/heart.webp" alt=""></span>`;
const HEART_OFF = '<img class="rf-heart is-off" src="../assets/illust/heart.webp" alt="">';
const SEQ = (items, cls = "") =>
  `<div class="rf-seq ${cls}">${items.map(([icon, note], n) => `<span class="rf-seq-item" style="--n:${n}"><b>${icon}</b><small>${note}</small></span>`).join("")}</div>`;
const HEARTS = (list, cls = "") => `<div class="rf-hearts ${cls}">${list.join("")}</div>`;
const STACK = (...parts) => `<div class="rf-stack">${parts.join("")}</div>`;

// 難しいモード
const HARD = [
  {
    title: "② 難しい問題",
    caption: "難しい問題だけが出るよ。正解すると 1問で 1点。全部の問題で 100点満点の総合得点を目指そう!",
    html: `${SEQ([["🔥", "難しい問題"], ["⭕", "正解"], ["🏆", "総合得点"]])}`,
  },
];

// フロリが いっしょに 出る場面(ものがたり調)。絵は フロリ+ひつような ものだけ
const FL = '<img class="rf-fl" src="../assets/flori/m/wave_nikkori.png" alt="">';
const SCENE = (...parts) => `<div class="rf-scene">${FL}<div class="rf-side">${parts.join("")}</div></div>`;
const ONE = (icon, note) => `<div class="rf-seq"><span class="rf-seq-item" style="--n:0"><b>${icon}</b><small>${note}</small></span></div>`;

// RPGクエスト
const RPG = [
  {
    title: "① ドラゴンのお城へ",
    caption: "ボクはお城のドラゴンに会いに行くヨ! 5つのマスを進んで、ボスを倒そう!",
    html: SCENE(SEQ([["🐭", "ザコ"], ["🎁", "宝箱"], ["🦂", "強い敵"], ["🐉", "ボス"]])),
  },
  {
    title: "② ハートは 4つ",
    caption: "ボクのハートは 4つ。間違えると 1つ減って、全部なくなるとゲームオーバーだヨ…!",
    html: SCENE(HEARTS([HEART, HEART, HEART, HEART], "rf-lose")),
  },
  {
    title: "③ 戦い",
    caption: "正解するとえいっ! と攻撃。間違えると敵にやられて、ハートが 1つ減るヨ。",
    html: SCENE(SEQ([["⚔️", "正解で攻撃"], ["💔", "間違いで −1"]])),
  },
  {
    title: "④ ヒント",
    caption: "困ったらヒントを見よう。ハートが半分減るけど、ボクが助けてあげるヨ!",
    html: SCENE(STACK(ONE("💡", "ヒント"), HEARTS([HEART, HEART, HEART, HEART_HALF]))),
  },
  {
    title: "⑤ 宝箱とボス",
    caption: "宝箱は正解でハートが 1つ回復! ボスは 2回正解すると倒せるヨ。",
    html: SCENE(SEQ([["🎁", "回復"], ["🐉", "2回で倒す"]])),
  },
  {
    title: "⑥ ノートとクリア",
    caption: "間違えた問題はノートに残るヨ。ハートがなくなる前に、ドラゴンを倒してクリアだ!",
    html: SCENE(SEQ([["📓", "ノート"], ["🏆", "クリア"]])),
  },
];

// 毎日1問
const DAILY = [
  {
    title: "① 今日の 1問",
    caption: "今日もフロリのおうちに、特別な問題が 1問届いたヨ! 1日に 1回、挑戦できるんだ。",
    html: SCENE(ONE("📅", "毎日 1問")),
  },
  {
    title: "② また 明日",
    caption: "間違えても大丈夫。明日になれば、また新しい問題が届くヨ。毎日 続けてみよう!",
    html: SCENE(SEQ([["🌙", "明日"], ["📅", "新しい問題"]])),
  },
];

// 復習
const REVIEW = [
  {
    title: "① 間違いノート",
    caption: "間違えた問題は、ボクの間違いノートに入っているヨ。",
    html: SCENE(ONE("📓", "間違いノート")),
  },
  {
    title: "② もう1度 挑戦",
    caption: "ノートの問題をもう1度解いて、しっかり覚えよう! 次はきっと正解できるヨ!",
    html: SCENE(SEQ([["📓", "ノート"], ["⭕", "覚えた!"]])),
  },
];

// 遊び方ごとの、場面・色・名札
const KINDS = {
  daily: { theme: "daily", tag: "📅 毎日1問", scenes: () => DAILY },
  review: { theme: "review", tag: "📓 復習", scenes: () => REVIEW },
  normal: { theme: "solo", tag: "🌱 1人で普通", scenes: () => [...COMMON, ...SOLO] },
  hard: { theme: "hard", tag: "🔥 1人で難しい", scenes: () => [...COMMON, SOLO[0], ...HARD] },
  rpg: { theme: "rpg", tag: "🗡️ RPGクエスト", scenes: () => RPG },
};
let kind = "normal";
let SCENES = [];

let index = 0;
let onDone = null;
const $ = (id) => document.getElementById(id);

const CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩";
function render() {
  const scene = SCENES[index];
  const screen = $("screen-rules");
  const info = KINDS[kind];
  screen.classList.remove("rf-solo", "rf-hard", "rf-rpg", "rf-daily", "rf-review");
  screen.classList.add(`rf-${info.theme}`);
  $("rf-tag").textContent = info.tag;
  $("rf-title").textContent = `${CIRCLED[index] ?? ""} ${scene.title.replace(/^[①-⑩]\s*/, "")}`; // 番号は、場面の順につける
  $("rf-caption").textContent = scene.caption;
  $("rf-skip").textContent = `ルールを飛ばして ${lastEndLabel === "クイズのモード選択へ" ? "モード選択へ" : lastEndLabel}`;
  const stage = $("rf-stage");
  stage.replaceChildren();
  stage.insertAdjacentHTML("beforeend", scene.html);
  stage.className = `rf-stage rf-s${index + 1}`;
  void stage.offsetWidth; // 動きを、初めからやりなおす
  $("rf-dots").replaceChildren(
    ...SCENES.map((item, i) => {
      const dot = document.createElement("span");
      dot.className = `tut-dot rf-dot-${info.theme}${i === index ? " is-on" : i < index ? " is-done" : ""}`;
      return dot;
    }),
  );
  $("rf-prev").disabled = index === 0;
  $("btn-rules-next").innerHTML = index === SCENES.length - 1 ? `${lastEndLabel} <span aria-hidden="true">▶</span>` : '次へ <span aria-hidden="true">▶</span>';
}

// 遊び方(normal・hard・rpg)に合わせた、ルールを開く。done:最後まで見たとき・とばしたとき(なければ、はじめに渡したもの)
export function openRules(nextKind = "normal", done = null, endLabel = "クイズのモード選択へ") {
  lastEndLabel = endLabel;
  kind = KINDS[nextKind] ? nextKind : "normal";
  SCENES = KINDS[kind].scenes();
  onDone = done ?? defaultDone;
  index = 0;
  render();
}

let defaultDone = null;
let lastEndLabel = "クイズのモード選択へ";
export function initRules(done) {
  defaultDone = done;
  onDone = done;
  $("btn-rules-next").addEventListener("click", () => {
    if (index === SCENES.length - 1) onDone?.();
    else {
      index += 1;
      render();
    }
  });
  $("rf-prev").addEventListener("click", () => {
    index = Math.max(0, index - 1);
    render();
  });
  $("rf-skip").addEventListener("click", () => onDone?.());
}
