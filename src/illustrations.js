// 問題ごとの、イラスト(絵文字と、かんたんな図)。文字をへらして、見ただけで場面が分かるように。
// 問題の uid(番号がつけなおされても変わらない)で、ひもづける。答えが分かってしまう絵には、しない。
// 動きは、style.css の ia- ではじまるクラス(ゆれる・はねる・すべる など)。

import { emojiHtml, imgHtml } from "./emoji-img.js?v=20261124m";

// 絵文字は、描かれた絵(assets/illust/)に置きかわる(emojiHtml)。同じ形の人が並ぶ問題は、A〜D のちがう子(stand_a〜d、walk_a〜d)を使う。
const e = (emoji, cls = "", delay = 0) => `<span class="ie ${cls}"${delay ? ` style="--d:${delay}s"` : ""}>${emoji}</span>`;
const t = (text, cls = "") => `<span class="it ${cls}">${text}</span>`;
const row = (...parts) => parts.join("");
const bars = (heights, cls = "", labels = []) =>
  `<span class="ibars ${cls}">${heights
    .map((h, i) => `<span class="ibar ${h === "?" ? "is-q" : ""}" style="--h:${h === "?" ? 70 : h}%;--d:${i * 0.12}s">${labels[i] ?? ""}</span>`)
    .join("")}</span>`;
const box = (text, cls = "") => `<span class="ibox ${cls}">${text}</span>`;

