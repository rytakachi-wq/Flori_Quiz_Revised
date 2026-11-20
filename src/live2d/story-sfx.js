// ものがたり(ムービー)の効果音。ゲームに入っている音のファイル(assets/audio/)と、ここで作る音(WebAudio。ファイルなし)。
// 音の大きさは、設定の「効果音」のつまみ(se)に合わせる。リストは docs/movie-sfx-list.md。
// 使いかた:sfx('名前', 音量の倍率) / 場面ごとの音は SCENE_SFX、場面のしかけ(札・印・ひかり・ゆれ・ぴょん・歩く・ハート・セリフ)は、story-movie.js が自動で鳴らす。
import { curve, getVolume } from '../audio.js?v=20261120c';
import { audioCtx } from './story-bgm.js?v=20261120c';

// ---- ゲームの音のファイル ----
const FILES = {
  button: 'se-button.mp3', hop: 'se-flori-puyon.mp3', exclaim: 'se-rpg-appear.mp3', bulb: 'se-chime.mp3',
  impact: 'se-rpg-punch.mp3', fanfare: 'se-levelup.mp3', sparkle: 'se-flori-cute.mp3', sad: 'se-rpg-sad.mp3',
};
const BOOST = { button: 2.4, hop: 2.4, exclaim: 1.5, bulb: 1, impact: 1.8, fanfare: 1, sparkle: 2.2, sad: 1.2 };
const buffers = {};
const loading = {};
function loadBuffer(ctx, name) {
  if (buffers[name] || loading[name]) return;
  loading[name] = true;
  fetch(new URL(`../../assets/audio/${FILES[name]}`, import.meta.url))
    .then(r => r.arrayBuffer()).then(d => ctx.decodeAudioData(d)).then(b => { buffers[name] = b; }).catch(() => {});
}

// ---- 効果音ラボ(https://soundeffect-lab.info/)の音(assets/audio/story/ に置いたもの) ----
// 商用利用OK・クレジット不要の素材。ファイルが まだ ないときは、下の「ここで作る音」(または 上の音)で、かわりに鳴らす。
// 名前 → ファイル名(拡張子なし)。入れるファイルの一覧と もとのURLは docs/movie-sfx-download.md。
const EXT = {
  roar: 'dragon-cry1', flap: 'dragon-wing1', thunder: 'thunder1', fire: 'magic-flame2', boom: 'don-1', exclaim: 'surprise1',
  bulb: 'flash2', dizzy: 'dizzy1', boing: 'boyon1', fanfare: 'trumpet1', harp: 'shine6', sparkle: 'shine4', card: 'logo-animation2',
  resolve: 'shakin1', fall: 'hyun1', siren: 'emergency-alert1', gate: 'gate-open1', cage: 'jail-door-close1', key: 'key-in1',
  birds: 'passer-montanus-cry1', ribbit: 'toad1', title: 'title1', end: 'chan-chan1', sad2: 'cute-sad1', itemget: 'item-get1', door: 'iron-door-open1',
};
const ALIAS = { resolve: 'bulb', title: 'fanfare', end: 'fanfare', sad2: 'sad', itemget: 'key', door: 'gate' };   // ファイルも 作る音も ないときの、かわり
const ext = {};   // 名前 → AudioBuffer / 'loading' / 'missing'
function loadExt(ctx, name) {
  if (ext[name]) return;
  ext[name] = 'loading';
  fetch(new URL(`../../assets/audio/story/${EXT[name]}.mp3`, import.meta.url))
    .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(d => ctx.decodeAudioData(d)).then(b => { ext[name] = b; }).catch(() => { ext[name] = 'missing'; });
}

// ---- ここで作る音 ----
let noiseBuf = null;
function noiseBuffer(ctx) {
  if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}
// 音程のある音:f(はじめ)→ f2(おわり)へ すべる
function tone(ctx, out, { t = 0, f = 440, f2 = f, type = 'sine', dur = 0.15, gain = 0.15, attack = 0.005, lowpass = 0 }) {
  const t0 = ctx.currentTime + t;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (f2 !== f) o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let n = o;
  if (lowpass) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = lowpass; o.connect(lp); n = lp; }
  n.connect(g).connect(out);
  o.start(t0); o.stop(t0 + dur + 0.05);
}
// ざーっという音(ノイズ):freq → freq2 へ かわる
function noise(ctx, out, { t = 0, dur = 0.2, gain = 0.1, filter = 'bandpass', freq = 1000, freq2 = freq, q = 1, attack = 0.01 }) {
  const t0 = ctx.currentTime + t;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuffer(ctx);
  f.type = filter; f.Q.value = q;
  f.frequency.setValueAtTime(freq, t0);
  if (freq2 !== freq) f.frequency.exponentialRampToValueAtTime(Math.max(20, freq2), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f).connect(g).connect(out);
  s.start(t0); s.stop(t0 + dur + 0.05);
}
const seq = (n, gap, fn) => { for (let i = 0; i < n; i++) fn(i * gap, i); };

