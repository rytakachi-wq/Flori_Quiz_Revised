// 物語ムービーの絵コンテ(台本)。ムービーの画面(story-movie2.js)と、絵コンテの表(docs/movie-storyboard.md)の、もとになるデータ。
// ズームは しない(カメラは固定)。ゆれ(shake)だけ ある。
//
// 座標: x = 画面の左右(%)。y = 地面から上へ(u)。u = 画面の幅の 1.28%。
// 人 actors[id]  = { x, y(地面から上。後ろの列ほど大きく)、s(大きさ)、z(前後)、mood(顔・気持ち)、faces(顔の指定)、cues(腕・表情の指定)、calm(腕を動かさない)、anim(体の動き)、walk(歩く)、to:{x,y,a,s}、say、sayAt }
// 敵・もの foes  = { art、frames(コマの絵の名前の並び)、fps、hop(はねるときの絵)、h(高さ u)、hTo、from:[x,y]、to:[x,y]、ground:true(地面に立つ。y は地面から上)、arc:{n,h}(はねる)、spin、rot、fade、shake }
//                  ground を付けないものは、空に ういている(y は 画面の上から)。
// かざり props   = [絵、x、y、高さ、{ ground: 地面から上(地面に立つもの)、drift: 1秒に動く x% }]  ground がないものは、空(y は 画面の上から)。
// 印 marks       = [{ art、at、to、x(%)、y(u。上から)、h }](びっくりの「!」・おこりのマーク・衝撃の星 などを、その間だけ出す)
// hops = [{ at, who }](ぴょん=両腕を上げて跳ねる)  flash = 秒(白くひかる)  shake = [はじめ, 長さ]  fx = { art:[], mode:'rise'|'fall' }  lines = [{ at, who, text }]
// card = 話数の札(はじめの数秒)  titleArt = タイトルの絵

export const A = (x, extra = {}) => ({ x, y: 0, a: 1, s: 1, ...extra });
export const L = (who, text, at = 0) => ({ at, who, text });
export const SURPRISE = { mood: 'びっくり', anim: 'shock' }, SAD = { mood: 'しょんぼり', anim: 'sad', calm: true }, JOY = { mood: 'あはは', anim: 'joy' }, SMILE = { mood: 'にっこり' }, ANGRY = { mood: 'ぷんぷん', anim: 'angry' }, GRIT = { mood: 'ぐぬぬ' }, BRAVE = { mood: 'きりっ' };

// 人の並べ方:前列(フロリ・大きい)+後列(パパ・ママ。小さく、少し上=奥)。横一列にしない。
const FRONT = 1.0, BACK = 0.6, BACKY = 13;   // 前の列と後ろの列が、かさならない大きさ・位置
const MOUSE_RUN = ['mouse_run1', 'mouse_run2', 'mouse_run3', 'mouse_run4'];
const HOLD = pose => [{ at: 0, pose }];   // はりつけを、ずっと
const CUE = (kind, at, every, to) => ({ kind, at, every, to });   // 腕の動き(every: くりかえす間かく)
const HOPS = (n, from, gap, who = 'flori') => Array.from({ length: n }, (_, i) => ({ at: +(from + i * gap).toFixed(2), who }));
const FROG_HOP = { frames: ['frog_crouch'], hop: 'frog_jump_mid' };
const DRAGON_FLY = ['dragon_2', 'dragon_3'];

