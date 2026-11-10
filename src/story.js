// RPGクエストの物語(仮)。フロリの家族(パパフロリ・ママフロリ)が、ドラゴンにさらわれた。
// 家族の絵は、新しく描いたものではなく、いまのフロリの絵に、色をつけて、帽子・リボンを のせたもの(着せ替えの絵を使う)。
import { HEADS } from "./badges.js";

const FLORI = "../assets/flori/m/body_wave.webp";

const ROLES = {
  flori: { name: "フロリ", tint: "" },
  papa: { name: "パパフロリ", tint: "sepia(1) hue-rotate(172deg) saturate(2.4) brightness(1.06)", head: "head29" }, // シルクハット
  mama: { name: "ママフロリ", tint: "sepia(1) hue-rotate(298deg) saturate(2.2) brightness(1.1)", head: "head01" }, // リボン
};

// 1人ぶんの絵(フロリの絵+色+帽子)
export function figure(role, cls = "") {
  const r = ROLES[role];
  const hat = r.head ? HEADS.find((item) => item.id === r.head) : null;
  const hatHtml = hat
    ? `<img class="fam-hat" src="${hat.img}" alt="" style="left:${hat.pos.x}%;top:${hat.pos.y}%;width:${hat.pos.w}%;--sx:${hat.pos.sx ?? 1};--sy:${hat.pos.sy ?? 1}">`
    : "";
  return `<span class="fam fam-${role} ${cls}"><img class="fam-img" src="${FLORI}" alt="${r.name}" style="${r.tint ? `filter:${r.tint}` : ""}">${hatHtml}</span>`;
}

// 場面の絵
const SCENES = {
  home: () => `${figure("papa")}${figure("flori", "fam-main")}${figure("mama")}`,
  captive: () => `${figure("papa", "is-captive")}<span class="story-boss" aria-hidden="true">🐉</span>${figure("mama", "is-captive")}`,
  go: () => `${figure("flori", "fam-main")}<span class="story-boss" aria-hidden="true">⚔️</span>`,
  rescued: () => `${figure("papa")}${figure("flori", "fam-main")}${figure("mama")}<span class="story-spark" aria-hidden="true">🎉</span>`,
};

// はじめて、RPGを始めるときの お話
export const PROLOGUE = [
  { scene: "home", who: "ナレーション", text: "フロリは、パパフロリ・ママフロリと、なかよく くらしていました。" },
  { scene: "captive", who: "ナレーション", text: "ところが ある日、ドラゴンが 現れて、パパとママを つれさってしまったのです!" },
  { scene: "captive", who: "パパフロリ", text: "フロリ、たすけてくれ〜!" },
  { scene: "captive", who: "ママフロリ", text: "ひらめきの 力を 信じてネ!" },
  { scene: "go", who: "フロリ", text: "まかせて! ひらめきクイズで ドラゴンを たおして、パパとママを たすけるヨ!" },
];

// RPGで、新しい敵が現れたときの 一言(retries が 0 のとき)
export const STAGE_LINES = [
  "パパの 帽子を くわえているヨ! 取りかえそう!",
  "ママの リボンの ゆくえを 知っているみたい…!",
  "家族からの 手紙が 入っているみたい!",
  "ドラゴンの お城の 門番だ! ここを 通ろう!",
  "「家族を 返してほしくば ボクの なぞを とけ!」",
];

// ドラゴンを倒したあと
export const EPILOGUE = [
  { scene: "captive", who: "ドラゴン", text: "まいった…! ひらめきの 力には かなわないヨ。" },
  { scene: "rescued", who: "パパフロリ", text: "フロリ、ありがとう! さすが ボクたちの 子だ!" },
  { scene: "rescued", who: "ママフロリ", text: "ひらめきの 力、かっこよかったわ!" },
  { scene: "rescued", who: "ナレーション", text: "こうして フロリたち 家族は、また なかよく くらしました。おしまい。" },
];

let lines = [];
let index = 0;
let onEnd = null;
const $ = (id) => document.getElementById(id);

function render() {
  const line = lines[index];
  $("story-scene").innerHTML = SCENES[line.scene]();
  $("story-scene").dataset.scene = line.scene;
  $("story-who").textContent = line.who;
  $("story-who").hidden = line.who === "ナレーション";
  $("story-text").textContent = line.text;
  $("btn-story-next").textContent = index === lines.length - 1 ? "つづく ▶" : "次へ ▶";
  $("btn-story-skip").hidden = index === lines.length - 1;
}

function finish() {
  $("story").hidden = true;
  const done = onEnd;
  onEnd = null;
  done?.();
}

export function initStory() {
  $("btn-story-next").addEventListener("click", () => {
    if (index < lines.length - 1) {
      index += 1;
      render();
    } else finish();
  });
  $("btn-story-skip").addEventListener("click", finish);
}

export function playStory(next, then) {
  lines = next;
  index = 0;
  onEnd = then;
  $("story").hidden = false;
  render();
}

// 「1回だけ」の お話
export function storyOnce(key, next, then) {
  const storageKey = `floriQuiz.guideSeen.${key}`;
  let seen = false;
  try {
    seen = localStorage.getItem(storageKey) === "1";
    localStorage.setItem(storageKey, "1");
  } catch {
    // 保存できなくても、遊べる(毎回、お話が出るだけ)
  }
  if (seen) then();
  else playStory(next, then);
}
