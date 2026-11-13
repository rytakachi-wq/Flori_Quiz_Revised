// 表紙のフロリのセリフ。表紙を出したときは、あいさつ。10秒間、何も操作しなかったら、家族の おはなしに 変わって、そのあとも、10秒に1回、豆知識が変わる(読めるように、少し長めに出す)。
// 豆知識は、クイズの問題と、同じことを書かない(問題を足したら、見くらべること)。
// 変わるときは、じんわり消えて、じんわり出てくる(動きは style.css の .cover-talk)。
// 画面の文字は、ふりがな(furigana.js)が、あとから付ける。

export const GREETING = "ヤア! ボクはフロリだヨ! 一緒にひらめきクイズで遊ぼう!";
export const IDLE_MS = 10000;
export const TALK_INTERVAL = 10000;
const FADE_MS = 700;

export const TALKS = [
  "パパはシルクハットが大好き。毎朝ピカピカにみがくんだヨ。",
  "ママはリボンのおしゃれが上手。いつも空の色に合わせるんだヨ。",
  "おうちの屋根はピンク色。朝日が当たるときらきら光るヨ。",
  "パパは歌が好きで、ママと一緒によく歌うんだヨ。",
  "ママの作る星のクッキーは、フロリの大好物だヨ。",
  "パパとママは、フロリが生まれた日を毎年お祝いしてくれるヨ。",
  "3人は毎晩、窓から月を見ておやすみを言うんだヨ。",
  "パパの帽子は、おじいちゃんからもらった宝物なんだヨ。",
  "ママのリボンは、フロリが贈った初めてのプレゼントだヨ。",
  "ドラゴンのお城は遠いけど、家族の絆はもっと強いヨ。",
  "フロリは家族に会うために、毎日ひらめきの特訓をしているんだヨ。",
  "パパは足が速くて、ママは計算が得意。フロリはひらめきが得意だヨ。",
  "家族の合言葉は「ひらめきは力!」だヨ。",
  "お休みの日は、3人で野原へピクニックに行くんだヨ。",
  "パパはネズミがちょっぴり苦手。ママはカエルが苦手だヨ。",
  "おうちの庭には、3人で植えた花が咲いているヨ。",
];

export function createTalker({ textEl }) {
  let idleTimer = 0;
  let factTimer = 0;
  let fadeTimer = 0;
  let phase = "off"; // off(止まっている) / greet(あいさつ) / facts(豆知識)
  let last = "";
  const pick = () => {
    let text = last;
    for (let i = 0; i < 8 && text === last; i += 1) text = TALKS[Math.floor(Math.random() * TALKS.length)];
    return text;
  };
  // じんわり消して、文字を入れかえて、じんわり出す(instant のときは、ぱっと出す)
  const swap = (text, instant = false) => {
    clearTimeout(fadeTimer);
    last = text;
    if (instant) {
      textEl.classList.remove("talk-hide");
      textEl.textContent = text;
      return;
    }
    textEl.classList.add("talk-hide");
    fadeTimer = setTimeout(() => {
      textEl.textContent = text;
      requestAnimationFrame(() => textEl.classList.remove("talk-hide"));
    }, FADE_MS);
  };
  const stop = () => {
    clearTimeout(idleTimer);
    clearInterval(factTimer);
    clearTimeout(fadeTimer);
    textEl.classList.remove("talk-hide");
    phase = "off";
  };
  // 10秒、何も操作しなかったら、豆知識にする
  const arm = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      phase = "facts";
      swap(pick());
      factTimer = setInterval(() => swap(pick()), TALK_INTERVAL);
    }, IDLE_MS);
  };
  return {
    start() {
      stop();
      phase = "greet";
      swap(GREETING, true); // 表紙が出たときは、ぱっと出す
      arm();
    },
    // 画面をさわったとき:まだあいさつのときだけ、10秒数えなおす
    poke() {
      if (phase === "greet") arm();
    },
    stop,
  };
}