export const PROLOGUE = { id: 'pro', code: 'P', label: 'プロローグ', scenes: [
  { dur: 5.4, bg: 'home', props: [['house', 17, null, 32, { ground: 15 }]], lines: [L('', 'フロリは パパフロリ・ママフロリと 仲良く 暮らしていました。')], hops: [{ at: 2.8, who: 'flori' }],
    actors: { papa: A(74, { s: 0.45, y: BACKY, ...SMILE }), mama: A(90, { s: 0.45, y: BACKY + 3, ...SMILE }), flori: A(50, { s: 0.85, z: 2, ...SMILE }) } },
  { dur: 6.6, bg: 'dusk',  hops: [{ at: 5.2, who: 'flori' }, { at: 5.2, who: 'papa' }, { at: 5.2, who: 'mama' }], lines: [L('', 'ところが ある日、空が 真っ暗に…! ドラゴンが 現れました!')],
    foes: [{ art: 'dragon_2', frames: DRAGON_FLY, fps: 4, h: 7, hTo: 30, from: [108, 4], to: [52, 41], yPow: 2.4 }], flash: 3.6, shake: [3.6, 0.9],
    marks: [{ art: 'fx_exclaim', at: 1.2, to: 4.4, x: 50, y: 20, h: 14 }],
    actors: { papa: A(13, { s: BACK, y: BACKY, ...SURPRISE, faces: HOLD('surprised'), cues: [CUE('cheer', 0.2, 2.6, 5.0)] }), mama: A(87, { s: BACK, y: BACKY, ...SURPRISE, faces: HOLD('surprised'), cues: [CUE('cheer', 0.2, 2.6, 5.0)] }), flori: A(50, { s: FRONT, z: 2, ...SURPRISE, faces: HOLD('surprised'), cues: [CUE('cheer', 0.2, 2.6, 5.0)] }) } },
  { dur: 5.6, bg: 'night', lines: [L('', 'ドラゴンは パパとママを 連れ去ってしまったのです!')],
    foes: [{ art: 'dragon_2', frames: DRAGON_FLY, fps: 4, h: 30, hTo: 14, from: [26, 14], to: [-30, -12] }],
    actors: { papa: A(11, { s: BACK, y: BACKY, ...SURPRISE, faces: HOLD('surprised'), cues: [CUE('wave', 0.2, 2.6)], to: { x: -24, y: 78, s: 0.3 } }), mama: A(38, { s: BACK, y: BACKY, ...SURPRISE, faces: HOLD('surprised'), cues: [CUE('wave', 0.2, 2.6)], to: { x: -34, y: 74, s: 0.3 } }), flori: A(74, { s: 1.1, mood: 'しょんぼり', anim: 'sway', calm: true, faces: HOLD('wrong') }) } },
  { dur: 6.4, bg: 'castle', props: [['deco_torch', 28, null, 16, { ground: 2 }], ['deco_torch', 92, null, 16, { ground: 2 }]], lines: [L('パパフロリ', 'フロリ 助けてくれ〜!', 0), L('ママフロリ', 'ひらめきの 力を 信じてネ!', 3.2)],
    marks: [{ art: 'fx_cage', at: 0, to: 99, x: 65, y: 82, h: 44, still: true }],
    actors: { papa: A(55, { y: 0, s: 0.4, mood: 'しょんぼり', faces: HOLD('wrong'), cues: [CUE('wave', 0.5, 2.6)], say: 'フロリ 助けて〜!', sayAt: [0, 3.2] }), mama: A(75, { y: 6, s: 0.4, mood: 'しょんぼり', faces: HOLD('wrong'), cues: [CUE('wave', 1.2, 2.6)], say: 'ひらめきの 力を 信じてネ!', sayAt: [3.2, 6.4] }) } },
  { dur: 4.8, bg: 'dusk', lines: [L('フロリ', '任せて! ひらめきクイズで ドラゴンを 倒して パパとママを 助けるヨ!')], hops: HOPS(4, 0.3, 1.2),
    actors: { flori: A(50, { s: 1.6, ...BRAVE, cues: [CUE('cheer', 0.3, 2.6)] }) } },
  { dur: 8.0, bg: 'sunrise', lines: [L('', 'フロリの 冒険が 始まる!')],
    actors: { flori: A(50, { s: 1.2, ...SMILE, faces: HOLD('nikkori'), cues: [CUE('flap', 0, 2.6)], walk: true, to: { x: 125 } }) } },
  { dur: 2.6, bg: 'sunrise', titleArt: 'title_start', hops: [{ at: 0.5, who: 'flori' }], actors: { flori: A(50, { s: 1.0, ...SMILE }) } },
] };

