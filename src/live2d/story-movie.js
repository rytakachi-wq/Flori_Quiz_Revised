// フロリの ものがたり(ムービー)。動くフロリ(Live2D)を3体(フロリ・パパフロリ・ママフロリ)出して、お話を見せる。
// ・パパ・ママは、同じモデルに(濃い)色をつけて、着せ替えの帽子(シルクハット・リボン)をのせたもの。
// ・大胆な表情は、動くフロリの「表情」(びっくり・しょんぼり など)で出す。腕は、動くフロリのまま動く。表情の絵への置きかえは しない。
// ・絵文字は使わない。敵・背景の絵は、アプリの絵(assets/illust)を使う。
import { loadModel, draw } from './live2d.js';
import { createMotion } from './flori-motion.js';
import { recolorCanvas } from '../flori-color.js';
import { HEADS } from '../badges.js';
import { startFurigana } from '../furigana.js';

startFurigana();

const model = await loadModel('./');
const bgMesh = model.meshes.findIndex(m => m.name === 'BG');
const TINT_PARTS = /^(体|顔|右足|左足|右手(コブシ|バンザイ)|左手(コブシ|バンザイ))$/;
const FRAME = { w: 800, h: 1003 }, S = 0.362, X0 = 304, Y0 = 861, MARGIN = { x: 0.06, y: 0.03 };
const FOOT = { px: 1455, py: 3470 };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SRC = new URL('../', import.meta.url);   // src/
const ART = {   // 絵(アプリの絵)。src/live2d/ から見た場所
  dragon: '../../assets/illust/dragon.webp', mouse: '../../assets/illust/mouse.webp', frog: '../../assets/illust/frog.webp', scorpion: '../../assets/illust/scorpion.webp',
  house: '../../assets/illust/house.webp', sun: '../../assets/illust/sun.webp', moon: '../../assets/illust/moon.webp', cloud: '../../assets/illust/cloud.webp', castle: '../../assets/illust/castle.webp',
  hat: '../../assets/illust/tophat.webp', ribbon: '../../assets/dress/head01.png',
};
const loadImg = src => new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(im); im.src = new URL(src, SRC).href; });

// ---- 登場人物(パパ・ママは、色を濃くした) ----
const ROLE = {
  flori: { color: null, hat: null },
  papa: { color: { id: 'papa-deep', hue: 214, gain: 6, minSat: 1, boost: 1.9, lmul: 0.8 }, hat: 'head29' },
  mama: { color: { id: 'mama-deep', hue: 336, gain: 6, minSat: 1, boost: 1.9, lmul: 0.86 }, hat: 'head01' },
};
const actors = {};
for (const [id, r] of Object.entries(ROLE)) {
  const m = Object.create(model);
  m.values = [...model.values];
  let imgs = null;
  if (r.color) {
    imgs = new Map();
    for (const mesh of model.meshes) {
      if (!TINT_PARTS.test(mesh.name) || imgs.has(mesh.img)) continue;
      imgs.set(mesh.img, recolorCanvas(model.imgs.get(mesh.img), r.color, 0.3, mesh.name === '顔' ? 0.87 : 0));
    }
  }
  const hatItem = r.hat ? HEADS.find(h => h.id === r.hat) : null;
  const hatImg = hatItem ? await loadImg(hatItem.img) : null;
  const el = document.createElement('div');
  el.className = 'actor';
  el.innerHTML = '<canvas></canvas><span class="bubble"></span>';
  document.getElementById('actors').append(el);
  // 表情ごとの動き(ずっと同じ表情のまま、目・腕だけ動く)。使うときに作る
  actors[id] = { id, m, imgs, hatItem, hatImg, motions: {}, el, cv: el.querySelector('canvas'), bubble: el.querySelector('.bubble') };
}
const motionOf = (a, mood) => (a.motions[mood || 'normal'] ??= createMotion(a.m, mood ? { mood } : {}));