const SYNTH = {
  pop: (c, o) => tone(c, o, { f: 640, f2: 320, dur: 0.07, gain: 0.07 }),
  whoosh: (c, o) => noise(c, o, { dur: 0.3, gain: 0.1, freq: 500, freq2: 2200, q: 0.8, attack: 0.08 }),
  card: (c, o) => [880, 1175, 1568].forEach((f, i) => tone(c, o, { t: i * 0.09, f, type: 'triangle', dur: 0.5, gain: 0.09 })),
  step: (c, o) => { tone(c, o, { f: 110, f2: 55, dur: 0.09, gain: 0.12 }); noise(c, o, { dur: 0.05, gain: 0.05, filter: 'lowpass', freq: 500 }); },
  anger: (c, o) => tone(c, o, { f: 240, f2: 170, type: 'sawtooth', dur: 0.3, gain: 0.05, lowpass: 900 }),
  boom: (c, o) => { tone(c, o, { f: 130, f2: 35, dur: 0.6, gain: 0.3 }); noise(c, o, { dur: 0.45, gain: 0.18, filter: 'lowpass', freq: 700, freq2: 150 }); },
  rumble: (c, o) => noise(c, o, { dur: 0.9, gain: 0.22, filter: 'lowpass', freq: 160, freq2: 70, attack: 0.1 }),
  thunder: (c, o) => { noise(c, o, { dur: 0.15, gain: 0.25, filter: 'highpass', freq: 2500 }); noise(c, o, { t: 0.1, dur: 1.8, gain: 0.3, filter: 'lowpass', freq: 500, freq2: 60, attack: 0.05 }); },
  roar: (c, o) => { tone(c, o, { f: 95, f2: 55, type: 'sawtooth', dur: 1.1, gain: 0.12, lowpass: 600, attack: 0.08 }); noise(c, o, { dur: 1.1, gain: 0.12, filter: 'lowpass', freq: 800, freq2: 200, attack: 0.1 }); },
  flap: (c, o) => seq(3, 0.16, t => noise(c, o, { t, dur: 0.12, gain: 0.1, freq: 280, freq2: 160, q: 1.5 })),
  squeak: (c, o) => seq(2, 0.09, (t, i) => tone(c, o, { t, f: 1900 + i * 500, f2: 2500 + i * 400, dur: 0.07, gain: 0.07 })),
  scurry: (c, o) => seq(6, 0.06, t => noise(c, o, { t, dur: 0.04, gain: 0.05, freq: 2800, q: 2 })),
  ribbit: (c, o) => seq(2, 0.11, t => tone(c, o, { t, f: 190, f2: 120, type: 'square', dur: 0.09, gain: 0.05, lowpass: 700 })),
  boing: (c, o) => tone(c, o, { f: 280, f2: 760, dur: 0.16, gain: 0.1 }),
  dizzy: (c, o) => seq(4, 0.17, (t, i) => tone(c, o, { t, f: i % 2 ? 620 : 980, f2: i % 2 ? 480 : 700, dur: 0.15, gain: 0.07 })),
  water: (c, o) => seq(4, 0.13, t => tone(c, o, { t: t + Math.random() * 0.05, f: 700 + Math.random() * 500, f2: 1400, dur: 0.07, gain: 0.04 })),
  fire: (c, o) => noise(c, o, { dur: 1.0, gain: 0.2, filter: 'bandpass', freq: 600, freq2: 1500, q: 0.6, attack: 0.15 }),
  key: (c, o) => [2093, 2637, 3136].forEach((f, i) => tone(c, o, { t: i * 0.06, f, dur: 0.35, gain: 0.07 })),
  gate: (c, o) => { tone(c, o, { f: 120, f2: 70, type: 'sawtooth', dur: 1.0, gain: 0.06, lowpass: 420, attack: 0.1 }); noise(c, o, { dur: 0.9, gain: 0.04, filter: 'bandpass', freq: 400, q: 3 }); },
  cage: (c, o) => seq(7, 0.055, t => noise(c, o, { t: t + Math.random() * 0.02, dur: 0.05, gain: 0.07, filter: 'highpass', freq: 3500 })),
  siren: (c, o) => seq(4, 0.3, (t, i) => tone(c, o, { t, f: i % 2 ? 1000 : 700, f2: i % 2 ? 700 : 1000, type: 'triangle', dur: 0.3, gain: 0.08 })),
  harp: (c, o) => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(c, o, { t: i * 0.14, f, dur: 0.9, gain: 0.08, attack: 0.01 })),
  birds: (c, o) => seq(3, 0.18, (t, i) => tone(c, o, { t, f: 2400 + i * 200, f2: 3300, dur: 0.09, gain: 0.05 })),
  fall: (c, o) => tone(c, o, { f: 1300, f2: 180, dur: 0.9, gain: 0.08 }),
  clack: (c, o) => seq(3, 0.07, t => noise(c, o, { t, dur: 0.03, gain: 0.1, filter: 'bandpass', freq: 1800, q: 4 })),
};

