// BGM と効果音。大きさは、設定で変えられる(端末内に保存。個人情報ではない)。
// ブラウザの決まりで、画面を1回さわるまでは、音を出せない。
//
// BGMは、このゲームのために作ったオリジナルの曲を、ブラウザの中で演奏する(music.js)。曲のファイルはない。

import { MusicPlayer, jingleSeconds } from "./music.js?v=20261113q";

const BASE = "../assets/audio/";
const SETTINGS_KEY = "floriQuiz.settings.v2";

// 場面ごとのBGM(曲の名前は、music.js の TRACKS)。
// 場面:cover(表紙・成績・設定)、question(ふつうの問題)、hard(難しいモード)、
//      oni(オニ問題)、rpg(RPGクエスト)、result(結果)、tutorial(遊び方)
const BGM = {
  cover: "study",
  question: "cover",
  hard: "deep",
  timed: "deep",
  oni: "oni",
  rpg: "quest",
  rpgboss: "questboss", // RPGの、ボス戦
  rpgchest: "chest", // RPGの、宝箱
  daily: "daily", // 毎日1問
  opening: "openwait", // オープニング(画面をさわる前。ブラウザの決まりで、1回さわるまで、音は出ない)
  gameover: "gameover", // ゲームオーバー
  result: "result",
  tutorial: "tutorial",
  credits: "credits", // スタッフクレジット
};

// 効果音(ファイル)。boost は、小さい音をもち上げる倍率(ピークが 0 dB をこえない範囲)。
const SE = {
  button: { file: "se-button.mp3", boost: 2.4 }, // ボタンをおしたとき
  correct: { file: "se-chime.mp3", boost: 1 }, // せいかい
  wrong: { file: "se-wrong.mp3", boost: 2.4 }, // ふせいかい
  whistle: { file: "se-whistle.mp3", boost: 1 }, // 時間切れ
  tick: { file: "se-tick.mp3", boost: 1 }, // 制限時間のあいだ(くり返す)
  timerFast: { file: "se-timer-fast.mp3", boost: 1 }, // 制限時間の、のこり5秒(くり返す)
  levelup: { file: "se-levelup.mp3", boost: 1 }, // 着せ替えなどの、アイテムをもらったとき(テッテレー)
  drumroll: { file: "se-drumroll.mp3", boost: 1 }, // 結果発表のドラムロール
  rollend: { file: "se-rollend.mp3", boost: 1 }, // ドラムロールの、しめ
  rpgAppear: { file: "se-rpg-appear.mp3", boost: 1.5 }, // RPG:敵があらわれた
  rpgStep: { file: "se-rpg-step.mp3", boost: 1.5 }, // RPG:こうげきに踏みこむ
  rpgPunch: { file: "se-rpg-punch.mp3", boost: 1.8 }, // RPG:こうげきが当たった
  rpgGuard: { file: "se-rpg-guard.mp3", boost: 1.8 }, // RPG:敵のこうげきを受けた
  rpgDing: { file: "se-rpg-ding.mp3", boost: 1.5 }, // RPG:たからばこで回復
  openPa: { file: "se-pa.mp3", boost: 2 }, // オープニング:ロゴ・フロリが ぽんと出るとき
  openPetta: { file: "se-petta.mp3", boost: 2 }, // オープニング:フロリが ぺたっと着地
  floriHop: { file: "se-flori-puyon.mp3", boost: 2.4 }, // フロリ:ぴょんと跳ねる(ぷよん)
  floriStretch: { file: "se-flori-nyu3.mp3", boost: 2.4 }, // フロリ:つま先立ちで伸びる(ニュッ)
  floriCheer: { file: "se-flori-nyu2.mp3", boost: 2 }, // フロリ:ばんざい(ニュッ)
  floriWave: { file: "se-flori-cute.mp3", boost: 2.2 }, // フロリ:手を振る(かわいい動作)
  floriTouch: { file: "se-flori-touch.mp3", boost: 2.2 }, // フロリ:表情・眉の、ちょこっとした動き
  cancel3: { file: "se-cancel3.mp3", boost: 1.5 }, // シューティング:フロリが当たった
  cancel4: { file: "se-cancel4.mp3", boost: 1.5 }, // シューティング:大きい敵に1回当たった
  cancel5: { file: "se-cancel5.mp3", boost: 1.5 }, // シューティング:ゲームオーバー
  rpgSad: { file: "se-rpg-sad.mp3", boost: 1.2 }, // RPG:ゲームオーバー
};