const ART = {
  // q01 水1滴+水1滴
  ufae16e5c: row(e("💧", "ia-slide-r"), t("＋"), e("💧", "ia-slide-l"), t("＝"), e("❓", "ia-pop")),
  // q02 海に面していない県
  u6db2c831: row(e("🌊", "ia-sway"), e("🗾", "ia-bob"), e("🌊", "ia-sway", 0.4), e("🐚", "ia-bob", 0.3)),
  // q03 影の長さ
  u44b5a205: row(e("☀️", "ia-spin-slow"), e("🧍", "ia-bob"), `<span class="ishadow"></span>`),
  // q04 ろうそく
  u3052da47: row(e("🕯️", "ia-flicker"), e("🕯️", "ia-flicker", 0.2), e("🕯️", "ia-bob"), e("🕯️", "ia-bob", 0.3), e("🕯️", "ia-bob", 0.6), e("💨", "ia-slide-r")),
  // q05 かけっこ
  u4e831231: row(e("🏃", "ia-run"), e("🏃‍♀️", "ia-run", 0.25), e("🏃‍♂️", "ia-run", 0.5), e("🏁", "ia-sway")),
  // q06 冷たい飲み物の水滴
  u146fc6b8: row(e("☀️", "ia-spin-slow"), e("🥤", "ia-bob"), e("💧", "ia-fall"), e("💧", "ia-fall", 0.7)),
  // q07 30日までの月
  u056ac32e: row(e("📅", "ia-bob"), box("30"), e("➡️", "ia-slide-r"), e("❓", "ia-pop")),
  // q08 サイコロ
  uff6b6f4d: row(e("⚂", "ia-roll"), e("↕️", "ia-bob"), e("🎲", "ia-roll", 0.3), e("❓", "ia-pop")),
  // q09 北海道の道庁
  u77365bf3: row(e("🗾", "ia-bob"), e("🏙️", "ia-bob", 0.3), e("⛄", "ia-sway"), e("❄️", "ia-fall"), e("❓", "ia-pop", 0.5)),
  // q10 面積
  uf82373b2: row(e("🗾", "ia-bob"), e("📏", "ia-sway"), e("📐", "ia-sway", 0.3)),
  // q11 国旗の赤い丸
  u399b9bdc: `<span class="iflag"><span class="iflag-dot"></span></span>${e("❓", "ia-pop")}`,
  // q12 地図記号「文」
  ua61836ee: row(e("🗺️", "ia-bob"), `<span class="imapsym">文</span>`, e("❓", "ia-pop")),
  // q13 青信号
  // (信号機の絵は、ともった色が答えの選択肢の「水色」に見えてしまうので、使わない)
  u2995c8e4: row(e("🚶", "ia-run"), e("❓", "ia-pop")),
  // q14 ひもを切る
  u00a98518: row(e("🧵", "ia-bob"), e("✂️", "ia-snip"), t("×3"), e("❓", "ia-pop")),
  // q15 食べるの尊敬語
  u1c0bfc89: row(e("🧑‍🏫", "ia-bob"), e("🍙", "ia-pop"), e("🍵", "ia-bob", 0.3)),
  // q16 並ぶ4人
  u406f9146: `<span class="iline">${["A", "B", "C", "D"].map((l, i) => `<span class="iperson ia-bob" style="--d:${i * 0.2}s">${imgHtml(`walk_${l.toLowerCase()}`)}<b>${l}</b></span>`).join("")}</span>`,
  // q17 硬貨2枚
  // (硬貨の絵は、「100」と書いてあり、選択肢の「100円玉」と紛らわしいので、使わない)
  u898cba24: row(box("?", "is-q"), t("＋"), box("?", "is-q"), t("＝60")),
  // q18 氷が溶ける
  u62e1e802: row(e("🥛", "ia-bob"), e("🧊", "ia-float"), e("💧", "ia-fall", 0.5)),
  // q19 数の並び(だんだん大きくなる)
  ub3fc5058: bars([14, 22, 36, 55, 80, "?"], "ia-grow-bars"),
  // q20 日本で2番目に高い山
  u6c29c7b3: row(e("🥇", "ia-pop"), e("🗻", "ia-bob"), e("🥈", "ia-pop", 0.3), e("⛰️", "ia-bob", 0.3)),
  // q21 ねことねずみ
  u2a199ccc: row(e("🐱", "ia-run"), e("🐱", "ia-run", 0.2), e("🐱", "ia-run", 0.4), e("🐭", "ia-bob"), e("🐭", "ia-bob", 0.2), e("🐭", "ia-bob", 0.4)),
  // q22 お湯が沸騰
  u44d6fc30: row(e("🔥", "ia-flicker"), e("🍲", "ia-bob"), e("♨️", "ia-fall-up"), e("🌡️", "ia-sway")),
  // q23 南を上にした地図
  u5f8188a1: row(e("🗺️", "ia-flip-half"), e("🧭", "ia-spin-slow"), e("❓", "ia-pop")),
  // q24 ねこの手も借りたい
  uac671342: row(e("🏃‍♂️", "ia-run"), e("💦", "ia-fall"), e("🐱", "ia-bob"), e("🐾", "ia-pop", 0.3)),
  // q25 日本一長い川
  u1a7023d8: row(e("🏞️", "ia-bob"), e("〰️", "ia-sway"), e("〰️", "ia-sway", 0.3), e("🌊", "ia-sway", 0.6)),
  // q26 雨降って地固まる
  uaddd618a: row(e("🌧️", "ia-bob"), e("➡️", "ia-slide-r"), e("🌈", "ia-pop"), e("🤝", "ia-pop", 0.3)),
  // q27 枯れ木も山のにぎわい
  uca450574: row(e("🍂", "ia-fall"), e("🌳", "ia-sway"), e("⛰️", "ia-bob"), e("🎉", "ia-pop", 0.3)),
  // q28 回文
  u912c1e6d: row(e("📜", "ia-bob"), e("🔁", "ia-spin-slow"), e("📜", "ia-bob", 0.3)),
  // q29 カレンダーの縦3つ
  uf2aa49c1: `<span class="icalendar">${box("")}${box("?", "is-q")}${box("")}</span>${e("🗓️", "ia-bob")}${t("＝42")}`,
  // q30 新しい問題
  u8052ff1c: row(e("🍲", "ia-bob"), e("♨️", "ia-fall-up"), e("💬", "ia-pop"), e("🤔", "ia-sway"), e("❓", "ia-pop", 0.5)),
  // q31 ふくろの札
  uef8770f5: `<span class="ibags">${[["🍎"], ["🍊"], ["🍎", "🍊"]].map((f, i) => `<span class="ibag ia-bob" style="--d:${i * 0.25}s"><span class="ibag-tag">${f.join("")}</span>🛍️</span>`).join("")}</span>`,
  // q32 鏡の時計
  uc4af73c8: row(e("🕓", "ia-bob"), e("🪞", "ia-flip"), e("🕓", "ia-flip", 0.2)),
  // q33 井戸のカエル
  ucbf506fa: row(e("🐸", "ia-updown"), e("⬆️", "ia-slide-up"), t("3"), e("⬇️", "ia-slide-down"), t("2")),
  // q34 時計の音
  u3c446dec: row(e("⏰", "ia-ring"), e("🔔", "ia-ring", 0.2), e("🔔", "ia-ring", 0.4), e("⏱️", "ia-bob")),
  // q35 はかりと指
  u62b76139: row(e("☝️", "ia-press"), e("🥛", "ia-bob"), e("⚖️", "ia-tilt")),
  // q36 北極点
  u91fd3c39: row(e("🧍", "ia-bob"), e("❄️", "ia-fall"), e("🌐", "ia-spin-slow")),
  // q37 4枚のカードを並べる
  uc306394d: `<span class="icards">${[1, 2, 3, 4].map((n, i) => `<span class="icard ia-shuffle" style="--d:${i * 0.15}s">${n}</span>`).join("")}</span>`,
  // q38 雨が降らないとは限らない
  uef0228b3: row(e("☁️", "ia-bob"), e("🤔", "ia-sway"), e("☔", "ia-bob", 0.3)),
  // q39 日本で一番東の島
  u152c4e98: row(e("🗾", "ia-bob"), e("➡️", "ia-slide-r"), e("🏝️", "ia-bob", 0.3), e("🧭", "ia-spin-slow")),
  // q40 100日後の曜日
  u985fbe66: row(e("📅", "ia-bob"), t("＋100"), e("➡️", "ia-slide-r"), e("❓", "ia-pop")),
  // q41 3つの扉
  u351f7200: row(e("🚪", "ia-swing"), e("🚪", "ia-bob"), e("🚪", "ia-bob", 0.3), e("🎁", "ia-pop", 0.5)),
  // q42 天びんと金貨
  ubf41e3c4: row(e("⚖️", "ia-tilt"), e("🪙", "ia-bob"), e("🪙", "ia-bob", 0.2), e("🪙", "ia-bob", 0.4)),
  // q43 2けたの数の入れかえ
  uc545691b: row(box("", "is-q"), box("", "is-q"), e("🔄", "ia-spin-slow"), box("", "is-q"), box("", "is-q")),
  // q44 本当を言う人とうそをつく人
  u8df2286a: row(e("😇", "ia-bob"), e("🗣️", "ia-pop"), e("😈", "ia-bob", 0.3), e("🗣️", "ia-pop", 0.3), e("🤔", "ia-sway")),
  // q45 5Lと3Lの容器
  u538275d7: `<span class="ijars"><span class="ijar j5"><span class="iwater"></span><b>5</b></span><span class="ijar j3"><span class="iwater"></span><b>3</b></span></span>${t("→")}${box("4", "is-q")}`,
  // q46 3でも5でも割り切れない数
  u901bea22: row(e("🔢", "ia-bob"), e("🔍", "ia-sway"), t("3"), t("5"), e("❓", "ia-pop")),
  // q47 足して20、かけて91
  u4747ec11: `<span class="istack"><span class="irow">${row(box("?", "is-q"), t("＋"), box("?", "is-q"), t("＝20"))}</span><span class="irow">${row(box("?", "is-q"), t("×"), box("?", "is-q"), t("＝91"))}</span></span>`,
  // q48 4人の並び方
  u056da16b: `<span class="iline">${["A", "B", "C", "D"].map((l, i) => `<span class="iperson ia-shuffle" style="--d:${i * 0.2}s">${imgHtml(`stand_${l.toLowerCase()}`)}<b>${l}</b></span>`).join("")}</span>${e("🚫", "ia-pop")}`,
  // q49 あまりの数
  ua843ac76: row(e("🍬", "ia-bob"), e("🍬", "ia-bob", 0.1), e("🍬", "ia-bob", 0.2), e("🍬", "ia-bob", 0.3), e("➗", "ia-spin-slow"), e("❓", "ia-pop")),
  // q50 オオカミ・ヤギ・キャベツ
  uc95c222b: row(e("🐺", "ia-bob"), e("🐐", "ia-bob", 0.2), e("🥬", "ia-bob", 0.4), e("🌊", "ia-sway"), e("🛶", "ia-boat")),
  // o01 21本の棒
  u15d2f312: row(e(imgHtml("stand_a"), "ia-bob"), e("🥢", "ia-pop"), e("🥢", "ia-pop", 0.1), e("🥢", "ia-pop", 0.2), e("🥢", "ia-pop", 0.3), e(imgHtml("stand_b"), "ia-bob", 0.3)),
  // o02 100枚の扉
  uc0a74a66: `<span class="idoors">${Array.from({ length: 10 }, (_, i) => `<span class="idoor" style="--d:${(i % 5) * 0.2 + Math.floor(i / 5) * 0.1}s"></span>`).join("")}</span>${e("🔄", "ia-spin-slow")}`,
  // o03 5人のことば
  ub3d53fe0: `<span class="ifaces">${[1, 2, 3, 4, 5].map((n, i) => `<span class="iface ia-bob" style="--d:${i * 0.15}s"><b>${n}</b>😀</span>`).join("")}</span>`,
  // o04 時計の針が重なる
  u1ba4bd48: `<svg class="iclock" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#46555e" stroke-width="4"/><g stroke="#46555e" stroke-width="3" stroke-linecap="round"><line x1="50" y1="8" x2="50" y2="14"/><line x1="92" y1="50" x2="86" y2="50"/><line x1="50" y1="92" x2="50" y2="86"/><line x1="8" y1="50" x2="14" y2="50"/></g><line class="ih-hour" x1="50" y1="50" x2="50" y2="26" stroke="#d8504a" stroke-width="6" stroke-linecap="round"/><line class="ih-min" x1="50" y1="50" x2="50" y2="14" stroke="#4a78d8" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="50" r="4" fill="#46555e"/></svg>`,
  // o05 夜に橋をわたる4人
  u0222dcac: row(e(imgHtml("stand_a"), "ia-bob"), e(imgHtml("stand_b"), "ia-bob", 0.15), e(imgHtml("stand_c"), "ia-bob", 0.3), e(imgHtml("stand_d"), "ia-bob", 0.45), e("🔦", "ia-flicker"), e("🌉", "ia-sway")),
  // q02 海に面していない県
  u27ca5490: row(e("🗾", "ia-bob"), e("🌊", "ia-sway"), e("🚫", "ia-pop", 0.3)),
  // q15 凍らせたペットボトル
  uc7504b1f: row(e("🥤", "ia-bob"), e("❄️", "ia-spin-slow")),
  // q17 3人の握手
  u909462da: row(e("🙂", "ia-bob"), e("🤝", "ia-pop", 0.2), e("🙂", "ia-bob", 0.3), e("🤝", "ia-pop", 0.5), e("🙂", "ia-bob", 0.6)),
  // q20 時計の針が重なる
  uabc123c2: row(e("🕛", "ia-sway"), e("🔁", "ia-spin-slow")),
  // q98 丸太を切り分ける
  ubd71027a: row(box("20m"), e("✂️", "ia-sway"), box("5m"), box("5m")),
  // q09 日本の信号の「青」は実際には緑に近い色で
  uebc158af: row(e("🚦", "ia-bob")),
  // q10 お店で商品についている「バーコード」は、
  u030ee5ed: row(e("🏷️", "ia-bob"), e("🔍", "ia-sway")),
  // q12 電車の優先席が空いています。元気な人は座
  u580799da: row(e("👴", "ia-bob"), e("🧑", "ia-bob", 0.3), e("🤔", "ia-sway")),
  // q21 うるう年は4年に1度あります。うるう年の
  u5f51eeff: row(e("🗓️", "ia-bob"), e("🔁", "ia-spin-slow")),
  // q24 「ありがとう」はもとは「有り難し」という
  u312d8e52: row(e("😊", "ia-bob"), e("💬", "ia-pop", 0.3)),
  // q27 冬、部屋にある金属のドアノブは木のドアよ
  u5950b372: row(e("🚪", "ia-bob"), e("❄️", "ia-spin-slow"), e("🌡️", "ia-sway")),
  // q28 ろうそくは燃やすと、燃えかすが1つ残りま
  u9ca8454d: row(e("🕯️", "ia-bob"), e("🔥", "ia-pop", 0.3), e("🔁", "ia-spin-slow"), e("🕯️", "ia-bob", 0.5)),
  // q29 道で財布を拾って、交番に届けました。持ち
  u2b8fc0ad: row(e("🧑", "ia-bob"), e("💴", "ia-pop", 0.3), e("🤔", "ia-sway")),
  // q32 災害に備えて、家に非常食を備えます。期限
  u21bcb2e4: row(e("🍙", "ia-bob"), e("📅", "ia-pop", 0.3), e("🔁", "ia-spin-slow")),
  // q33 「食べないことはない」はどういう意味?
  u937dfbef: row(e("🤔", "ia-sway"), e("💬", "ia-pop", 0.3)),
  // q34 人口が100人の村で、村長を決める投票が
  u3e53494c: row(e("👥", "ia-bob"), e("🗳️", "ia-pop", 0.3)),
  // q35 「五月雨」はいつ頃降る雨のこと?
  u86f4e62b: row(e("🌧️", "ia-bob"), e("☔", "ia-sway", 0.3)),
  // q39 冷蔵庫のドアを開けっぱなしにしました。部
  u31220c52: row(e("🚪", "ia-swing"), e("🧊", "ia-bob", 0.3), e("🌡️", "ia-sway", 0.6)),
  // q40 電子レンジに金属を入れると、火花が出ます
  uea1e6021: row(e("🔩", "ia-bob"), e("✨", "ia-pop", 0.3)),
  // q41 ある月の3日は月曜日です。では30日は何
  u69be65fd: row(e("🗓️", "ia-bob"), e("➡️", "ia-pop", 0.3), e("📅", "ia-bob", 0.5)),
  // q46 3つの箱A、B、Cにりんごが入っています
  uaa1dd9be: row(e("📦", "ia-bob"), e("📦", "ia-bob", 0.2), e("📦", "ia-bob", 0.4), e("🍎", "ia-pop", 0.6)),
  // q52 空気が全くない部屋(真空)で羽とボールを
  u631740fd: row(e("🐦", "ia-bob"), e("💨", "ia-sway", 0.3), e("🚫", "ia-pop", 0.5)),
  // q53 地球は、24時間で1回転しています。赤道
  u29c04d9c: row(e("🌏", "ia-spin-slow"), e("🔄", "ia-spin-slow", 0.3)),
  // q54 3×3の9つのマスに、1から9までの数字
  udb7727a6: row(e("🔢", "ia-bob"), e("🧩", "ia-pop", 0.3)),
  // q56 海に近い地域は内陸の地域より、冬に気温が
  ucf549fb2: row(e("🌊", "ia-sway"), e("❄️", "ia-spin-slow", 0.3), e("🌡️", "ia-bob", 0.6)),
  // q58 歴史の本の「紀元前100年」と「紀元前1
  u4c896a18: row(e("📜", "ia-bob"), e("⏳", "ia-sway", 0.3)),
  // q59 歴史では、100年のまとまりを「世紀」で
  u8b5d50d0: row(e("🗓️", "ia-bob"), e("📜", "ia-pop", 0.3)),
  // q60 落語家は舞台で、1本の小道具を持っていて
  u4b1a4cfb: row(e("🎭", "ia-bob"), e("🥢", "ia-sway", 0.3)),
  // q61 「情けは人のためならず」の、正しい意味は
  u27ec2f20: row(e("🤝", "ia-pop"), e("🤔", "ia-sway", 0.3)),
  // q62 宇宙では音が聞こえません。その理由は?
  ub9a75991: row(e("🌙", "ia-bob"), e("🔊", "ia-pop", 0.3), e("🚫", "ia-pop", 0.5)),
  // q69 1日目に1円、2日目に2円、3日目に4円
  ue313c018: row(e("💴", "ia-bob"), e("✖️", "ia-pop", 0.2), t("2"), e("📅", "ia-bob", 0.5)),
  // q71 丸い池の周りに5mおきに木を植えます。池
  u5121a1ee: row(e("🌳", "ia-bob"), e("🏞️", "ia-sway", 0.2), e("🌳", "ia-bob", 0.4)),
  // q74 16人が参加するジャンケンのトーナメント
  u6b886a7e: row(e("👥", "ia-bob"), e("🏆", "ia-pop", 0.3)),
  // q75 前の2つの数を足すと、次の数になる並びが
  u9fd67e98: row(e("🔢", "ia-bob"), e("➕", "ia-pop", 0.3)),
  // q77 歯の数が12個の歯車Aと、18個の歯車B
  u2a1a1b52: row(e("⚙️", "ia-spin-slow"), e("⚙️", "ia-spin-slow", 0.3)),
  // q79 「二の足を踏む」の、正しい意味は?
  u3b3a0a60: row(e("🐾", "ia-bob"), e("🤔", "ia-sway", 0.3)),
  // q82 世界で一番、国土の面積が小さい国は?
  u2102536d: row(e("🌏", "ia-bob"), e("🔍", "ia-sway", 0.3)),
  // q83 昔の武士が頭のてっぺんを剃った髪型(ちょ
  u76bc548c: row(e("🏯", "ia-bob"), e("📜", "ia-pop", 0.3)),
  // q84 歌舞伎で客席の中を通って、舞台につながる
  u2b05d75b: row(e("🎭", "ia-bob"), e("👀", "ia-pop", 0.3)),
  // q86 曇りの日でも日焼けをすることがあります。
  u1a16a703: row(e("☁️", "ia-bob"), e("☀️", "ia-pop", 0.3)),
  // q87 ハワイは日本より19時間遅い時刻です。日
  u84bea145: row(e("🗾", "ia-bob"), e("⏰", "ia-pop", 0.3), e("🏝️", "ia-sway", 0.6)),
  // q88 カレンダーで四角く囲んだ4つの日付(左上
  ufc39aa33: row(e("🗓️", "ia-bob"), e("➕", "ia-pop", 0.3), e("🔍", "ia-sway", 0.6)),
  // q90 ニワトリとウサギが、合わせて8匹います。
  u68df72eb: row(e("🐥", "ia-bob"), e("🐾", "ia-pop", 0.3), e("🔢", "ia-sway", 0.6)),
  // q91 カメレオンが体の色を変える主な理由と考え
  ub705c02f: row(e("🎨", "ia-bob"), e("🌿", "ia-sway", 0.3)),
  // q92 水を入れたペットボトルの横に小さな穴が開
  uf5e1c399: row(e("🥤", "ia-bob"), e("💧", "ia-pop", 0.3), e("⬇️", "ia-pop", 0.5)),
  // q93 雨上がりに虹が見えるとき、太陽はどの方向
  u856dd3c9: row(e("☔", "ia-bob"), e("🌈", "ia-pop", 0.3)),
  // q94 ホッキョクグマの毛が白く見える理由はどれ
  u91255cac: row(e("❄️", "ia-spin-slow"), e("🔍", "ia-sway", 0.3)),
  // q95 飛行機の窓の下のほうには小さな穴がありま
  u356379c1: row(e("☁️", "ia-bob"), e("🔍", "ia-sway", 0.3)),
  // q97 3日と6時間は全部で何時間?
  u6ab1d335: row(e("📅", "ia-bob"), e("➕", "ia-pop", 0.2), e("⏰", "ia-sway", 0.4)),
  // q99 最初に10人乗っていたバスが、停留所ごと
  u197c5093: row(e("🧑", "ia-bob"), e("⬇️", "ia-pop", 0.2), e("🧑", "ia-bob", 0.4), e("⬆️", "ia-pop", 0.6)),
  // q100 「破天荒」の本来の意味はどれ?
  ufac85f3c: row(e("📖", "ia-bob"), e("🤔", "ia-sway", 0.3)),
  // q101 面積が一番小さい都道府県は次のうちどれ?
  u4909c198: row(e("🗾", "ia-bob"), e("🔍", "ia-sway", 0.3)),
  // o05 4枚のカードがあります。カードの片面には
  u1ee4cd18: row(e("🃏", "ia-bob"), e("🃏", "ia-bob", 0.2), e("🃏", "ia-bob", 0.4), e("🃏", "ia-bob", 0.6)),
  // o08 燃えるのにちょうど1時間かかる紐が、2本
  u1b5a9ddb: row(e("🧵", "ia-bob"), e("🔥", "ia-pop", 0.3), e("⏳", "ia-sway", 0.6)),
  // o09 6本のマッチ棒を全部使って、同じ大きさの
  u8709accd: row(e("🔺", "ia-bob"), e("🔺", "ia-bob", 0.2), e("🔺", "ia-bob", 0.4), e("🔺", "ia-bob", 0.6)),
  // o10 3人が1人10円ずつ、合計30円を出して
  ud05518cc: row(e("💴", "ia-bob"), e("🏠", "ia-pop", 0.3), e("🤔", "ia-sway", 0.6)),
};