// ---- 鳴らす ----
export function sfx(name, vol = 1) {
  const ctx = audioCtx();
  if (!ctx || ctx.state !== 'running') return;
  const level = curve(getVolume('se')) * vol;
  if (level <= 0) return;
  const out = ctx.createGain();
  out.gain.value = level;
  out.connect(ctx.destination);
  if (EXT[name]) {   // 効果音ラボの音があれば、それを鳴らす(なければ、かわりの音)
    const b = ext[name];
    if (b && b !== 'loading' && b !== 'missing') {
      const s = ctx.createBufferSource();
      s.buffer = b; out.gain.value = Math.min(1, level * 1.4);
      s.connect(out); s.start();
      return;
    }
    loadExt(ctx, name);
  }
  if (!FILES[name] && !SYNTH[name] && ALIAS[name]) name = ALIAS[name];
  if (FILES[name]) {
    const b = buffers[name];
    if (!b) { loadBuffer(ctx, name); return; }
    const s = ctx.createBufferSource();
    s.buffer = b; out.gain.value = Math.min(1, level * (BOOST[name] ?? 1));
    s.connect(out); s.start();
  } else if (SYNTH[name]) {
    try { SYNTH[name](ctx, out); } catch { /* 音が出なくても、ムービーは見られる */ }
  }
}
// 先に読んでおく(はじめて鳴らすときに、音がおくれないように)
export function preloadSfx() {
  const ctx = audioCtx();
  if (ctx) { for (const n of Object.keys(FILES)) loadBuffer(ctx, n); for (const n of Object.keys(EXT)) loadExt(ctx, n); }
}

// ---- 場面ごとの音(お話の id:場面の番号 → [いつ(秒), 音]) ----
export const SCENE_SFX = {
  'pro:0': [[0.2, 'birds']],
  'pro:1': [[0.8, 'flap'], [3.4, 'thunder'], [3.8, 'roar']],
  'pro:2': [[0.3, 'flap'], [1.3, 'flap'], [3.6, 'sad2']],
  'pro:3': [[0.2, 'cage']],
  'pro:4': [[0.5, 'resolve']],
  'pro:6': [[0.6, 'title']],
  'ep1:0': [[0.3, 'birds']],
  'ep1:1': [[0.5, 'scurry'], [0.7, 'squeak']],
  'ep1:2': [[0.3, 'scurry'], [1.5, 'squeak'], [3.0, 'scurry']],
  'ep1:3': [[1.6, 'dizzy']],
  'ep2:0': [[0.4, 'ribbit'], [1.2, 'water']],
  'ep2:1': [[0.9, 'boing'], [2.6, 'ribbit']],
  'ep2:2': [[0.8, 'ribbit'], [2.6, 'ribbit']],
  'ep2:3': [[0.4, 'dizzy']],
  'ep3:0': [[0.4, 'gate'], [3.2, 'clack']],
  'ep3:1': [[0.3, 'clack']],
  'ep3:2': [[0.2, 'fanfare']],
  'ep3:3': [[0.4, 'door']],
  'ep3:4': [[0.2, 'siren'], [1.2, 'roar']],
  'ep3:5': [[0.5, 'roar']],
  'ep4:0': [[3.4, 'roar'], [6.6, 'fire'], [9.4, 'fire']],
  'ep4:3': [[0.2, 'fall'], [2.0, 'key']],
  'ep4:4': [[0.2, 'itemget'], [3.0, 'fanfare']],
  'epi:0': [[0.5, 'cage']],
  'epi:1': [[0.4, 'key'], [4.3, 'door']],
  'epi:2': [[0.3, 'harp']],
  'epi:3': [[0.2, 'birds']],
  'epi:5': [[0.4, 'end']],
};
// 印の絵 → 音
export const MARK_SFX = { fx_exclaim: 'exclaim', fx_anger: 'anger', bulb: 'bulb', fx_impact: 'impact' };