export const EP1 = { id: 'ep1', code: '①', label: '①ネズミ', scenes: [
  { dur: 6.2, bg: 'forest', card: 'card_ep1', lines: [L('', '第1話「ネズミと パパの 帽子」\nフロリは お城を 目指して 歩いていく。')],
    actors: { flori: A(-40, { s: 1.2, ...SMILE, walk: true, delay: 3.2, to: { x: 50 } }) } },
  { dur: 4, bg: 'forest', lines: [L('', 'ネズミが 現れた! …あれ? パパの 帽子を くわえているヨ!')],
    foes: [{ art: 'mouse_run1', frames: MOUSE_RUN, fps: 10, h: 15, ground: true, from: [128, 0], to: [76, 0] }, { art: 'hat', h: 9, ground: true, from: [122, 4], to: [70, 4] }],
    marks: [{ art: 'fx_exclaim', at: 0.4, to: 3.6, x: 34, y: 44, h: 14 }],
    actors: { flori: A(30, { s: 1.2, ...SURPRISE, faces: HOLD('surprised'), cues: [CUE('raise', 0.4, 2.4)], anim: 'shock', animAt: 0.4 }) } },
  { dur: 4.6, bg: 'forest', lines: [L('フロリ', '待て〜! 帽子を 返せ〜!')],
    foes: [{ art: 'mouse_run1', frames: MOUSE_RUN, fps: 12, h: 15, ground: true, from: [60, 0], to: [124, 0], arc: { n: 6, h: 3 } }, { art: 'hat', h: 9, ground: true, from: [67, 4], to: [131, 4], arc: { n: 6, h: 3 } }],
    actors: { flori: A(38, { s: 1.2, ...GRIT, faces: HOLD('surprised'), cues: [CUE('flap', 0, 2.6)], walk: true, to: { x: 54 } }) } },
  { dur: 4.4, bg: 'forest', lines: [L('', 'ひらめきで 足元を ねらって…! 帽子を 捕まえた!')],
    foes: [{ art: 'mouse_dizzy', h: 10, ground: true, from: [66, 0], to: [86, 0] }, { art: 'hat', h: 11, ground: true, from: [68, 4], to: [58, 16], arc: { n: 1, h: 10 } }], hops: [{ at: 1.8, who: 'flori' }],
    marks: [{ art: 'fx_impact', at: 0.5, to: 1.3, x: 58, y: 98, h: 16 }],
    actors: { flori: A(40, { s: 1.25, ...JOY, anim: 'bounce', tilt: 'none', faces: [{ at: 0, to: 1.8, mood: 'あはは' }, { at: 1.8, pose: 'smile' }], cues: [CUE('flap', 1.8, 2.6)] }) } },
  { dur: 3.8, bg: 'forest', lines: [L('フロリ', 'パパの 帽子を 取り返したヨ! 待っててネ パパ!')], fx: { art: ['heart'], mode: 'rise', rate: 110 },
    foes: [{ art: 'hat', h: 14, ground: true, from: [67, 20], to: [67, 20] }],
    actors: { flori: A(50, { s: 1.6, ...SMILE }) } },
] };

