// ものがたり(ムービー)の、お話ごとの専用BGM。ゲームの BGM(music.js)と同じしくみで、ここで曲を足して、ここで鳴らす。
// (music.js の TRACKS に、このページの中だけ曲を足す。ゲーム本体の BGM は ふやさない)
// メロディの書きかた:"E5/4 G5/4 -/2 C6/2" = 音/長さ(ステップ。16で1小節)を、順に。"-" は休み。
import { MusicPlayer, TRACKS } from '../music.js';
import { curve, getVolume } from '../audio.js';

const bars = (...list) => list.map((text) => {
  let step = 0;
  return text.trim().split(/\s+/).map((token) => {
    const [note, len] = token.split('/');
    const start = step;
    step += Number(len);
    return note === '-' ? null : [start, note, Number(len)];
  }).filter(Boolean);
});

const STORY_TRACKS = {
  // プロローグ:朝の野原。やさしく、ゆったり
  story_pro: {
    bpm: 80, trim: 1.5, voice: 'soft', bass: 'sustain', pad: 0.04, bells: true,
    chords: ['C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G', 'Am', 'F', 'C', 'G', 'F', 'Em', 'Dm', 'G'],
    lead: bars(
      'E5/4 G5/4 C6/8', 'A5/4 G5/4 E5/8', 'F5/4 A5/4 C6/8', 'B5/4 A5/4 G5/8',
      'G5/4 E5/4 C5/4 E5/4', 'G5/4 B5/4 E6/8', 'C6/4 A5/4 F5/8', 'D5/4 G5/4 B5/8',
      'A5/4 C6/4 E6/8', 'C6/4 A5/4 F5/4 A5/4', 'G5/4 C6/4 E6/8', 'D6/4 B5/4 G5/8',
      'A5/4 C6/4 F6/8', 'E6/4 D6/4 B5/8', 'D6/4 C6/4 A5/4 F5/4', 'B5/4 D6/4 G6/8',
    ),
  },
  // 第1話 ネズミとパパの帽子:ちょこまか、ドタバタ
  story_ep1: {
    bpm: 132, trim: 1.3, voice: 'square', bass: 'bounce', pad: 0.025, stab: true,
    drums: 'k.h.s.h.k.hks.h.', drumsB: 'k.hsk.hsk.hsk.hs',
    chords: ['Am', 'Am', 'Dm', 'E7', 'Am', 'Am', 'F', 'E7', 'C', 'G', 'Am', 'Am', 'Dm', 'G7', 'C', 'E7'],
    lead: bars(
      'A5/2 C6/2 E6/4 C6/2 A5/2 E5/4', 'A5/2 C6/2 E6/4 D6/4 C6/4', 'D6/2 F6/2 A6/4 F6/2 D6/2 A5/4', 'E6/2 G#5/2 B5/4 D6/4 E6/4',
      'C6/2 E6/2 A6/4 E6/2 C6/2 A5/4', 'A5/4 -/2 A5/2 C6/4 E6/4', 'F6/2 A5/2 C6/4 F6/4 E6/4', 'E6/4 D6/4 B5/4 G#5/4',
      'E6/2 G6/2 E6/4 C6/4 G5/4', 'D6/2 G6/2 D6/4 B5/4 G5/4', 'A5/2 C6/2 E6/4 A6/8', 'G6/4 E6/4 C6/4 A5/4',
      'D6/2 F6/2 A6/4 F6/8', 'G6/4 F6/4 D6/4 B5/4', 'C6/2 E6/2 G6/4 C7/4 G6/4', 'E6/2 D6/2 B5/4 G#5/4 B5/4',
    ),
  },
  // 第2話 カエルとママのリボン:沼で、ぴょん、ぴょん
  story_ep2: {
    bpm: 108, trim: 1.5, voice: 'mallet', bass: 'bounce', pad: 0.03,
    chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Gm', 'C', 'F', 'Am', 'Bb', 'C', 'Dm', 'Gm', 'C', 'F'],
    lead: bars(
      'F5/2 -/2 A5/2 -/2 C6/4 A5/4', 'G5/2 -/2 E5/2 -/2 G5/4 C6/4', 'D6/2 -/2 A5/2 -/2 F5/4 A5/4', 'Bb5/2 -/2 D6/2 -/2 F6/4 D6/4',
      'C6/2 A5/2 F5/2 A5/2 C6/8', 'E6/2 C6/2 G5/2 C6/2 E6/8', 'D6/4 Bb5/4 G5/4 Bb5/4', 'E5/4 G5/4 C6/4 E6/4',
      'A5/2 C6/2 F6/4 E6/2 D6/2 C6/4', 'A5/2 C6/2 E6/4 C6/2 A5/2 E5/4', 'D6/2 F6/2 Bb6/4 F6/2 D6/2 Bb5/4', 'C6/2 E6/2 G6/4 E6/2 C6/2 G5/4',
      'F6/4 D6/4 A5/4 D6/4', 'G6/4 D6/4 Bb5/4 D6/4', 'E6/2 D6/2 C6/2 B5/2 C6/8', 'A5/4 C6/4 F6/8',
    ),
  },
  // 第3話 決戦の前に:しずかな決意。だんだん、もりあがる
  story_ep3: {
    bpm: 92, trim: 1.6, voice: 'brass', bass: 'sustain', pad: 0.035,
    drums: 'k.......k.......', drumsB: 'k...s...k...s...',
    chords: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A', 'Dm', 'F', 'Bb', 'C', 'Gm', 'Dm', 'A', 'Dm'],
    lead: bars(
      'D5/8 F5/4 A5/4', 'Bb5/8 A5/4 F5/4', 'C6/8 A5/4 F5/4', 'G5/8 E5/4 G5/4',
      'D5/4 F5/4 A5/4 D6/4', 'D6/8 C6/4 Bb5/4', 'G5/4 Bb5/4 D6/4 G6/4', 'A5/4 C#6/4 E6/8',
      'F6/8 D6/4 A5/4', 'A5/4 C6/4 F6/8', 'D6/4 F6/4 Bb6/8', 'C6/4 E6/4 G6/8',
      'Bb5/4 D6/4 G6/4 D6/4', 'A5/4 D6/4 F6/8', 'E6/4 C#6/4 A5/8', 'D6/16',
    ),
  },
  // 第4話 ドラゴンと最後の戦い:はげしく、おし寄せる
  story_ep4: {
    bpm: 144, trim: 1.7, voice: 'saw', bass: 'drive', pad: 0.03,
    drums: 'k.h.s.h.k.k.s.h.', drumsB: 'k.hsk.hsk.hsk.ss',
    chords: ['Em', 'C', 'Am', 'B7', 'Em', 'C', 'D', 'B7', 'Em', 'G', 'C', 'D', 'Am', 'B7', 'Em', 'B7'],
    lead: bars(
      'E5/2 G5/2 B5/2 E6/2 D6/4 B5/4', 'C6/2 E6/2 G6/2 E6/2 C6/4 G5/4', 'A5/2 C6/2 E6/2 A6/2 G6/4 E6/4', 'B5/2 D#6/2 F#6/2 A6/2 F#6/4 D#6/4',
      'B5/2 E6/2 G6/2 B6/2 A6/4 G6/4', 'G6/2 E6/2 C6/2 E6/2 G6/8', 'F#6/2 A6/2 D7/2 A6/2 F#6/4 D6/4', 'D#6/4 F#6/4 B6/8',
      'E6/4 B5/4 G5/4 B5/4', 'G5/2 B5/2 D6/4 G6/4 D6/4', 'E6/2 G6/2 C7/4 G6/4 E6/4', 'D6/2 F#6/2 A6/4 D7/4 A6/4',
      'A5/4 C6/4 E6/4 A6/4', 'B5/4 D#6/4 F#6/4 A6/4', 'G6/4 B6/4 E7/8', 'F#6/4 D#6/4 B5/8',
    ),
  },
  // エンディング:あたたかく、じんわり
  story_epi: {
    bpm: 72, trim: 1.5, voice: 'soft', bass: 'walk', pad: 0.04, bells: true,
    chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'Dm', 'G', 'C', 'G', 'Am', 'Em', 'F', 'C', 'G', 'C'],
    lead: bars(
      'E5/8 G5/4 C6/4', 'D6/8 B5/4 G5/4', 'C6/8 E6/4 A5/4', 'B5/8 G5/4 E5/4',
      'A5/8 C6/4 F6/4', 'E6/8 G6/4 E6/4', 'D6/8 F6/4 A5/4', 'G5/4 B5/4 D6/8',
      'G5/4 C6/4 E6/4 G6/4', 'B5/4 D6/4 G6/8', 'A5/4 C6/4 E6/4 A6/4', 'G6/4 E6/4 B5/4 G5/4',
      'F6/8 C6/4 A5/4', 'G5/4 E6/4 C6/8', 'D6/4 B5/4 G5/4 B5/4', 'C6/16',
    ),
  },
};
Object.assign(TRACKS, STORY_TRACKS);

