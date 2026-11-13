// 動くフロリ(Live2D)。画面に出ている「ポーズつきのフロリの絵」(img.flori)の上に、同じ場所・同じ大きさで、canvas を重ねて、絵のかわりに動かす。
//  - 絵(img)は、そのまま残す(大きさ・ゆれる動き・着せ替えのかざりの位置は、絵のものを使う)。動くフロリが出せるまでは、絵が見える。
//  - かざり(頭・体・顔)は、いままでどおり。絵の見えている場所にそろえて、重ねる(decor-overlay.js)。
//  - 色(着せ替えの色)は、体・頭・手足の絵を、flori-color.js で色づけしてから、貼る。
//  - 出さない画面:クイズ(問題・RPG)。表紙は、クリックで ぴょん。着せ替え画面でも、腕を動かす。
import { draw, loadModel } from "./live2d/live2d.js?v=20261113x";
import { createMotion } from "./live2d/flori-motion.js?v=20261113x";
import { playJump } from "./audio.js?v=20261113x";
import { getFloriColor, recolorCanvas } from "./flori-color.js?v=20261113x";
import { HEADS } from "./badges.js?v=20261113x";

// ポーズつきの絵のうち、動くフロリにかえるもの(かざりの位置が合う絵。decor-overlay.js の POSE と同じ)
const POSE = /(?:wave_(?:nikkori|smile|wrong|surprised)\.png|body_wave\.webp)$/;
const MOOD = { wave_wrong: "こまった", wave_surprised: "びっくり" }; // 絵のポーズに合わせた、ずっと同じ表情
const EXCLUDE = "#screen-question, #screen-rpg, #screen-gameover, #dlg-unlock, #dlg-giveup, .hint-dialog"; // クイズ画面・ゲームオーバー・新しいかざりをゲットのダイアログ・わからないとヒントのダイアログ・RPGは、動くフロリを出さない(動かない絵)
const TINT_PARTS = /^(体|顔|右足|左足|右手(コブシ|バンザイ)|左手(コブシ|バンザイ))$/; // 色をつけるパーツ
const LINE_LUM = 150; // これより暗い所を「線」とみなして、太らせる
const TINT_SCALE = 0.3; // 色をつけるときの、絵の縮め具合(もようの大きさを、静止画に近づける。大きいと、重い)

// 絵を、scale 倍まで、半分ずつ縮める(線を欠けさせない)。小さい絵は、そのまま
function shrink(source, scale = TINT_SCALE) {
  const w0 = source.naturalWidth ?? source.width;
  const h0 = source.naturalHeight ?? source.height;
  const goalW = Math.max(1, Math.round(w0 * scale));
  const goalH = Math.max(1, Math.round(h0 * scale));
  if (w0 <= 700) return source;
  let cur = source, w = w0, h = h0;
  while (w > goalW) {
    w = Math.max(goalW, Math.round(w / 2));
    h = Math.max(goalH, Math.round(h / 2));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(cur, 0, 0, w, h);
    cur = c;
  }
  return cur;
}
// 縮めた絵の、暗い線を、まわり1ピクセルぶん太らせる(縮めると、細い線が うすくなるので。静止画の線の太さに近づける)
function thicken(canvas) {
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const a = src.data, b = out.data;
  b.set(a);
  const lum = (i) => (a[i] + a[i + 1] + a[i + 2]) / 3;
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = (y * w + x) * 4;
      if (a[i + 3] < 128) continue;
      let best = i, bl = lum(i);
      for (const j of [i - 4, i + 4, i - w * 4, i + w * 4]) {
        if (a[j + 3] < 128) continue;
        const l = lum(j);
        if (l < bl - 40 && l < LINE_LUM) { bl = l; best = j; }
      }
      if (best !== i) { b[i] = a[best]; b[i + 1] = a[best + 1]; b[i + 2] = a[best + 2]; }
    }
  }
  ctx.putImageData(out, 0, 0);
  return canvas;
}
function shrinkAll(m) {
  const map = new Map();
  for (const mesh of m.meshes) if (!map.has(mesh.img)) { const original = m.imgs.get(mesh.img); const small = shrink(original); map.set(mesh.img, small !== original ? thicken(small) : small); }
  return map;
}