export const EP2 = { id: 'ep2', code: '②', label: '②カエル', scenes: [
  { dur: 6.0, bg: 'swamp', card: 'card_ep2',  lines: [L('', '第2話「カエルと ママの リボン」\n次は じめじめの 沼地!')],
    actors: { flori: A(-40, { s: 1.2, ...SMILE, walk: true, delay: 3.2, to: { x: 50 } }) } },
  { dur: 4.4, bg: 'swamp',  lines: [L('', 'ぴょーん! カエルが 飛び出した! リボンを 頭に 乗せているヨ!')],
    foes: [{ art: 'frog_crouch', ...FROG_HOP, h: 13, ground: true, from: [128, 0], to: [74, 0], arc: { n: 3, h: 9 } }, { art: 'ribbon', h: 6, ground: true, from: [128, 12], to: [74, 12], arc: { n: 3, h: 9 } }],
    marks: [{ art: 'fx_exclaim', at: 1.0, to: 3.6, x: 30, y: 44, h: 14 }],
    actors: { flori: A(30, { s: 1.2, ...SURPRISE, faces: HOLD('surprised'), cues: [CUE('raise', 1.0, 2.4)], anim: 'shock', animAt: 1.0 }) } },
  { dur: 4.8, bg: 'swamp',  lines: [L('', 'カエルは けろけろ 笑って 逃げ回る! フロリは ぷんぷん!')],
    foes: [{ art: 'frog_crouch', ...FROG_HOP, h: 13, ground: true, from: [58, 0], to: [84, 0], arc: { n: 4, h: 10 } }, { art: 'ribbon', h: 8, ground: true, from: [58, 12], to: [84, 12], arc: { n: 4, h: 10 } }],
    marks: [{ art: 'fx_anger', at: 0.3, to: 3.4, x: 38, y: 46, h: 12 }],
    actors: { flori: A(24, { s: 1.0, ...ANGRY, faces: HOLD('surprised'), cues: [CUE('flap', 0, 2.6)], walk: true, to: { x: 32 } }) } },
  { dur: 5.6, bg: 'swamp',  lines: [L('', 'ここだ! ひらめきの ジャンプで リボンを 捕まえた!')], hops: [{ at: 0.2, who: 'flori' }, { at: 1.45, who: 'flori' }, { at: 2.7, who: 'flori' }, { at: 3.95, who: 'flori' }],
    foes: [{ art: 'frog_dizzy', h: 10, ground: true, from: [66, 0], to: [82, 0] }, { art: 'ribbon', h: 10, ground: true, from: [68, 8], to: [58, 16], arc: { n: 1, h: 10 } }],
    actors: { flori: A(40, { s: 1.25, ...JOY, anim: null, tilt: 'none', faces: [{ at: 0, to: 1.8, mood: 'あはは' }, { at: 1.8, pose: 'nikkori' }] }) } },
  { dur: 3.8, bg: 'swamp', lines: [L('フロリ', 'ママの リボンは 無事だったヨ! もうすぐ 会えるからネ!')], fx: { art: ['heart'], mode: 'rise', rate: 110 },
    foes: [{ art: 'ribbon', h: 12, ground: true, from: [64, 22], to: [64, 22] }],
    actors: { flori: A(50, { s: 1.6, ...SMILE }) } },
] };