const TRACK_OF = { pro: 'story_pro', ep1: 'story_ep1', ep2: 'story_ep2', ep3: 'story_ep3', ep4: 'story_ep4', epi: 'story_epi' };

let player = null;
let want = null;   // ならしたい曲(音が出せるようになる前に呼ばれても、あとで鳴らす)
function apply() {
  if (!player) return;
  player.setVolume(curve(getVolume('bgm')));
  player.play(want);
}
function start() {
  if (player) { if (player.ctx.state !== 'running') player.ctx.resume().catch(() => {}); return; }
  if (!window.AudioContext) return;
  try {
    const ctx = new AudioContext();
    player = new MusicPlayer(ctx);
    apply();
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
  } catch { /* 音が出せなくても、ムービーは見られる */ }
}
// 画面を さわったら(ブラウザの決まり)、音を出せるようにする
addEventListener('pointerdown', start);
addEventListener('keydown', start);
addEventListener('pagehide', () => { try { player?.stop(); player?.ctx.close(); } catch { /* なにもしない */ } });
start();   // ゲームの中から開いたときは、もう さわったあとなので、すぐ鳴る

export function playStoryBgm(movieId) {
  want = TRACK_OF[movieId] ?? null;
  apply();
}
window.__bgm = () => ({ track: player?.name ?? null, state: player?.ctx.state ?? null, volume: getVolume('bgm') });   // 試験用
