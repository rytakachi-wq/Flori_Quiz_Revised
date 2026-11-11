// 表紙のフロリのセリフ。表紙を出したときは、あいさつ。10秒間、何も操作しなかったら、家族の おはなしに 変わって、そのあとも、10秒に1回、豆知識が変わる(読めるように、少し長めに出す)。
// 豆知識は、クイズの問題と、同じことを書かない(問題を足したら、見くらべること)。
// 変わるときは、じんわり消えて、じんわり出てくる(動きは style.css の .cover-talk)。
// 画面の文字は、ふりがな(furigana.js)が、あとから付ける。

export const GREETING = "ヤア! ボクはフロリだヨ! 一緒に ひらめきクイズで 遊ぼう!";
export const IDLE_MS = 10000;
export const TALK_INTERVAL = 10000;
const FADE_MS = 700;

export const TALKS = [
  "フロリ家の おはなし:パパは シルクハットが 大好き。毎朝 ピカピカに みがくんだヨ。",
  "フロリ家の おはなし:ママは リボンの おしゃれが 上手。いつも 空の 色に 合わせるんだヨ。",
  "フロリ家の おはなし:おうちの 屋根は ピンク色。朝日が 当たると きらきら 光るヨ。",
  "フロリ家の おはなし:パパは 歌が 好きで、ママと いっしょに よく 歌うんだヨ。",
  "フロリ家の おはなし:ママの 作る 星の クッキーは、フロリの 大好物だヨ。",
  "フロリ家の おはなし:パパと ママは、フロリが 生まれた 日を 毎年 お祝いして くれるヨ。",
  "フロリ家の おはなし:3人は 毎晩、窓から 月を 見て おやすみを 言うんだヨ。",
  "フロリ家の おはなし:パパの 帽子は、おじいちゃんから もらった 宝物なんだヨ。",
  "フロリ家の おはなし:ママの リボンは、フロリが 贈った はじめての プレゼントだヨ。",
  "フロリ家の おはなし:ドラゴンの お城は 遠いけど、家族の 絆は もっと 強いヨ。",
  "フロリ家の おはなし:フロリは 家族に 会うために、毎日 ひらめきの 特訓を しているんだヨ。",
  "フロリ家の おはなし:パパは 足が 速くて、ママは 計算が 得意。フロリは ひらめきが 得意だヨ。",
  "フロリ家の おはなし:家族の 合言葉は「ひらめきは 力!」だヨ。",
  "フロリ家の おはなし:お休みの 日は、3人で 野原へ ピクニックに 行くんだヨ。",
  "フロリ家の おはなし:パパは ネズミが ちょっぴり 苦手。ママは カエルが 苦手だヨ。",
  "フロリ家の おはなし:おうちの 庭には、3人で 植えた 花が 咲いているヨ。",
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