// 静止画(800×1003)の場所 → Live2D のキャンバスの座標: X = X0 + x / S、Y = Y0 + y / S(頭の大きさと位置を、静止画に合わせた。測り方は decisions その50 その31)
const FRAME = { w: 800, h: 1003 };
const S = 0.362; // 頭の幅を、静止画に合わせた(3%せまい)。いっしょに体も少し ふえる(+4%)
const X0 = 304;
const Y0 = 861;
const MARGIN = { x: 0.06, y: 0.03 }; // 腕などが はみ出してもよいように、canvas を、絵より少し大きくする(絵に対する割合)
// 首のかしげ:顔の部品(回転)の角度を、パラメーターの値から求める(かざりを、いっしょに かたむけるため)
const PIVOT = { x: 1459.5, y: 1696.5 }; // 顔の回転の中心(キャンバス座標)
function faceAngle(m = model) {
  const d = m.deformers.find((deformer) => deformer.binds.length === 1 && m.params[deformer.binds[0].param].name === "顔");
  if (!d) return 0;
  const v = m.values[d.binds[0].param];
  const k = d.binds[0].keys;
  if (v <= k[0]) return d.forms[0].angle;
  if (v >= k[k.length - 1]) return d.forms[k.length - 1].angle;
  let i = 0;
  while (v > k[i + 1]) i += 1;
  const t = (v - k[i]) / (k[i + 1] - k[i]);
  return d.forms[i].angle + (d.forms[i + 1].angle - d.forms[i].angle) * t;
}
function tiltDecor(img, angle, m) {
  const foot = `${(((FOOT.px - X0) * S) / FRAME.w) * 100}% ${(((FOOT.py - Y0) * S) / FRAME.h) * 100}%`;
  const origin = `${(((PIVOT.x - X0) * S) / FRAME.w) * 100}% ${(((PIVOT.y - Y0) * S) / FRAME.h) * 100}%`;
  for (const box of img.parentElement.querySelectorAll(":scope > .decor")) {
    box.style.setProperty("--tilt", `${angle.toFixed(2)}deg`);
    box.style.setProperty("--tilt-origin", origin);
    box.style.setProperty("--hop-y", `${((-m.bounce * S) / FRAME.h) * 100}%`); // ジャンプで体が上がった分・つぶれた分を、かざりにも
    box.style.setProperty("--sx", String(m.sx));
    box.style.setProperty("--sy", String(m.sy));
    box.style.setProperty("--foot-origin", foot);
  }
}

const FOOT = { px: 1455, py: 3470 }; // つぶれ・のびの支点(足もと)

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mounts = new Map(); // img → { canvas, motion, key, ready, size }
let model = null;
let loading = null;
let base = null; // 大きい絵を、段階的に半分ずつ縮めた絵(Map)。一気に縮めると、細い線が欠けて、輪郭が細く見えるため
let tint = null; // 色をつけた絵 { id, imgs: Map(ファイル → canvas) }
let tintJob = 0;

const originalSrc = (img) => img.dataset.orig ?? img.getAttribute("src") ?? "";
const eligible = (img) => POSE.test(originalSrc(img)) && !img.closest(EXCLUDE);

function ensureModel() {
  loading ??= loadModel(new URL("./live2d/", import.meta.url).href).then((m) => {
    model = m;
    base = shrinkAll(m);
    retint();
    return m;
  }).catch((error) => {
    // 動くフロリの用意に失敗したら、静止画のフロリを、必ず見せる
    console.error(error);
    window.__floriLog?.("[live-flori] " + error);
    showStillFlori();
  });
  return loading;
}

// 動くフロリが出せないとき(読みこみ失敗・描けない)の保険:静止画のフロリを出す
function showStillFlori() {
  for (const img of document.querySelectorAll("img.flori")) img.style.visibility = "";
  document.getElementById("opening")?.classList.add("live-ready");
  failed = true;
}
let failed = false;