function view(b) {
  const mx = MARGIN.x * FRAME.w, my = MARGIN.y * FRAME.h;
  return { x: X0 - mx / S, y: Y0 - my / S + b, w: (FRAME.w + 2 * mx) / S, h: (FRAME.h + 2 * my) / S };
}
function shadow(ctx, b) {
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(1455, 3485 + b, 520, 105, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function drawActor(a, now, mood) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.max(2, Math.round(Math.min(a.cv.clientWidth * dpr, 640)));
  const h = Math.round((w * (1 + 2 * MARGIN.y) * FRAME.h) / ((1 + 2 * MARGIN.x) * FRAME.w));
  if (a.cv.width !== w || a.cv.height !== h) { a.cv.width = w; a.cv.height = h; }
  const motion = motionOf(a, mood);
  const m = reduced ? { bounce: 0, sx: 1, sy: 1 } : motion.update(now);
  const ctx = a.cv.getContext('2d');
  draw(a.m, ctx, view(m.bounce), { hide: new Set([bgMesh]), squash: { sx: m.sx, sy: m.sy, ...FOOT }, imgs: a.imgs, before: c => shadow(c, m.bounce) });
  if (a.hatImg) {
    const p = a.hatItem.pos, cx = X0 + (p.x / 100 * FRAME.w) / S, cy = Y0 + (p.y / 100 * FRAME.h) / S;
    const hw = (p.w / 100 * FRAME.w) / S * (p.sx ?? 1), hh = (p.w / 100 * FRAME.w) / S * (a.hatImg.naturalHeight / a.hatImg.naturalWidth) * (p.sy ?? 1);
    ctx.drawImage(a.hatImg, cx - hw / 2, cy - hh / 2, hw, hh);
  }
  return motion;
}

// ---- お話の台本 ----
// actors[id] = { x(%), y(vh), a, s, mood(びっくり・しょんぼり・にっこり・あはは・ぷんぷん・こまった・きりっ), anim(shock|sad|joy|angry = 体ぜんたいの大げさな動き), to:{x,y,a,s}, say }
// foes = [{ art: 絵の名前, h: 高さ(vh), from:[x%,y%], to:[x%,y%], shake }]  props = [[絵の名前, x%, y(vh), 高さ(vh)]]
// hops = [{ at, who }](ぴょん=両腕を上げて跳ねる)  flash = 秒(白くひかる)
const A = (x, extra = {}) => ({ x, y: 0, a: 1, s: 1, ...extra });
const SURPRISE = { mood: 'びっくり', anim: 'shock' }, SAD = { mood: 'しょんぼり', anim: 'sad' }, JOY = { mood: 'あはは', anim: 'joy' }, SMILE = { mood: 'にっこり', anim: 'joy' }, ANGRY = { mood: 'ぷんぷん', anim: 'angry' }, GRIT = { mood: 'ぐぬぬ', anim: 'angry' };
const PROLOGUE = { id: 'pro', label: 'プロローグ', scenes: [
  { dur: 4.4, bg: 'home', props: [['house', 4, 30, 24], ['sun', 80, 4, 16]], text: 'フロリは、パパフロリ・ママフロリと、なかよく くらしていました。', hops: [{ at: 1.2, who: 'flori' }, { at: 2.4, who: 'papa' }, { at: 3, who: 'mama' }],
    actors: { papa: A(22, { mood: 'にっこり' }), flori: A(50, { mood: 'にっこり' }), mama: A(78, { mood: 'にっこり' }) } },
  { dur: 4.6, bg: 'dusk', props: [['cloud', 6, 6, 14], ['cloud', 70, 12, 14]], text: 'ところが ある日、空が まっくらに…! ドラゴンが 現れました!', hops: [{ at: 1, who: 'papa' }, { at: 1.2, who: 'mama' }],
    foes: [{ art: 'dragon', h: 24, from: [130, 8], to: [66, 24] }], flash: 3.2,
    actors: { papa: A(22, SURPRISE), flori: A(50, SURPRISE), mama: A(78, SURPRISE) } },
  { dur: 4.6, bg: 'night', props: [['moon', 80, 6, 14]], text: 'ドラゴンは、パパとママを つれさってしまったのです!',
    foes: [{ art: 'dragon', h: 24, from: [66, 24], to: [-30, 10] }],
    actors: { papa: A(22, { ...SURPRISE, to: { x: -25, y: 18, a: 0, s: 0.6 } }), flori: A(50, SAD), mama: A(78, { ...SURPRISE, to: { x: -10, y: 16, a: 0, s: 0.6 } }) } },
  { dur: 3.6, bg: 'castle', props: [['castle', 70, 8, 22]], who: 'パパフロリ', text: 'フロリ、たすけてくれ〜!', hops: [{ at: 1.2, who: 'papa' }],
    actors: { flori: A(30, SAD), papa: A(80, { y: 4, s: 0.55, mood: 'こまった', say: 'フロリ、たすけて〜!' }) } },
  { dur: 3.6, bg: 'castle', props: [['castle', 70, 8, 22]], who: 'ママフロリ', text: 'ひらめきの 力を 信じてネ!', hops: [{ at: 1.2, who: 'mama' }],
    actors: { flori: A(30, SAD), papa: A(70, { y: 4, s: 0.5, mood: 'こまった' }), mama: A(88, { y: 4, s: 0.5, mood: 'こまった', say: 'ひらめきの 力を 信じてネ!' }) } },
  { dur: 5.2, bg: 'sunrise', props: [['sun', 78, 4, 16]], who: 'フロリ', text: 'まかせて! ひらめきクイズで ドラゴンを たおして、パパとママを たすけるヨ!', flash: 0.5, hops: [{ at: 0.8, who: 'flori' }, { at: 2.6, who: 'flori' }],
    actors: { flori: A(50, { mood: 'きりっ', anim: 'joy' }) } },
  { dur: 3, bg: 'title', title: 'RPGクエスト<br>スタート!', hops: [{ at: 0.4, who: 'flori' }], actors: { flori: A(50, { mood: 'にっこり' }) } },
] };
const EP1 = { id: 'ep1', label: '①ネズミ', scenes: [
  { dur: 4, bg: 'forest', text: '第1話「ネズミと パパの 帽子」 フロリは ドラゴンの お城を めざして 出発!',
    actors: { flori: A(-10, { mood: 'にっこり', to: { x: 34 } }) }, hops: [{ at: 2.4, who: 'flori' }] },
  { dur: 4.2, bg: 'forest', text: 'ネズミが 現れた! …あれ? パパの 帽子を くわえているヨ!',
    foes: [{ art: 'mouse', h: 14, from: [120, 56], to: [68, 56] }, { art: 'hat', h: 9, from: [120, 46], to: [66, 44] }],
    actors: { flori: A(34, SURPRISE) } },
  { dur: 4.2, bg: 'forest', text: 'ひらめきクイズで しょうぶ! 正解して ネズミを おいはらえ!', flash: 2.2, hops: [{ at: 1, who: 'flori' }],
    foes: [{ art: 'mouse', h: 14, from: [68, 56], to: [92, 56], shake: true }, { art: 'hat', h: 9, from: [66, 44], to: [60, 40] }],
    actors: { flori: A(34, GRIT) } },
  { dur: 5, bg: 'forest', who: 'フロリ', text: 'パパの 帽子を 取りかえしたヨ! 待っててネ、パパ!', hops: [{ at: 0.6, who: 'flori' }, { at: 2.4, who: 'flori' }],
    foes: [{ art: 'hat', h: 12, from: [60, 40], to: [34, 20] }],
    actors: { flori: A(34, JOY) } },
] };
const EP2 = { id: 'ep2', label: '②カエル', scenes: [
  { dur: 4, bg: 'swamp', text: '第2話「カエルと ママの リボン」 つぎは じめじめの 沼地!',
    actors: { flori: A(-10, { mood: 'にっこり', to: { x: 30 } }) }, hops: [{ at: 2.4, who: 'flori' }] },
  { dur: 4.2, bg: 'swamp', text: 'ぴょーん! カエルが とびだした! リボンが 頭に のっているヨ!',
    foes: [{ art: 'frog', h: 15, from: [110, 56], to: [70, 52] }, { art: 'ribbon', h: 8, from: [110, 44], to: [70, 42] }],
    actors: { flori: A(30, SURPRISE) } },
  { dur: 4.4, bg: 'swamp', text: 'カエルは けろけろ 笑って にげまわる! フロリは ぷんぷん!', foes: [{ art: 'frog', h: 15, from: [70, 52], to: [40, 30], shake: true }, { art: 'ribbon', h: 8, from: [70, 42], to: [40, 20] }],
    actors: { flori: A(30, ANGRY) }, flash: 1.6 },
  { dur: 5, bg: 'swamp', who: 'フロリ', text: 'ひらめきで つかまえた! ママの リボン、ぶじだったヨ!', hops: [{ at: 0.6, who: 'flori' }, { at: 2.4, who: 'flori' }],
    foes: [{ art: 'ribbon', h: 12, from: [40, 20], to: [30, 22] }],
    actors: { flori: A(30, JOY) } },
] };
const EP3 = { id: 'ep3', label: '③決戦前', scenes: [   // (宝箱の話は、カットした)
  { dur: 4.2, bg: 'gate', props: [['castle', 74, 8, 22]], text: '第3話「決戦の 前に」 お城の 門の前に、サソリの 門番が ふさがっている!',
    foes: [{ art: 'scorpion', h: 16, from: [110, 56], to: [70, 56] }], actors: { flori: A(30, SURPRISE) } },
  { dur: 4.2, bg: 'gate', text: 'ひらめきを ぜんぶ ぶつけて… えいっ!', flash: 2, hops: [{ at: 1.5, who: 'flori' }],
    foes: [{ art: 'scorpion', h: 16, from: [70, 56], to: [100, 56], shake: true }], actors: { flori: A(30, GRIT) } },
  { dur: 4.4, bg: 'alert', text: '警告! 奥から ドラゴンの 声が ひびく…!', flash: 0.3,
    foes: [{ art: 'dragon', h: 34, from: [72, 40], to: [72, 36], shake: true }], actors: { flori: A(24, SURPRISE) } },
  { dur: 5, bg: 'alert', who: 'フロリ', text: 'ドラゴン! パパと ママを 返してもらうヨ!', flash: 0.6, hops: [{ at: 1.2, who: 'flori' }],
    foes: [{ art: 'dragon', h: 34, from: [72, 36], to: [72, 36], shake: true }], actors: { flori: A(24, ANGRY) } },
] };
const ENDING = { id: 'epi', label: 'エンディング', scenes: [
  { dur: 4, bg: 'castle', props: [['castle', 74, 8, 22]], who: 'ドラゴン', text: 'まいった…! ひらめきの 力には かなわないヨ。',
    foes: [{ art: 'dragon', h: 20, from: [66, 28], to: [66, 36], shake: true }],
    actors: { flori: A(28, JOY), papa: A(70, { s: 0.55, y: 2, mood: 'こまった' }), mama: A(88, { s: 0.55, y: 2, mood: 'こまった' }) } },
  { dur: 4.4, bg: 'sunrise', props: [['sun', 78, 4, 16]], who: 'パパフロリ', text: 'フロリ、ありがとう! さすが ボクたちの 子だ!', hops: [{ at: 1, who: 'papa' }, { at: 1.4, who: 'mama' }, { at: 2, who: 'flori' }],
    actors: { papa: A(120, { ...JOY, to: { x: 24 } }), flori: A(50, SURPRISE), mama: A(120, { ...JOY, to: { x: 76 } }) } },
  { dur: 4.4, bg: 'sunrise', props: [['house', 4, 30, 24]], who: 'ママフロリ', text: 'ひらめきの 力、かっこよかったわ!', hops: [{ at: 0.6, who: 'flori' }, { at: 1.4, who: 'papa' }, { at: 2.2, who: 'mama' }],
    actors: { papa: A(24, SMILE), flori: A(50, JOY), mama: A(76, SMILE) } },
  { dur: 4.6, bg: 'home', props: [['house', 4, 30, 24], ['sun', 80, 4, 16]], text: 'こうして フロリたち 家族は、また なかよく くらしました。おしまい。', hops: [{ at: 1.2, who: 'flori' }, { at: 2.4, who: 'papa' }, { at: 3.2, who: 'mama' }],
    actors: { papa: A(22, { mood: 'にっこり' }), flori: A(50, { mood: 'にっこり' }), mama: A(78, { mood: 'にっこり' }) } },
] };
const MOVIES = [PROLOGUE, EP1, EP2, EP3, ENDING];

// ---- 再生 ----
const stage = document.getElementById('stage'), props = document.getElementById('props'), foesEl = document.getElementById('foes');
const who = document.getElementById('who'), line = document.getElementById('line'), title = document.getElementById('title'), prog = document.getElementById('prog'), flashEl = document.getElementById('flash');
const ease = x => x * x * (3 - 2 * x);
const lerp = (a, b, t) => a + (b - a) * t;
let movie = PROLOGUE, t0 = performance.now(), sceneIdx = -1, fired = new Set(), finished = false, chain = false;
const total = list => list.reduce((s, c) => s + c.dur, 0);
const artUrl = name => new URL(ART[name], SRC).href;

const bar = document.getElementById('bar');
for (const mv of MOVIES) {
  const b = document.createElement('button'); b.textContent = mv.label; b.dataset.id = mv.id; b.onclick = () => { chain = false; play(mv); }; bar.append(b);
}
const allBtn = document.createElement('button'); allBtn.textContent = '▶ 全部つづけて'; allBtn.onclick = () => { chain = true; play(PROLOGUE); }; bar.append(allBtn);
if (parent !== window) {   // アプリの中(別の画面の上)で開いたとき:「とじる」で、もどる
  const close = document.createElement('button'); close.textContent = 'とじる'; close.onclick = () => parent.postMessage('close-story-movie', '*'); bar.append(close);
}

function play(mv) {
  movie = mv; t0 = performance.now(); sceneIdx = -1; finished = false; fired = new Set();
  for (const b of bar.querySelectorAll('button[data-id]')) b.classList.toggle('on', b.dataset.id === mv.id);
}
addEventListener('pointerdown', e => { if (finished && !e.target.closest('#bar')) play(movie); });

function setScene(i) {
  sceneIdx = i;
  const sc = movie.scenes[i];
  stage.dataset.bg = sc.bg;
  props.innerHTML = (sc.props || []).map(([art, x, y, h]) => `<img class="prop" alt="" src="${artUrl(art)}" style="left:${x}%;top:${y}vh;height:${h}vh">`).join('');
  who.textContent = sc.who || '';
  line.textContent = sc.text || '';
  title.innerHTML = sc.title || '';
  title.classList.toggle('on', Boolean(sc.title));
  document.getElementById('cap').style.visibility = sc.text ? 'visible' : 'hidden';
  foesEl.innerHTML = (sc.foes || []).map(f => `<img alt="" src="${artUrl(f.art)}" style="height:${f.h}vh">`).join('');
  for (const a of Object.values(actors)) { a.bubble.classList.remove('on'); a.bubble.textContent = ''; a.el.className = 'actor'; }
  for (const [id, d] of Object.entries(sc.actors || {})) {
    if (d.say) { actors[id].bubble.textContent = d.say; actors[id].bubble.classList.add('on'); }
    if (d.anim) { void actors[id].el.offsetWidth; actors[id].el.classList.add(`a-${d.anim}`); }
  }
}

function frame(now) {
  const el = (now - t0) / 1000, sum = total(movie.scenes);
  let acc = 0, i = 0;
  while (i < movie.scenes.length - 1 && el >= acc + movie.scenes[i].dur) { acc += movie.scenes[i].dur; i++; }
  if (el >= sum && !finished) {
    finished = true;
    if (chain) { const n = MOVIES.indexOf(movie) + 1; if (n < MOVIES.length) play(MOVIES[n]); else chain = false; }
  }
  const k = finished ? movie.scenes.length - 1 : i;
  if (sceneIdx !== k) setScene(k);
  const sc = movie.scenes[k];
  const lt = finished ? sc.dur : el - acc, p = ease(Math.min(1, lt / sc.dur));
  prog.style.width = `${Math.min(1, el / sum) * 100}%`;
  if (sc.flash !== undefined && lt >= sc.flash && !fired.has(`${k}:flash`)) { fired.add(`${k}:flash`); flashEl.classList.remove('on'); void flashEl.offsetWidth; flashEl.classList.add('on'); }
  for (const a of Object.values(actors)) {
    const d = (sc.actors || {})[a.id];
    if (!d) { a.el.style.display = 'none'; continue; }
    a.el.style.display = '';
    const to = d.to || {};
    a.el.style.left = `${lerp(d.x, to.x ?? d.x, p)}%`;
    a.el.style.bottom = `calc(17vh + ${lerp(d.y, to.y ?? d.y, p)}vh)`;
    a.el.style.opacity = lerp(d.a, to.a ?? d.a, p);
    a.el.style.height = `${34 * lerp(d.s, to.s ?? d.s, p)}vh`;
    const motion = drawActor(a, now, d.mood);
    for (const h of sc.hops || []) {
      const key = `${k}:${h.at}:${h.who}`;
      if (h.who === a.id && lt >= h.at && !fired.has(key)) { fired.add(key); motion.hop(now); }
    }
  }
  const imgs = foesEl.children;
  (sc.foes || []).forEach((f, n) => {
    const s = imgs[n]; if (!s) return;
    const x = lerp(f.from[0], f.to[0], p), y = lerp(f.from[1], f.to[1], p);
    const sh = f.shake ? Math.sin(now / 40 + n) * 0.8 : Math.sin(now / 300 + n) * 1.2;
    s.style.left = `${x}%`; s.style.top = `${y + (f.h > 18 ? 14 : 0) + sh}vh`;
  });
  requestAnimationFrame(frame);
}
document.getElementById('loading').remove();
play(PROLOGUE);
requestAnimationFrame(frame);
window.play = play; window.MOVIES = MOVIES;