const DEFAULTS = { bgm: 0.7, se: 0.8 };
const volumes = { ...DEFAULTS };

function clamp(value) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : null;
}

// つまみの位置(0〜1)を、実際の音量にする。耳に聞こえる大きさは、音量の「倍率」ではなく
// 「デシベル」で感じるので、つまみ0〜1を、-30 dB〜0 dB に、均等にわりあてる。
// (そのまま音量にすると、つまみの下のほうは聞こえず、上のほうは急に大きくなる)
export function curve(position) {
  return position <= 0 ? 0 : 10 ** ((-30 * (1 - position)) / 20);
}

try {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
  for (const kind of Object.keys(DEFAULTS)) {
    const value = clamp(saved[kind]);
    if (value !== null) volumes[kind] = value;
  }
} catch {
  // 読めなければ、はじめの大きさにする。
}

// 開発中(自分のパソコンで動かしているとき)は、音を出さない。音を聞きたいときは、アドレスの最後に「?sound」をつける
// (つけると、その端末では、おぼえて、以後ずっと音が出る。止めるときは「?sound=0」)。
if (["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) {
  const SOUND_KEY = "floriQuiz.devSound";
  let devSound = false;
  try {
    const param = new URLSearchParams(location.search).get("sound");
    if (param === "0") localStorage.removeItem(SOUND_KEY);
    else if (param !== null) localStorage.setItem(SOUND_KEY, "1");
    devSound = localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    devSound = location.search.includes("sound") && !location.search.includes("sound=0");
  }
  if (!devSound) for (const kind of Object.keys(DEFAULTS)) volumes[kind] = 0;
}

let scene = null;
let unlocked = false;
let context = null;
let music = null;
const buffers = {};

let holding = false; // 短い曲(オープニングなど)を鳴らしている間は、BGMを始めない

function applyBgm() {
  if (!music) return;
  music.setVolume(curve(volumes.bgm)); // 0のときも止めずに、音量だけを0にする
  music.play(holding ? null : (BGM[scene] ?? null));
}

// 短い曲(オープニング、スタート、結果発表の前)を鳴らす。鳴り終わるまで、BGMは止める。長さ(ミリ秒)を返す。
export function playJingle(name) {
  if (!music || !context) return 0;
  const seconds = jingleSeconds(name);
  if (seconds === 0) return 0;
  holding = true;
  applyBgm();
  // 音を出す準備が、まだ終わっていないとき(「止まっている」状態)は、動きだしてから鳴らす(鳴らずにおわるのを、防ぐ)
  if (context.state === "running") music.jingle(name);
  else context.resume().then(() => music.jingle(name)).catch(() => {});
  setTimeout(() => {
    holding = false;
    applyBgm();
  }, seconds * 1000);
  return seconds * 1000;
}

// いま鳴っているBGMの曲名(なにも鳴っていないときは null。確かめるための関数)
export function currentBgm() {
  return music?.name ?? null;
}

// 場面が変わったら、その場面のBGMにする。
export function setScene(name) {
  scene = name;
  applyBgm();
}

// 音を出す準備。画面をさわったときに、1回だけ行う(ブラウザの決まり)。
// 効果音は、小さい音をもち上げるため、WebAudio で鳴らす(使えないときは、ふつうの再生)。
async function prepare() {
  if (context || !window.AudioContext) return;
  try {
    context = new AudioContext();
    music = new MusicPlayer(context);
    applyBgm();
    await Promise.all(
      Object.entries(SE).map(async ([name, { file }]) => {
        try {
          const data = await (await fetch(BASE + file)).arrayBuffer();
          buffers[name] = await context.decodeAudioData(data);
        } catch (error) {
          console.warn("音の読みこみに失敗しました:", file); // 1つ失敗しても、ほかの音は鳴らす
        }
      }),
    );
  } catch (error) {
    console.warn("音の準備に失敗しました:", error.name);
  }
}

// 画面をさわるたびに呼ぶ。はじめてさわったときから、音が出せる。
// ブラウザに止められていたときは、ここで動かしなおす。
export function unlock() {
  unlocked = true;
  if (!context) prepare();
  else if (context.state !== "running") context.resume().catch(() => {}); // 止まっている(suspended)・割りこまれた(interrupted)ときは、動かしなおす
}

// ゲームの画面を見ていないとき(ほかのタブや、ほかのアプリを見ているとき)は、音を止める。もどったら、つづきから。
document.addEventListener("visibilitychange", () => {
  if (!context) return;
  if (document.hidden) context.suspend().catch(() => {});
  else if (unlocked) context.resume().catch(() => {});
});

// 鳴らして、止められる形(stop)を返す。止めなくてもよい
export function playSe(name, maxMs = 0) {
  const se = SE[name];
  if (!se || volumes.se === 0) return { stop() {} };
  const level = curve(volumes.se) * se.boost;
  if (context && context.state !== "running") context.resume().catch(() => {}); // 次の音から、WebAudio で鳴らせるように(この音は、下のふつうの再生で鳴らす)
  if (context && buffers[name] && context.state === "running") {
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffers[name];
    gain.gain.value = level;
    source.connect(gain).connect(context.destination);
    source.start();
    if (maxMs > 0) {
      // 長い音を、途中で、すっと消す(最後の0.15秒で、小さくする)
      const t = context.currentTime + maxMs / 1000;
      gain.gain.setValueAtTime(level, t - 0.15);
      gain.gain.linearRampToValueAtTime(0, t);
      source.stop(t);
    }
    return {
      stop() {
        try {
          source.stop();
        } catch {
          // もう止まっている
        }
      },
    };
  }
  if (!unlocked) return { stop() {} };
  const sound = new Audio(BASE + se.file);
  sound.volume = Math.min(1, level);
  sound.play().catch(() => {});
  if (maxMs > 0) {
    // こちらの再生でも、長い音を、途中で、すっと消す(ハートが半分へる音を、短く保つため)
    const fadeAt = Math.max(0, maxMs - 150);
    const base = sound.volume;
    setTimeout(() => {
      const t0 = performance.now();
      const step = () => {
        const p = Math.min(1, (performance.now() - t0) / 150);
        sound.volume = base * (1 - p);
        if (p < 1) requestAnimationFrame(step);
        else sound.pause();
      };
      step();
    }, fadeAt);
  }
  return { stop: () => sound.pause() };
}

// ハートが半分へった音(ヒントを見たとき):やわらかい「ぽろん」と、ひとつ下がる音。攻撃の音(ばしっ)・受けた音とは、ちがう音(ファイルなし。WebAudio で作る)
export function playHeartHalf() {
  if (volumes.se === 0) return;
  if (context && context.state !== "running") context.resume().catch(() => {});
  if (!context || context.state !== "running") return;
  const level = curve(volumes.se);
  const t = context.currentTime;
  for (const [offset, hz] of [[0, 784], [0.13, 587]]) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(hz, t + offset);
    osc.frequency.exponentialRampToValueAtTime(hz * 0.97, t + offset + 0.3);
    gain.gain.setValueAtTime(0.0001, t + offset);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.3 * level), t + offset + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.32);
    osc.connect(gain).connect(context.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.34);
  }
}