// 色づけ(着せ替えの色が変わるたび。重いので、パーツごとに間をあける)
async function retint() {
  if (!model) return;
  const color = getFloriColor();
  const job = ++tintJob;
  if (!color) {
    tint = null;
    return;
  }
  const imgs = new Map();
  for (const mesh of model.meshes) {
    if (!TINT_PARTS.test(mesh.name) || imgs.has(mesh.img)) continue;
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (job !== tintJob) return;
    const small = base?.get(mesh.img) ?? model.imgs.get(mesh.img);
    const shrunk = small !== model.imgs.get(mesh.img); // 縮めてある絵は、そのまま(もう TINT_SCALE ぶん縮んでいる)
    imgs.set(mesh.img, recolorCanvas(small, color, shrunk ? 1 : TINT_SCALE, mesh.name === "顔" ? 0.87 : 0)); // 頭は、バイザーの下の影・ふちの混ざった色(明るさ 0.87 より暗い部分)に、色をつけない
  }
  if (job === tintJob) tint = { id: color.id, imgs };
}
document.addEventListener("flori-color", () => {
  tint = null;
  retint();
});

let mergedFor = null, merged = null;
function drawImgs() {
  if (!tint) return base;
  if (mergedFor !== tint) { mergedFor = tint; merged = new Map([...base, ...tint.imgs]); }
  return merged;
}

function view(bounce) {
  const mx = MARGIN.x * FRAME.w;
  const my = MARGIN.y * FRAME.h;
  return { x: X0 - mx / S, y: Y0 - my / S + bounce, w: (FRAME.w + 2 * mx) / S, h: (FRAME.h + 2 * my) / S };
}