// あとから足した問題の絵:絵文字を、ならべて、順に、ちがう動きをつける(uid → 絵文字の並び)
const AUTO_ART = {
  udb224dfe: ["🚶", "😊", "✨"],
  ud6c9ef11: ["☁️", "🌤️"],
  ufe10010e: ["🧲", "🔩"],
  u5d2fe453: ["🕙", "⏩"],
  u5c5a026c: ["✏️", "📦"],
  ue5bf374f: ["🌙", "☀️"],
  ua62d15b1: ["🔢", "🔍"],
  u513aec73: ["➕", "✖️"], // (「6」の絵は、答え(どちらも6)が見えてしまうので、使わない)
  ua154b5bc: ["🔤", "6️⃣"],
  ub6d4d70d: ["😀", "🤝", "🤝"],
  u1bdb1b91: ["🌱", "☀️", "💨"],
  u562c5e7f: ["🔔", "⏱️"],
  uf4ddfd14: ["📐", "🔺"],
  ucbd33964: ["👶", "🚶", "👴"],
  u685cf4de: ["🃏", "➕"],
  ub7cf6d53: ["🔥", "◻️"],
  u85664eb4: ["📅", "⏪", "⏩"],
  u8f0c6ab2: ["🧑‍💼", "🗳️"],
  u25682e80: ["🏙️", "🗾"],
  u1618d0ff: ["📜", "💡"],
  u2692bb62: ["👀", "🧑‍🏫"],
  u4c0aeb39: ["🔋", "💡"],
  u245b9539: ["🧂", "🥛"],
  u0cb8bbbd: ["🏷️", "💴"],
  u02ad7743: ["🕑", "📐"],
  ua0fbfb66: ["🔢", "➗"],
  u15cff843: ["🌿", "🐸"],
  u2da1b67a: ["📓", "🖊️"],
  u6e9e738d: ["☁️", "😌"],
  uf3cdf664: ["🎭", "💪"],
  uf1a7ee8d: ["🏞️", "⛩️"],
  u45d94d35: ["🕛", "🗾"],
  u9cac65fd: ["🏜️", "🗾"],
  ubbbdca0f: ["🐉", "👁️"],
  uad5da38b: ["📖", "☝️"],
  u6ee54a61: ["🦂", "⭐"],
  u68fd890b: ["🏷️", "💴"],
  u93c3d45a: ["🚰", "🪣", "⏱️"],
  u7a96d119: ["📄", "🔁"],
  u415753af: ["🔢", "🧩"],
  uf05c25ac: ["⏳", "🩹"],
  u2ea07188: ["🙂", "🤝"],
  ua08fcc82: ["📜", "🏯"],
  u34a93d55: ["🥞", "🍽️"],
  u9f3e96a1: ["🎂", "👥"],
};
const AUTO_ANIM = ["ia-bob", "ia-pop", "ia-sway", "ia-bob", "ia-pop"];
const autoRow = (emojis) => row(...emojis.map((emoji, i) => e(emoji, AUTO_ANIM[i % AUTO_ANIM.length], (i % 5) * 0.2)));

