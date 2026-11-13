// フロリの ものがたり(ムービー)その2:演出しなおし版(試作・ここだけ)。
// ・動くフロリ(Live2D)3体。顔は「はりつけ → とる → 動くフロリの表情が動く → つぎの絵を はりつけ…」をくりかえす(はりつけは 顔より上・腕より下の層)。
// ・見切れない:大きさは、画面の たて・よこの小さいほうに合わせる(--u)。カメラ(ズーム・パン)で、寄り・引きをつくる。
// ・動きは場面に合わせる:かなしい場面は腕を動かさない(noArms)。ぴょん・ぶるぶるは、ここぞというときだけ。歩くときは、上下にゆれる。
// ・単調にならない:広い絵・寄りの絵・切りかえ(暗転)・走る/追う/はねる 動き・ふきだしの順番。
import { loadModel, draw } from './live2d.js?v=20261113x';
import { createMotion } from './flori-motion.js?v=20261113x';
import { recolorCanvas } from '../flori-color.js?v=20261113x';
import { HEADS } from '../badges.js?v=20261113x';
import { startFurigana } from '../furigana.js?v=20261113x';
import { MOVIES } from './storyboard.js?v=20261113x';
import { playStoryBgm } from './story-bgm.js?v=20261113x';

startFurigana();

const model = await loadModel(new URL('./', import.meta.url).href);
const bgMesh = model.meshes.findIndex(m => m.name === 'BG');
const TINT_PARTS = /^(体|顔|右足|左足|右手(コブシ|バンザイ)|左手(コブシ|バンザイ))$/;
const FRAME = { w: 800, h: 1003 }, S = 0.362, X0 = 304, Y0 = 861, MARGIN = { x: 0.06, y: 0.03, top: 0.16 };   // top:帽子・リボン・ジャンプが見切れないよう、上に余白
const FOOT = { px: 1455, py: 3470 }, PIVOT = { x: 1459.5, y: 1696.5 };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SRC = new URL('../', import.meta.url);   // src/
const ART = {   // 絵(アプリの絵。assets/illust)
  dragon: '../assets/illust/dragon.webp', mouse: '../assets/illust/mouse.webp', frog: '../assets/illust/frog.webp', scorpion: '../assets/illust/scorpion.webp',
  house: '../assets/illust/house.webp', sun: '../assets/illust/sun.webp', moon: '../assets/illust/moon.webp', cloud: '../assets/illust/cloud.webp', castle: '../assets/illust/castle.webp',
  tree: '../assets/illust/tree.webp', hat: '../assets/illust/tophat.webp', ribbon: '../assets/dress/head01.png',
  sparkle: '../assets/illust/sparkle.webp', bulb: '../assets/illust/bulb.webp', key: '../assets/illust/key.webp', heart: '../assets/illust/heart.webp', star: '../assets/illust/star_fill.webp', sweat: '../assets/illust/sweat.webp', fire: '../assets/illust/fire.webp',
};
const artUrl = name => new URL(ART[name] ?? `../assets/movie/${name}.webp`, SRC).href;   // ART にないものは、assets/movie/ の絵
const BGFILE = { home: 'bg_home_hd', night: 'bg_night_hd', castle: 'bg_castle_hd', sunrise: 'bg_sunrise_hd', dusk: 'bg_dusk', forest: 'bg_forest', swamp: 'bg_swamp', gate: 'bg_gate', alert: 'bg_alert' };   // 背景の絵(_hd=高画質。ないものは、小さな見本を のばして使う=仮)
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
  actors[id] = { id, m, imgs, hatItem, hatImg, motions: {}, phase: Math.random() * 4, el, cv: el.querySelector('canvas'), bubble: el.querySelector('.bubble') };
}
if (!draw.toString().includes('opts.patch')) document.title = '(古い live2d.js です。Ctrl+F5 で読みこみなおして)';