// 足もとの影(静止画にある、水色の楕円)
// 影は、フロリが動いても(跳ねる・息)、画面の同じ場所に置く(bounce = からだの上への動き。その分、影を下げて打ち消す)
function shadow(ctx, bounce = 0) {
  ctx.save();
  ctx.fillStyle = "rgba(160, 190, 205, 0.55)";
  ctx.beginPath();
  ctx.ellipse(1455, 3485 + bounce, 520, 105, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 絵(img)の上に、canvas を載せる場所:かざりの入れもの(絵の見えている場所にそろえてある)があれば、その中。表紙などの hero-fig なら、その中
function host(img) {
  const front = img.nextElementSibling?.nextElementSibling;
  if (front?.classList.contains("decor-front")) return front;
  return img.closest(".hero-fig");
}

function mount(img) {
  const box = host(img);
  if (!box) return null;
  const canvas = document.createElement("canvas");
  canvas.className = "live-flori";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = `position:absolute;left:${-MARGIN.x * 100}%;top:${-MARGIN.y * 100}%;width:${(1 + 2 * MARGIN.x) * 100}%;height:${(1 + 2 * MARGIN.y) * 100}%;pointer-events:none;`;
  canvas.style.zIndex = box.classList.contains("decor-front") ? "0" : "1";
  box.prepend(canvas);
  if (box.classList.contains("hero-fig")) box.classList.add("has-live"); // CSS の はねる動きを小さくする
  const item = { canvas, motion: null, key: "", ready: false, size: "", box };
  if (img.closest("#screen-cover")) {
    canvas.style.pointerEvents = "auto";
    canvas.addEventListener("pointerdown", () => { tapAt = performance.now(); item.motion?.hop(performance.now()); }); // 表紙は、クリックで ぴょん
  }
  mounts.set(img, item);
  return item;
}

// フロリの動きの音:ひとりでに動くとき(ぴょん・伸び・手を振る・表情)は、鳴らさない(動くたびに鳴ってうるさいため)。
// 表紙で、利用者がフロリを押して ぴょんと跳ねさせたときだけ、ぷよん、と鳴らす
let tapAt = -99999;
function moveSound(item, kind) {
  if (kind !== "hop" || document.hidden || reduced || item.box.closest("#opening")) return;   // オープニングは、専用の音がある
  if (performance.now() - tapAt > 500) return;   // 押していない(ひとりでに跳ねた)ときは、鳴らさない
  playJump();
}

// 動くフロリを、いますぐ ぴょんと跳ねさせる(root の中のもの)。オープニングの画面タッチなどから
export function hopFlori(root) {
  const now = performance.now();
  for (const item of mounts.values()) if (item.ready && item.box.closest(root)) item.motion?.hop(now);
}
// オープニングは、動くフロリの用意ができるまで、フロリ(静止画)を出さない(静止画が一瞬 出て、動くフロリに かわるのを防ぐ)
const openingBox = () => document.getElementById("opening");
setTimeout(() => openingBox()?.classList.add("live-ready"), 4000); // 用意できなくても、4秒たったら出す

function configure(img, item) {
  const src = originalSrc(img);
  const mood = MOOD[(/(wave_\w+)\.png$/.exec(src) ?? [])[1]] ?? null;
  const noArms = false; // 着せ替え画面でも、腕を動かす(利用者の指示)
  const key = `${mood}|${noArms}`;
  if (item.key === key) return;
  item.key = key;
  item.motion = createMotion(model, { mood, noArms, onEvent: (kind) => moveSound(item, kind) });
}

let last = 0;
function frame(now) {
  if (now - last < 30) return requestAnimationFrame(frame); // 約30コマ/秒(スマホで重くならないように)
  last = now;
  for (const [img, item] of mounts) {
    if (!img.isConnected) {
      item.canvas.remove();
      mounts.delete(img);
      continue;
    }
    if (!eligible(img) || img.offsetParent === null || !model) continue;
    if (item.box !== host(img)) {
      // かざりの入れものが、つくりなおされた(絵が入れかわった)。canvas を、つけなおす
      const box = host(img);
      if (!box) continue;
      item.box = box;
      box.prepend(item.canvas);
    }
    configure(img, item);
    const { canvas } = item;
    // かざりで フロリを縮めている(decor-overlay の fit)とき、絵とかざりは縮むが、hero-fig の中の canvas は縮まず、かざり(帽子)の位置が ずれる。同じ倍率で縮める
    if (canvas.parentElement?.classList.contains("has-live")) {
      canvas.style.scale = img.style.scale || "";
      canvas.style.transformOrigin = img.style.transformOrigin || "";
    }
    // 入れもの(hero-fig など)が 絵より たて長だと、%指定の canvas が たてに のびる。絵(img)の実際の位置・大きさに、px で そろえる(縦横比は 絵のまま)
    if (img.offsetWidth > 0 && canvas.offsetParent === img.offsetParent) {
      const ow = img.offsetWidth, oh = img.offsetHeight;
      const cs = canvas.style;
      cs.left = `${img.offsetLeft - MARGIN.x * ow}px`;
      cs.top = `${img.offsetTop - MARGIN.y * oh}px`;
      cs.width = `${(1 + 2 * MARGIN.x) * ow}px`;
      cs.height = `${(1 + 2 * MARGIN.y) * oh}px`;
    }
    // ホームの かざりの入れもの(#hero-decor)は、hero-fig いっぱい(絵より たて長)で、かざりの位置が、ほかの画面より ずれる。絵(img)の位置・大きさに、そろえる
    const hd = img.closest("#screen-cover") ? img.parentElement.querySelector(":scope > #hero-decor") : null;
    if (hd && img.offsetWidth > 0) {
      const hs = hd.style;
      hs.inset = "auto";
      hs.left = `${img.offsetLeft}px`;
      hs.top = `${img.offsetTop}px`;
      hs.width = `${img.offsetWidth}px`;
      hs.height = `${img.offsetHeight}px`;
    }
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(Math.min(canvas.clientWidth * dpr, 640));
    const h = Math.round((w * (1 + 2 * MARGIN.y) * FRAME.h) / ((1 + 2 * MARGIN.x) * FRAME.w));
    if (w === 0) continue;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const m = reduced ? { bounce: 0, sx: 1, sy: 1 } : item.motion.update(now);
    const bg = model.meshes.findIndex((mesh) => mesh.name === "BG");
    draw(model, canvas.getContext("2d"), view(m.bounce), { hide: new Set([bg]), squash: { sx: m.sx, sy: m.sy, ...FOOT }, imgs: drawImgs(), before: (ctx) => shadow(ctx, m.bounce) });
    tiltDecor(img, reduced ? 0 : faceAngle(), m);
    if (!item.ready) {
      item.ready = true;
      if (img.closest("#opening")) openingBox()?.classList.add("live-ready");
      img.style.visibility = "hidden"; // 動くフロリが出たら、静止画はかくす(場所・大きさは、そのまま)
    }
  }
  requestAnimationFrame(frame);
}

function scan() {
  for (const img of document.querySelectorAll("img.flori")) {
    if (!eligible(img)) {
      const item = mounts.get(img);
      if (item && img.style.visibility === "hidden") img.style.visibility = ""; // 静止画にもどす
      continue;
    }
    ensureModel();
    if (!mounts.has(img)) mount(img);
    else if (img.style.visibility === "hidden" && !mounts.get(img).ready) img.style.visibility = "";
  }
}

export function startLiveFlori() {
  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  };
  new MutationObserver(queue).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src", "hidden", "class"] });
  setInterval(scan, 1000);
  scan();
  requestAnimationFrame(frame);
  // 4秒たっても、1つも描けていなければ、静止画のフロリを出す(スマホで、動くフロリが描けない場合の保険)
  setTimeout(() => {
    if (![...mounts.values()].some((item) => item.ready)) {
      window.__floriLog?.("[live-flori] 4秒たっても、動くフロリが描けていない。静止画を出す");
      showStillFlori();
    }
  }, 4000);
}

// ===== ときどき、パパフロリ・ママフロリが、ホームの横から のぞきに来る(利用者の指示) =====
// 新しく描いたのではなく、動くフロリに色(パパ=青・ママ=ピンク)と、着せ替えの帽子・リボンをのせたもの(物語ムービーと同じ作り)
const FAMILY = {
  papa: { color: { id: "papa-deep", hue: 214, gain: 6, minSat: 1, boost: 1.9, lmul: 0.8 }, hat: "head29" },
  mama: { color: { id: "mama-deep", hue: 336, gain: 6, minSat: 1, boost: 1.9, lmul: 0.86 }, hat: "head01" },
};
const actors = new Map(); // 役 → { m, imgs, hat, hatItem, motion }
async function actorOf(role) {
  if (actors.has(role)) return actors.get(role);
  const spec = FAMILY[role];
  const m = Object.create(model);
  m.values = [...model.values];
  const imgs = new Map(base);
  for (const mesh of model.meshes) {
    if (!TINT_PARTS.test(mesh.name) || imgs.get(mesh.img)?.__family === role) continue;
    await new Promise((resolve) => setTimeout(resolve, 0)); // 重いので、パーツごとに間をあける
    const small = base.get(mesh.img) ?? model.imgs.get(mesh.img);
    const shrunk = small !== model.imgs.get(mesh.img);
    const tinted = recolorCanvas(small, spec.color, shrunk ? 1 : TINT_SCALE, mesh.name === "顔" ? 0.87 : 0);
    tinted.__family = role;
    imgs.set(mesh.img, tinted);
  }
  const hatItem = HEADS.find((item) => item.id === spec.hat);
  const hat = hatItem ? await new Promise((resolve) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = () => resolve(null); im.src = new URL(hatItem.img, import.meta.url).href; }) : null;
  const actor = { m, imgs, hat, hatItem, motion: createMotion(m, { mood: null, noArms: false }) };
  actors.set(role, actor);
  return actor;
}