// 鳴らす準備(WebAudio が動いているときだけ。動いていなければ、動かしなおして、今回は鳴らさない)
function ready() {
  if (volumes.se === 0) return false;
  if (context && context.state !== "running") context.resume().catch(() => {});
  return Boolean(context && context.state === "running");
}
// 1つの音を、WebAudio で鳴らす(type:波の形、from→to:高さ(Hz)の変わりかた、start:鳴らしはじめ(秒)、length:長さ(秒)、peak:大きさ)
function blip({ type = "sine", from, to = from, start = 0, length = 0.2, peak = 0.3 }) {
  const t = context.currentTime + start;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + length * 0.8);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * curve(volumes.se)), t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain).connect(context.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

// ジャンプの音:ぴょーん(低い音から、ぐいっと上がって、ふわっと下がる。かるい「ぽよん」の はずみつき)
export function playJump() {
  if (!ready()) return;
  blip({ type: "triangle", from: 260, to: 980, length: 0.17, peak: 0.34 });
  blip({ type: "sine", from: 980, to: 620, start: 0.15, length: 0.16, peak: 0.2 });
  blip({ type: "sine", from: 1960, to: 2400, start: 0.05, length: 0.08, peak: 0.08 });
}

// 新しい飾りを付けたときの音:きらっ(高い音が3つ、かけのぼる)
export function playWear() {
  if (!ready()) return;
  [[1319, 0], [1760, 0.07], [2349, 0.14], [3136, 0.22]].forEach(([hz, start], i) => {
    blip({ type: "sine", from: hz, start, length: i === 3 ? 0.5 : 0.22, peak: 0.22 });
    blip({ type: "triangle", from: hz * 2, start, length: 0.12, peak: 0.05 });
  });
}

// 「しゅん」:高い音から すっと下がる、短い音(ファイルなし。WebAudio で作る)。シューティングで、弾が当たったときに鳴らす
export function playShun() {
  if (!context || context.state !== "running" || volumes.se === 0) return;
  const t = context.currentTime;
  const level = curve(volumes.se);
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1900, t);
  osc.frequency.exponentialRampToValueAtTime(380, t + 0.17);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.22 * level), t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  osc.connect(gain).connect(context.destination);
  osc.start(t);
  osc.stop(t + 0.22);
  // すうっという息のような音を、少し重ねる
  const length = Math.floor(context.sampleRate * 0.14);
  const noise = context.createBuffer(1, length, context.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const air = context.createGain();
  source.buffer = noise;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(5200, t);
  filter.frequency.exponentialRampToValueAtTime(1400, t + 0.14);
  air.gain.value = 0.1 * level;
  source.connect(filter).connect(air).connect(context.destination);
  source.start(t);
}

// くり返す音(制限時間のカチカチ)。止めるときは、stopLoop()
let loop = null;
export function startLoop(name) {
  stopLoop();
  const se = SE[name];
  if (!se || volumes.se === 0 || !context || !buffers[name] || context.state !== "running") return;
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffers[name];
  source.loop = true;
  gain.gain.value = curve(volumes.se) * se.boost * 0.6;
  source.connect(gain).connect(context.destination);
  source.start();
  loop = { source, name };
}
export function stopLoop() {
  if (!loop) return;
  try {
    loop.source.stop();
  } catch {
    // もう止まっている
  }
  loop = null;
}
export function loopName() {
  return loop?.name ?? null;
}

export function getVolume(kind) {
  return volumes[kind];
}

// 音の大きさを、はじめの大きさにもどす。
export function resetVolumes() {
  for (const kind of Object.keys(DEFAULTS)) setVolume(kind, DEFAULTS[kind]);
}

export function setVolume(kind, value) {
  const next = clamp(value);
  if (next === null || !(kind in volumes)) return;
  volumes[kind] = next;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(volumes));
  } catch {
    // 保存できなくても、そのページを開いている間は、かわった大きさのまま。
  }
  if (kind === "bgm") applyBgm();
}