// 解説に出す図(答えのあとに見せるので、答えが分かってもよい)。uid でひもづける。
const EXPLAIN_ART = {
  // q43 ピザを3回切って7切れ
  u00127559: `<svg viewBox="0 0 300 300" class="ex-svg" role="img" aria-label="3本の線が、たがいに交わって、ピザが7切れに分かれた図"><circle cx="150" cy="150" r="140" fill="#FAEEDA" stroke="#854F0B" stroke-width="4"/><g stroke="#C0392B" stroke-width="4" stroke-linecap="round"><line x1="22" y1="182" x2="278" y2="182"/><line x1="195" y1="18" x2="68" y2="238"/><line x1="105" y1="18" x2="232" y2="238"/></g><g font-size="22" font-weight="700" text-anchor="middle" fill="#5a3410"><text x="150" y="158">1</text><text x="150" y="232">2</text><text x="86" y="112">3</text><text x="214" y="112">4</text><text x="150" y="66">5</text><text x="236" y="206">6</text><text x="64" y="206">7</text></g></svg>`,
};
export function explanationArtFor(question) {
  return EXPLAIN_ART[question.uid ?? question.id] ?? "";
}

// その問題の、イラストのHTML(ないときは、空)
export function illustrationFor(question) {
  const uid = question.uid ?? question.id;
  const art = ART[uid] ?? (AUTO_ART[uid] ? autoRow(AUTO_ART[uid]) : "");
  return art ? `<span class="qa-in">${emojiHtml(art)}</span>` : "";
}