let visiting = false;
async function visit(role, side) {
  const stage = document.querySelector("#screen-cover .home-stage");
  const fig = stage?.querySelector(".hero-fig");
  if (!stage || !fig || !model || !base) return;
  const actor = await actorOf(role);
  const stageBox = stage.getBoundingClientRect();
  const figBox = (stage.querySelector(".flori-cover") ?? fig).getBoundingClientRect();
  if (figBox.width === 0 || stageBox.width === 0) return;
  const W = Math.round(Math.min(figBox.width * 0.66, stageBox.width * 0.26)); // フロリより、ひとまわり小さく
  const H = Math.round((W * (1 + 2 * MARGIN.y) * FRAME.h) / ((1 + 2 * MARGIN.x) * FRAME.w));
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const feet = figBox.bottom - stageBox.top; // フロリの足もと
  const rest = side === "left" ? -W * 0.18 : stageBox.width - W * 0.82; // 画面のはしから、少しだけ はみ出して立つ
  const away = side === "left" ? -W * 1.3 : stageBox.width + W * 0.3; // 画面の外
  canvas.style.cssText = `position:absolute;left:${rest}px;top:${feet - H * 0.97}px;width:${W}px;height:${H}px;pointer-events:none;z-index:2;transform:translateX(${away - rest}px);transition:transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);`;
  stage.style.position ||= "relative";
  stage.append(canvas);
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(Math.min(W * dpr, 480));
  canvas.height = Math.round((canvas.width * H) / W);
  const bg = model.meshes.findIndex((mesh) => mesh.name === "BG");
  let alive = true;
  const render = (now) => {
    if (!alive) return;
    const mv = actor.motion.update(now);
    draw(actor.m, canvas.getContext("2d"), view(mv.bounce), { hide: new Set([bg]), squash: { sx: mv.sx, sy: mv.sy, ...FOOT }, imgs: actor.imgs, before: (ctx) => shadow(ctx, mv.bounce) });
    if (actor.hat && actor.hatItem) {
      const ctx = canvas.getContext("2d");
      const p = actor.hatItem.pos;
      const cx = X0 + ((p.x / 100) * FRAME.w) / S, cy = Y0 + ((p.y / 100) * FRAME.h) / S;
      const hw = (((p.w / 100) * FRAME.w) / S) * (p.sx ?? 1);
      const hh = (((p.w / 100) * FRAME.w) / S) * (actor.hat.naturalHeight / actor.hat.naturalWidth) * (p.sy ?? 1);
      ctx.save();
      ctx.translate(PIVOT.x, PIVOT.y);
      ctx.rotate((faceAngle(actor.m) * Math.PI) / 180);
      ctx.translate(-PIVOT.x, -PIVOT.y);
      ctx.drawImage(actor.hat, cx - hw / 2, cy - hh / 2, hw, hh);
      ctx.restore();
    }
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await wait(60);
  canvas.style.transform = "translateX(0)"; // 横から、すーっと登場
  await wait(1300);
  actor.motion.hop(performance.now()); // 着いたら、ぴょん
  await wait(4200 + Math.random() * 2000);
  canvas.style.transform = `translateX(${away - rest}px)`;
  await wait(1300);
  alive = false;
  canvas.remove();
}

// 表紙を見ている間に、30〜60秒に1回くらい、パパかママが(ときどき ふたりで)横から のぞきに来る
export function startFamilyVisits() {
  if (reduced) return;
  let next = performance.now() + 15000 + Math.random() * 10000;
  setInterval(async () => {
    if (visiting || document.hidden || !model || !base || performance.now() < next) return;
    const cover = document.getElementById("screen-cover");
    if (!cover || cover.hidden || cover.getClientRects().length === 0) return;
    if (document.querySelector(".overlay:not([hidden]), dialog[open]")) return; // なにか開いているときは、出ない
    visiting = true;
    try {
      const left = Math.random() < 0.5 ? "left" : "right";
      const first = Math.random() < 0.5 ? "papa" : "mama";
      const jobs = [visit(first, left)];
      if (Math.random() < 0.25) jobs.push(visit(first === "papa" ? "mama" : "papa", left === "left" ? "right" : "left")); // ときどき、ふたりで
      await Promise.all(jobs);
    } catch (error) {
      window.__floriLog?.("[family] " + error);
    }
    visiting = false;
    next = performance.now() + 30000 + Math.random() * 30000;
  }, 2000);
}
// 確かめ用:すぐに、パパ・ママを出す(role: "papa" | "mama"、side: "left" | "right")
export function visitNow(role = "papa", side = "left") {
  return visit(role, side);
}
