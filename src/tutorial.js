// 遊び方の、チュートリアルムービー。クイズのルール(rules.js)と同じ場面(フロリ+イラスト+物語調の文)を、そのまま見せる。
// 場面は、「次へ」ボタンを押したときだけ進む(自動では進まない)。「戻る」「閉じる」も、ボタンで。
import { getScenes } from "./rules.js?v=20261124c";

let SCENES = [];

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
  $("tut-next").textContent = last ? (options.startLabel ?? "もう1度見る") : "次へ ▶";
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
  SCENES = getScenes(kind).scenes;
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