// ---- 顔の絵(表情の絵 wave_*.png の顔の部分を、動くフロリの顔に はりつける。端は ぼかさない) ----
const FACE = { cx: 415, cy: 312, rx: 255, ry: 130 };
const POSE_IMG = {};
await Promise.all(['surprised', 'wrong', 'nikkori', 'smile'].map(async k => { POSE_IMG[k] = await loadImg(`../assets/flori/m/wave_${k}.png`); }));   // いっぺんに読む
const patchCache = {};
const patchOf = key => patchCache[key] ??= (() => {
  const c = document.createElement('canvas'); c.width = FACE.rx * 2; c.height = FACE.ry * 2;
  const g = c.getContext('2d');
  g.drawImage(POSE_IMG[key], FACE.cx - FACE.rx, FACE.cy - FACE.ry, c.width, c.height, 0, 0, c.width, c.height);
  g.globalCompositeOperation = 'destination-in';
  g.beginPath(); g.ellipse(FACE.rx, FACE.ry, FACE.rx, FACE.ry, 0, 0, Math.PI * 2); g.fillStyle = '#000'; g.fill();
  return c;
})();
function faceAngle(m) {
  const d = m.deformers.find(x => x.binds.length === 1 && m.params[x.binds[0].param].name === '顔');
  if (!d) return 0;
  const v = m.values[d.binds[0].param], k = d.binds[0].keys;
  if (v <= k[0]) return d.forms[0].angle;
  if (v >= k[k.length - 1]) return d.forms[k.length - 1].angle;
  let i = 0; while (v > k[i + 1]) i++;
  const t = (v - k[i]) / (k[i + 1] - k[i]);
  return d.forms[i].angle + (d.forms[i + 1].angle - d.forms[i].angle) * t;
}
// 気持ち(mood)ごとに はりつける絵。ないもの(ぷんぷん など)は、動くフロリの表情のまま
const PASTE_OF = { びっくり: ['surprised'], しょんぼり: ['wrong'], こまった: ['wrong'], あはは: ['smile', 'nikkori'], にっこり: ['nikkori', 'smile'] };
const PASTE_SEC = 3.4, FREE_SEC = 1.6;   // はりつけの時間(のばした)/ とっている時間
const motionOf = (a, mood, calm, tilt, side) => (a.motions[`${calm ? 'c' : 'n'}|${mood || ''}|${tilt || ''}|${side || ''}`] ??= createMotion(a.m, { ...(mood ? { mood } : {}), ...(side ? { waveSide: side } : {}), ...(calm ? { noArms: true } : {}), ...(tilt === 'none' ? { noTilt: true } : tilt ? { tiltDir: tilt === 'right' ? 1 : -1 } : {}) }));