export const EP3 = { id: 'ep3', code: '③', label: '③決戦前', scenes: [
  { dur: 6.6, bg: 'gate', card: 'card_ep3', props: [['deco_gate', 78, null, 48, { ground: 14 }], ['deco_torch', 62, null, 16, { ground: 10 }], ['deco_torch', 94, null, 16, { ground: 10 }]], lines: [L('', '第3話「決戦の 前に」\nお城の 門の前に サソリの 門番が 塞がっている!')],
    foes: [{ art: 'scorpion_guard', frames: ['scorpion_guard', 'scorpion_claws_up'], fps: 2, h: 16, ground: true, delay: 3.0, from: [124, 0], to: [70, 0] }],
    marks: [{ art: 'fx_exclaim', at: 4.4, to: 6.4, x: 28, y: 44, h: 14 }], actors: { flori: A(-40, { s: 1.2, walk: true, delay: 1.6, to: { x: 28 }, faces: [{ at: 0, to: 4.4 }, { at: 4.4, pose: 'surprised' }], cues: [CUE('raise', 4.4, 2.4)], anim: 'shock', animAt: 4.4 }) } },
  { dur: 4.2, bg: 'gate', props: [['deco_gate', 78, null, 48, { ground: 14 }], ['deco_torch', 62, null, 16, { ground: 10 }], ['deco_torch', 94, null, 16, { ground: 10 }]], lines: [L('フロリ', 'ひらめきを 全部 ぶつけて… えいっ!')],
    foes: [{ art: 'scorpion_guard', art2: 'scorpion_hit', swapAt: 1.4, hold: 1.4, h: 16, ground: true, from: [70, 0], to: [118, 0] }], flash: 1.4, shake: [1.4, 0.7], hops: [{ at: 1.2, who: 'flori' }],
    marks: [{ art: 'fx_impact', at: 1.3, to: 2.1, x: 62, y: 80, h: 22 }],
    actors: { flori: A(28, { s: 1.2, ...GRIT, faces: [{ at: 0 }], walk: true, to: { x: 42 } }) } },
  { dur: 5.4, bg: 'gate', props: [['deco_gate', 78, null, 48, { ground: 14 }], ['deco_torch', 62, null, 16, { ground: 10 }], ['deco_torch', 94, null, 16, { ground: 10 }]], lines: [L('フロリ', 'やった! サソリを 追い払ったヨ!', 0), L('フロリ', 'さあ お城の 奥に 進もう!', 2.8)],
    actors: { flori: A(42, { s: 1.2, ...JOY, faces: [{ at: 0, to: 2.8, pose: 'smile' }, { at: 2.8, pose: 'nikkori' }], cues: [CUE('cheer', 0.2, 2.6, 2.6), CUE('flap', 3.0, 2.6)], walk: true, to: { x: 62 } }) } },
  { dur: 5, bg: 'castle', lines: [L('', '警告! お城の 奥から ドラゴンの 声が 響く…!')],
    foes: [{ art: 'dragon_5', h: 30, hTo: 46, from: [124, 26], to: [62, 24], flip: false, shake: true }], shake: [0.3, 1.4],
    actors: { flori: A(26, { s: 1.0, ...SURPRISE, faces: HOLD('surprised'), calm: true, anim: 'shock' }) } },
  { dur: 5, bg: 'castle', lines: [L('フロリ', 'ドラゴン! パパと ママを 返してもらうヨ!')], hops: [{ at: 2.4, who: 'flori' }],
    foes: [{ art: 'dragon_5', h: 34, from: [70, 16], to: [70, 16], shake: true }],
    actors: { flori: A(28, { s: 1.0, ...BRAVE, faces: HOLD('surprised'), cues: [CUE('cheer', 0, 2.6)] }) } },
] };

export const EP4 = { id: 'ep4', code: '④', label: '④ドラゴン', scenes: [
  { dur: 12.2, bg: 'alert', card: 'card_ep4', lines: [L('ドラゴン', 'ガオー! 炎を 食らえ!')], shake: [6.6, 0.9],
    foes: [{ art: 'dragon_4', h: 30, delay: 3.2, len: 2.0, from: [120, 18], to: [68, 20], flip: false, shake: true }, { art: 'fire', h: 12, delay: 6.6, len: 2.4, from: [52, 34], to: [24, 62], rot: -35, vanishAtEnd: true }, { art: 'fire', h: 12, delay: 9.4, len: 2.4, from: [52, 34], to: [24, 62], rot: -35, vanishAtEnd: true }], hops: [{ at: 8.0, who: 'flori' }],
    actors: { flori: A(-40, { s: 1.2, walk: true, delay: 5.0, len: 1.6, to: { x: 24 }, faces: [{ at: 0, to: 6.6 }, { at: 6.6, pose: 'surprised' }], cues: [CUE('cheer', 6.6, 2.6)], anim: 'shock', animAt: 6.6 }) } },
  { dur: 5.6, bg: 'alert', lines: [L('フロリ', '危ない…! そうだ ひらめいた! ドラゴンの 弱点は…!')],
    marks: [{ art: 'bulb', at: 3.4, to: 99, x: 24, y: 40, h: 14, still: true }],
    foes: [{ art: 'dragon_3', h: 28, from: [70, 18], to: [70, 20], shake: true }],
    actors: { flori: A(24, { s: 1.2, ...BRAVE, faces: [{ at: 0, to: 3.2, pose: 'wrong' }, { at: 3.2 }], cues: [CUE('cheer', 0.3)] }) } },
  { dur: 5.6, bg: 'alert', lines: [L('フロリ', 'ひらめき アターック! えいっ!')], shake: [1.6, 0.9], hops: [{ at: 0.9, who: 'flori' }, { at: 2.4, who: 'flori' }],
    marks: [{ art: 'bulb', at: 1.2, to: 2.2, x: 32, y: 40, h: 14 }, { art: 'fx_impact', at: 1.8, to: 2.6, x: 66, y: 42, h: 22 }, { art: 'bulb', at: 2.7, to: 3.7, x: 36, y: 40, h: 14 }, { art: 'fx_impact', at: 3.3, to: 4.1, x: 66, y: 42, h: 22 }],
    foes: [{ art: 'dragon_7', h: 30, from: [70, 20], to: [74, 22], shake: true }],
    actors: { flori: A(26, { s: 1.2, ...GRIT, faces: [{ at: 0 }], to: { x: 40 }, cues: [CUE('flap', 0.8, 2.6)] }) } },
  { dur: 4.4, bg: 'alert', lines: [L('ドラゴン', 'うわぁ〜! 参った〜!')],
    foes: [{ art: 'dragon_6', h: 26, hTo: 18, from: [58, 22], to: [130, 34], flip: true, shake: true }, { art: 'key', h: 9, ground: true, delay: 1.0, len: 1.2, from: [72, 62], to: [72, 2] }],
    actors: { flori: A(40, { s: 1.2, ...JOY, faces: [{ at: 0, to: 2, mood: 'あはは' }, { at: 2, pose: 'smile' }], cues: [CUE('cheer', 0.5, 2.6)] }) } },
  { dur: 5.4, bg: 'alert', lines: [L('フロリ', 'あっ カギだ!', 0), L('フロリ', 'やったー! カギを 拾ったヨ!', 3.0)],
    foes: [{ art: 'key', h: 9, ground: true, len: 2.4, from: [72, 2], to: [72, 2], vanishAtEnd: true }, { art: 'key', h: 10, ground: true, delay: 2.4, from: [70, 46], to: [70, 46] }],
    actors: { flori: A(36, { s: 1.2, ...SMILE, faces: HOLD('nikkori'), cues: [CUE('raise', 2.6, 2.4)], walk: true, len: 2.2, to: { x: 66 } }) } },
  { dur: 6.0, bg: 'alert', lines: [L('フロリ', 'さあ お城へ 行こう!', 0)],
    foes: [{ art: 'key', h: 10, ground: true, from: [66, 46], to: [125, 46] }],
    actors: { flori: A(66, { s: 1.2, ...SMILE, faces: HOLD('nikkori'), cues: [CUE('flap', 0.4, 2.6)], walk: true, to: { x: 125 } }) } },
] };