function view(b) {
  const mx = MARGIN.x * FRAME.w, my = MARGIN.y * FRAME.h, mt = MARGIN.top * FRAME.h;
  return { x: X0 - mx / S, y: Y0 - mt / S + b, w: (FRAME.w + 2 * mx) / S, h: (FRAME.h + mt + my) / S };
}
function shadow(ctx, b) {
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(1455, 3485 + b, 520, 105, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function drawActor(a, now, d, sceneT) {
  const mood = d.mood, calm = d.calm;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.max(2, Math.round(Math.min(a.cv.clientWidth * dpr, 640)));
  const h = Math.round((w * (1 + MARGIN.top + MARGIN.y) * FRAME.h) / ((1 + 2 * MARGIN.x) * FRAME.w));
  if (a.cv.width !== w || a.cv.height !== h) { a.cv.width = w; a.cv.height = h; }
  const list = PASTE_OF[mood];
  let pasteKey = null, useMood = mood, pasteAlpha = 1;
  if (d.faces) {   // 顔の指定(絵コンテの faces):はりつける絵・動くフロリの表情を、時間で指定する
    const f = d.faces.find(q => sceneT >= q.at && sceneT < (q.to ?? 99));
    pasteKey = f?.pose || null; if (f?.fadeOut && f.to !== undefined) pasteAlpha = Math.min(1, Math.max(0, (f.to - sceneT) / f.fadeOut));   // fadeOut:貼った絵を、ゆっくり うすくして とる(秒)
    useMood = f?.mood ?? (f?.pose ? d.mood : null);   // 貼る絵を かえるときも、動きの入れもの(motion)は かえない(ジャンプが途中で切れるため)
  } else if (list) {
    const cycle = PASTE_SEC + FREE_SEC, t = (sceneT + a.phase) % cycle;
    if (t < PASTE_SEC) pasteKey = list[Math.floor((sceneT + a.phase) / cycle) % list.length];
    useMood = null;
  }
  const motion = motionOf(a, useMood, calm, d.tilt, d.handSide);
  const m = reduced ? { bounce: 0, sx: 1, sy: 1 } : motion.update(now);
  const ctx = a.cv.getContext('2d');
  const patch = pasteKey ? (c) => {
    const pc = patchOf(pasteKey);
    c.save(); c.globalAlpha = pasteAlpha;
    c.translate(PIVOT.x, PIVOT.y); c.rotate(faceAngle(a.m) * Math.PI / 180); c.translate(-PIVOT.x, -PIVOT.y);
    c.drawImage(pc, X0 + (FACE.cx - FACE.rx) / S, Y0 + (FACE.cy - FACE.ry) / S, pc.width / S, pc.height / S);
    c.restore();
  } : undefined;
  draw(a.m, ctx, view(m.bounce), { hide: new Set([bgMesh]), squash: { sx: m.sx, sy: m.sy, ...FOOT }, imgs: a.imgs, before: c => shadow(c, m.bounce), patch });
  if (a.hatImg) {
    const p = a.hatItem.pos, cx = X0 + (p.x / 100 * FRAME.w) / S, cy = Y0 + (p.y / 100 * FRAME.h) / S;
    const hw = (p.w / 100 * FRAME.w) / S * (p.sx ?? 1), hh = (p.w / 100 * FRAME.w) / S * (a.hatImg.naturalHeight / a.hatImg.naturalWidth) * (p.sy ?? 1);
    ctx.drawImage(a.hatImg, cx - hw / 2, cy - hh / 2, hw, hh);
  }
  window.__flags = window.__flags || {}; window.__flags[a.id] = pasteKey || '';
  return motion;
}

// ================= お話の台本は、storyboard.js =================
const GROUND = 34;   // 地面の高さ(u。画面の下から)。ふきだしの文字の枠より上
const PROLOGUE = MOVIES[0];


// ================= 再生 =================
const marksEl = document.getElementById('marks'), cardEl = document.getElementById('card'), koma = document.getElementById('koma'), phone = document.getElementById('phone'), stage = document.getElementById('stage'), world = document.getElementById('world');
const props = document.getElementById('props'), foesEl = document.getElementById('foes'), partsEl = document.getElementById('parts'), bgsEl = document.getElementById('bgs');
const who = document.getElementById('who'), line = document.getElementById('line'), title = document.getElementById('title'), prog = document.getElementById('prog');
const flashEl = document.getElementById('flash'), fadeEl = document.getElementById('fade');
const css = document.createElement('style');
css.textContent = '.part.rise{animation:partRise 3.6s ease-out forwards}.part.fall{animation:partFall 3.2s linear forwards}@keyframes partRise{from{transform:translateY(0) scale(.6);opacity:0}15%{opacity:1}to{transform:translateY(calc(var(--u)*-62)) scale(1.1);opacity:0}}@keyframes partFall{from{transform:translateY(calc(var(--u)*-6)) rotate(0);opacity:0}15%{opacity:1}to{transform:translateY(calc(var(--u)*92)) rotate(240deg);opacity:0}}';
document.head.append(css);
const ease = x => x * x * (3 - 2 * x);
const lerp = (a, b, t) => a + (b - a) * t;
const total = list => list.reduce((s, c) => s + c.dur, 0);
const bgNames = [...new Set(MOVIES.flatMap(mv => mv.scenes.map(sc => sc.bg)))];
for (const n of bgNames) { const d = document.createElement('div'); d.className = `bg bgs-${n}`; d.dataset.bg = n; d.style.opacity = 0; bgsEl.append(d); }
// 背景の絵は、いまの場面のものだけ先に読む(のこりは、あとから)。始まるまでの時間を みじかくする
const ensureBg = d => { const n = d.dataset.bg; if (d.dataset.loaded || !BGFILE[n]) return; d.dataset.loaded = '1'; d.style.backgroundImage = `url(${artUrl(BGFILE[n])})`; d.style.backgroundSize = 'cover'; d.style.backgroundPosition = 'center bottom'; };

let auto = false, autoKey = '', want = 0, sceneStart = 0, movie = PROLOGUE, sceneIdx = -1, fired = new Set(), chain = false, lastPart = 0, lastLine = -1, prevBg = '';
// モード:story=ゲームの中で、じどうで出るとき(1本だけ。とじるでゲームへ)/ それ以外=「その他」の ものがたり(見られるものを えらべる)
const STORY_CLOSING = false;
const params = new URLSearchParams(location.search);
const STORY = params.get('mode') === 'story';
const UNLOCKED = new Set((params.get('unlocked') || '').split(',').filter(Boolean));
const NEED = { pro: 0, ep1: 20, ep2: 40, ep3: 60, ep4: 80, epi: 100 };   // 見られるようになる、総合得点
const isOpen = id => STORY || UNLOCKED.size === 0 || UNLOCKED.has(id);
const bar = document.getElementById('bar');
const closeAll = () => parent.postMessage('close-story-movie', '*');
const xBtn = document.getElementById('x'); xBtn.textContent = STORY ? '飛ばす' : '閉じる'; xBtn.onclick = closeAll;
if (!params.get('debug')) koma.style.display = 'none';
if (STORY) bar.style.display = 'none';
else {   // ボタンは「じどうで すすむ」だけ(ムービーのえらびかたは、ゲームの画面で)
  const autoBtn = document.createElement('button'); autoBtn.textContent = '自動で進む:なし'; autoBtn.onclick = () => { auto = !auto; autoKey = ''; autoBtn.textContent = auto ? '自動で進む:あり' : '自動で進む:なし'; autoBtn.classList.toggle('on', auto); }; autoBtn.id = 'auto'; document.getElementById('btnrow').prepend(autoBtn);
}
const nextOpen = from => { for (let i = from; i < MOVIES.length; i++) if (isOpen(MOVIES[i].id)) return i; return -1; };

function play(mv) {
  movie = mv; want = 0; sceneIdx = -1; fired = new Set(); prevBg = '';
  setTimeout(() => { if (movie === mv) for (const sc of mv.scenes) { const d = [...bgsEl.children].find(x => x.dataset.bg === sc.bg); if (d) ensureBg(d); } }, 1500);   // このお話の、のこりの背景を、あとから読む
  for (const b of bar.querySelectorAll('button[data-id]')) b.classList.toggle('on', b.dataset.id === mv.id);
}
// 画面をさわっても、つぎには進まない。「次へ」のボタンで進む
const nextBtn = document.getElementById('next');
nextBtn.onclick = () => goScene(want + 1);

function setScene(i) {
  sceneIdx = i; lastLine = -1;
  const sc = movie.scenes[i];
  playStoryBgm(sc.bgm ?? movie.id);   // 場面ごとの専用BGM(曲がかわる場面だけ、きりかわる)
  for (const d of bgsEl.children) { if (d.dataset.bg === sc.bg) ensureBg(d); d.style.opacity = d.dataset.bg === sc.bg ? 1 : 0; }
  // 場面が かわるときの 暗転は、やめた(利用者の指示)   // 場面が かわるとき、暗転ぎみに つなぐ
  prevBg = sc.bg;
  props.innerHTML = (sc.props || []).map(([art, x, y, h, o]) => `<img class="prop" alt="" src="${artUrl(art)}" style="left:${x}%;${o?.ground !== undefined ? `bottom:calc(var(--u)*${GROUND + o.ground})` : `top:calc(var(--u)*${y})`};height:calc(var(--u)*${h})">`).join('');
  koma.textContent = `${movie.code}${i + 1}`;
  title.innerHTML = sc.titleArt ? `<img alt="" src="${artUrl(sc.titleArt)}">` : (sc.title || '');
  title.classList.toggle('on', Boolean(sc.title || sc.titleArt));
  cardEl.style.display = sc.card ? 'block' : 'none';
  if (sc.card) { cardEl.src = artUrl(sc.card); cardEl.style.opacity = 0; }
  marksEl.innerHTML = (sc.marks || []).map(m => `<img class="mark" alt="" src="${artUrl(m.art)}" style="left:${m.x}%;top:calc(var(--u)*${m.y});height:calc(var(--u)*${m.h})">`).join('');
  document.getElementById('cap').style.visibility = sc.lines ? 'visible' : 'hidden';
  foesEl.innerHTML = (sc.foes || []).map(f => `<img class="foe" alt="" src="${artUrl(f.art)}">`).join('');
  partsEl.innerHTML = '';
  for (const a of Object.values(actors)) { a.bubble.classList.remove('on'); a.el.className = 'actor'; }
  for (const [id, d] of Object.entries(sc.actors || {})) {
    if (d.say) actors[id].bubble.textContent = d.say;
    if (d.anim && d.animAt === undefined) { void actors[id].el.offsetWidth; actors[id].el.classList.add(`a-${d.anim}`); }
  }
}

function goScene(n) {   // クリックで、つぎのコマへ(さいごのコマでクリック: とじる / つぎのムービー / もういちど)
  if (n >= movie.scenes.length) {
    if (STORY) { closeAll(); return; }
    const m = nextOpen(MOVIES.indexOf(movie) + 1);
    if ((chain || auto) && m >= 0) { play(MOVIES[m]); return; }
    play(movie); return;   // ひとつ目に もどって くりかえす
  }
  want = n;
}
function frame(now) {
  if (sceneIdx !== want) { setScene(want); sceneStart = now; fired = new Set(); }
  const k = want, sc = movie.scenes[k];
  const lt = (now - sceneStart) / 1000, p = ease(Math.min(1, lt / sc.dur)), pl = Math.min(1, lt / sc.dur);   // コマの動きは さいごで止まり、クリックまで そのまま
  if (k === movie.scenes.length - 1 && lt >= sc.dur + 6 && !STORY_CLOSING) { play(movie); requestAnimationFrame(frame); return; }   // 何も押さないと、はじめにもどって くりかえす
  const nextText = k === movie.scenes.length - 1 ? (STORY ? '閉じる' : '最初から') : '次へ ▶';
  if (nextBtn.dataset.t !== nextText) { nextBtn.dataset.t = nextText; nextBtn.textContent = nextText; }
  prog.style.width = `${(k + 1) / movie.scenes.length * 100}%`;
  if (auto && lt >= sc.dur + 1.2 && autoKey !== `${movie.id}:${k}`) { autoKey = `${movie.id}:${k}`; goScene(k + 1); }   // じどうで すすむ:読みおわったら、つぎのコマ・つぎのムービーへ
  if (sc.flash !== undefined && lt >= sc.flash && !fired.has(`${k}:flash`)) { fired.add(`${k}:flash`); flashEl.classList.remove('on'); void flashEl.offsetWidth; flashEl.classList.add('on'); }
  // ズームは しない。ゆれ(shake)だけ
  let sx = 0, sy = 0;
  if (sc.shake && lt >= sc.shake[0] && lt < sc.shake[0] + sc.shake[1]) { const q = 1 - (lt - sc.shake[0]) / sc.shake[1]; sx = Math.sin(now / 22) * 5 * q; sy = Math.cos(now / 27) * 4 * q; }
  world.style.transform = `translate(${sx}px,${sy}px)`;
  // 話数の札:はじめは はっきり出して、フロリが 画面に入ってきたら、じわじわ 消す
  if (sc.card) { const fadeAt = 1.0, fadeLen = 2.0; cardEl.style.opacity = Math.min(1, lt / 0.4) * (1 - ease(Math.min(1, Math.max(0, (lt - fadeAt) / fadeLen)))); }   // 札:1秒見せて、2秒で消える。そのあとに、つぎが出る
  // ふきだしの文
  if (sc.lines) {
    let li = 0; for (let n = 0; n < sc.lines.length; n++) if (lt >= sc.lines[n].at) li = n;
    if (li !== lastLine) { lastLine = li; who.textContent = sc.lines[li].who || ''; line.textContent = sc.lines[li].text; }
  }
  // 人
  for (const a of Object.values(actors)) {
    const d = (sc.actors || {})[a.id];
    if (!d) { a.el.style.display = 'none'; continue; }
    a.el.style.display = '';
    const to = d.to || {};
    const dl = d.delay || 0, pa = ease(Math.min(1, Math.max(0, (lt - dl) / Math.max(0.1, d.len ?? (sc.dur - dl))))), pla = Math.min(1, Math.max(0, (lt - dl) / Math.max(0.1, d.len ?? (sc.dur - dl))));   // delay:登場を、おくらせる(秒)
    const walking = d.walk && pla < 0.96 && lt >= dl;
    const bob = walking && !reduced ? Math.abs(Math.sin(now / 130)) * 1.5 : 0;   // 歩くときの、上下のゆれ
    a.el.style.zIndex = d.z ?? 1;
    a.el.style.left = `${lerp(d.x, to.x ?? d.x, pa) + (d.bulge ? d.bulge * Math.sin(Math.PI * pa) : 0)}%`;   // bulge:弧をえがいて動く(よこへ ふくらむ)
    a.el.style.bottom = `calc(var(--u)*${GROUND + lerp(d.y, to.y ?? d.y, p) + bob})`;
    a.el.style.opacity = lerp(d.a, to.a ?? d.a, p);
    a.el.style.height = `calc(var(--u)*${42 * lerp(d.s, to.s ?? d.s, p) * (1 + MARGIN.top + MARGIN.y) / 1.06})`;
    const sayOn = Boolean(d.say) && (!d.sayAt || (lt >= d.sayAt[0] && lt < d.sayAt[1]));
    a.bubble.classList.toggle('on', sayOn);
    if (sayOn) {   // 画面の外に出ないように、横にずらす
      a.bubble.style.translate = '0 0';
      const r = a.bubble.getBoundingClientRect(), pr = phone.getBoundingClientRect();
      const dx = r.right > pr.right - 8 ? pr.right - 8 - r.right : r.left < pr.left + 8 ? pr.left + 8 - r.left : 0;
      a.bubble.style.translate = `${dx}px 0`;
    }
    const motion = drawActor(a, now, d, lt);
    for (const c of d.cues || []) {   // 腕・表情の動きの指定(絵コンテの cues)
      const n = c.every ? Math.floor((lt - c.at) / c.every) : 0;
      const key = `${k}:cue:${a.id}:${c.at}:${c.kind}:${n}`;
      if (lt >= c.at && (c.to === undefined || lt < c.to) && !fired.has(key)) { fired.add(key); motion.cue(c.kind, now); }
    }
    if (d.anim && d.animAt !== undefined && lt >= d.animAt && !fired.has(`${k}:anim:${a.id}`)) { fired.add(`${k}:anim:${a.id}`); a.el.classList.add(`a-${d.anim}`); }
    for (const h of sc.hops || []) {
      const key = `${k}:${h.at}:${h.who}`;
      if (h.who === a.id && lt >= h.at && !fired.has(key)) { fired.add(key); if (!d.calm) motion.hop(now); }
    }
  }
  // 敵・もの(ground:地面に立つ。ほかは空に ういている)
  const imgs = foesEl.children;
  (sc.foes || []).forEach((f, n) => {
    const s = imgs[n]; if (!s) return;
    const fd = f.delay || 0, hd = fd + (f.hold || 0), len = f.len ?? (sc.dur - hd), p = ease(Math.min(1, Math.max(0, (lt - hd) / Math.max(0.1, len)))), pl = Math.min(1, Math.max(0, (lt - hd) / Math.max(0.1, len)));   // len:動いている時間(秒)   // hold:その場で止まっている秒数(見えているが、動きだしはあと)   // delay:出てくるのを、おくらせる(秒)
    const x = lerp(f.from[0], f.to[0], p) + (f.bulge ? f.bulge * Math.sin(Math.PI * p) : 0), y0 = lerp(f.from[1], f.to[1], f.yPow ? Math.pow(p, f.yPow) : p);   // yPow:たて(上下)の動きを、おくらせる(さいしょは よこへ、あとで下へ=弧)
    const sh = f.shake ? Math.sin(now / 38 + n) * 0.7 : 0;
    const hh = lerp(f.h, f.hTo ?? f.h, p), rot = (f.rot || 0) * p + (f.spin || 0) * p;
    const flip = (f.flip ?? f.to[0] < f.from[0]) ? -1 : 1;   // 絵は 右向き。左へ動くときは、はんてん
    const lift = f.arc ? Math.abs(Math.sin(pl * Math.PI * f.arc.n)) * f.arc.h : 0;
    let fr = f.art;   // コマの絵(走る・はばたく など)を、きりかえる
    if (f.frames) fr = f.frames[Math.floor(now / 1000 * (f.fps || 6)) % f.frames.length];
    if (f.hop && lift > 1) fr = f.hop;
    if (f.swapAt !== undefined && lt >= f.swapAt) fr = f.art2;   // swapAt:この秒から、別の絵にかえる
    if (s.dataset.fr !== fr) { s.dataset.fr = fr; s.src = artUrl(fr); }
    s.style.left = `${x}%`; s.style.height = `calc(var(--u)*${hh})`;
    if (f.ground) {
      s.style.top = 'auto'; s.style.bottom = `calc(var(--u)*${GROUND + y0 + lift + sh})`; s.style.transform = `translate(-50%,0) rotate(${rot}deg) scaleX(${flip})`;
    } else {
      const arc = f.arc ? -lift : 0;
      s.style.top = `calc(var(--u)*${y0 + arc + sh + (f.h > 18 ? 14 : 0)})`; s.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scaleX(${flip})`;
    }
    s.style.opacity = lt < fd || (f.until !== undefined && lt >= f.until) ? 0 : f.vanishAtEnd ? (lt >= hd + len ? 0 : 1) : f.fade ? lerp(f.fade[0], f.fade[1], p) : 1;   // vanishAtEnd:最後まで はっきり、着いたら 消える
  });
  // 印(びっくり・おこり・衝撃の星 など)
  (sc.marks || []).forEach((m, n) => {
    const s = marksEl.children[n]; if (!s) return;
    const on = lt >= m.at && lt < m.to, q = Math.min(1, (lt - m.at) / 0.25);
    s.style.opacity = on ? 1 : 0;
    s.style.transform = `translate(-50%,-50%) scale(${m.still ? 1 : on ? 0.4 + 0.6 * ease(q) + Math.sin(now / 90) * 0.04 : 0.4})`;
  });
  // ゆっくり流れる雲・太陽
  (sc.props || []).forEach((pr, n) => { const o = pr[4]; const s = props.children[n]; if (s && o?.drift) s.style.left = `${pr[1] + o.drift * lt}%`; });
  // きらきら・ハート
  if (sc.fx && now - lastPart > (sc.fx.rate || 260) && !reduced) {
    lastPart = now;
    const art = sc.fx.art[Math.floor(Math.random() * sc.fx.art.length)];
    const s = document.createElement('img');
    s.className = `part ${sc.fx.mode}`; s.src = artUrl(art); s.alt = '';
    s.style.left = `${10 + Math.random() * 80}%`; s.style.top = sc.fx.mode === 'rise' ? `calc(var(--u)*${52 + Math.random() * 20})` : `calc(var(--u)*${4 + Math.random() * 8})`;
    partsEl.append(s); setTimeout(() => s.remove(), 3800);
  }
  requestAnimationFrame(frame);
}
const startMovie = MOVIES.find(m => m.id === params.get('play')) || MOVIES.find(m => isOpen(m.id)) || PROLOGUE;
// 最初の場面の背景だけ、先に読む(長くても 4秒で、先へ進む)
const firstBg = BGFILE[startMovie.scenes[0].bg];
if (firstBg) await Promise.race([loadImg(artUrl(firstBg)), new Promise(ok => setTimeout(ok, 4000))]);
play(startMovie);
requestAnimationFrame(frame);
let readySent = false; const sendReady = () => { if (!readySent) { readySent = true; parent.postMessage('story-movie-ready', '*'); } };
requestAnimationFrame(sendReady); setTimeout(sendReady, 400);   // (画面が見えていなくて、rAF が止まっているときも、400ミリ秒で送る)   // 動きだした:親の「読み込み中」を消す
window.play = play; window.MOVIES = MOVIES;
window.warp = (t) => { sceneStart = performance.now() - t * 1000; };   // 試験用:コマの中の時刻へ
window.seek = (n) => { want = Math.min(n, movie.scenes.length - 1); sceneIdx = -1; };   // n番目(0から)のコマへ