export const ENDING = { id: 'epi', code: 'E', label: 'エンディング', scenes: [
  { dur: 11.0, bg: 'castle', props: [['deco_torch', 94, null, 16, { ground: 2 }]], lines: [L('フロリ', 'パパ! ママ! お待たせ!', 0), L('パパフロリ', 'フロリ! 来てくれたんだね!', 3.8), L('ママフロリ', 'きっと 来てくれると 信じてたわ!', 7.4)],
    marks: [{ art: 'fx_cage', at: 0, to: 99, x: 65, y: 87, h: 44, still: true }],
    actors: { flori: A(-40, { s: 1.0, faces: [{ at: 0 }], cues: [CUE('expr', 0.4), CUE('wave', 1.8), CUE('expr', 4.9), CUE('flap', 6.2), CUE('expr', 8.8), CUE('wave', 9.6)], walk: true, len: 2.0, to: { x: 24 } }),
      papa: A(55, { y: 0, s: 0.4, mood: 'こまった', calm: true, faces: [{ at: 0, to: 3.8, pose: 'wrong' }, { at: 3.8, pose: 'smile' }] }),
      mama: A(75, { y: 0, s: 0.4, mood: 'こまった', calm: true, faces: [{ at: 0, to: 7.4, pose: 'wrong' }, { at: 7.4, pose: 'smile' }] }) } },
  { dur: 7.0, bg: 'castle', props: [['deco_torch', 94, null, 16, { ground: 2 }]], lines: [L('フロリ', 'カギを 手に入れたよ! 今から 出すね!', 0), L('フロリ', 'えいっ! 檻が 開いたヨ!', 4.2)],
    marks: [{ art: 'fx_cage', at: 0, to: 5.0, x: 65, y: 87, h: 44, still: true }],
    foes: [{ art: 'key', h: 9, ground: true, len: 3.2, until: 5.0, from: [30, 19], to: [38, 19] }],
    actors: { flori: A(18, { s: 0.9, faces: [{ at: 0 }], handSide: 'L', cues: [CUE('raise1', 0.2), CUE('expr', 4.0, 1.8)], walk: true, len: 3.2, to: { x: 26 } }),
      papa: A(55, { y: 0, s: 0.4, mood: 'こまった', calm: true, faces: HOLD('smile') }), mama: A(75, { y: 0, s: 0.4, mood: 'こまった', calm: true, faces: HOLD('smile') }) } },
  { dur: 6.4, bg: 'castle', props: [['deco_torch', 94, null, 16, { ground: 2 }]], lines: [L('パパフロリ', 'ありがとう フロリの おかげだよ!', 0), L('ママフロリ', 'さあ お家に 帰ろう!', 3.2)],
    actors: { flori: A(18, { s: 0.7, ...SMILE, faces: HOLD('smile') }), papa: A(50, { s: 0.7, ...SMILE, cues: [CUE('wave', 0.4, 2.6)] }), mama: A(82, { s: 0.7, ...SMILE, cues: [CUE('wave', 1.6, 2.6)] }) } },
  { dur: 5.2, bg: 'sunrise', lines: [L('パパフロリ', 'フロリ ありがとう! さすが ボクたちの 子だ!')], hops: [{ at: 3.2, who: 'papa' }],
    actors: { flori: A(118, { s: 1.0, z: 2, ...JOY, anim: 'bounce', walk: true, to: { x: 18 } }), papa: A(130, { s: 0.7, y: 6, ...JOY, anim: 'bounce', walk: true, to: { x: 54 } }), mama: A(142, { s: 0.7, y: 12, ...JOY, anim: 'bounce', walk: true, to: { x: 86 } }) } },
  { dur: 5.2, bg: 'sunrise', lines: [L('ママフロリ', 'ひらめきの 力は かっこよかったわ!')], fx: { art: ['heart', 'sparkle'], mode: 'rise', rate: 110 }, hops: [{ at: 1, who: 'flori' }, { at: 2, who: 'papa' }, { at: 3, who: 'mama' }],
    actors: { papa: A(13, { s: BACK, y: BACKY, ...SMILE }), mama: A(87, { s: BACK, y: BACKY, ...SMILE }), flori: A(50, { s: FRONT, z: 2, ...JOY }) } },
  { dur: 5.4, bg: 'home', props: [['house', 17, null, 32, { ground: 15 }]], titleArt: 'title_end', lines: [L('', 'こうして フロリたち 家族は また 仲良く 暮らしました。 おしまい。')],
    actors: { papa: A(74, { s: 0.45, y: BACKY, ...SMILE, cues: [CUE('wave', 0, 2.6)] }), mama: A(90, { s: 0.45, y: BACKY + 3, ...SMILE, cues: [CUE('wave', 0, 2.6)] }), flori: A(50, { s: 0.85, z: 2, ...SMILE, cues: [CUE('wave', 0, 2.6)] }) } },
] };

export const MOVIES = [PROLOGUE, EP1, EP2, EP3, EP4, ENDING];
