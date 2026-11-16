# 効果音ラボ(soundeffect-lab.info)から入れる音のファイル

ものがたりの効果音のうち、下の26こは、効果音ラボの素材に差しかえられるようにしてある(`src/live2d/story-sfx.js` の `EXT`)。
**ファイルを `assets/audio/story/` に置くだけで、自動で、その音が鳴る**(まだ置いていない音は、いまの「ブラウザで作る音」「ゲームの音」が鳴る)。

効果音ラボは、商用利用OK・クレジット不要(アダルト利用と再配布は禁止)。
**AIからは、サイトが自動のダウンロードを断る(403)ので、取りこめていない。** ブラウザで、各ページの試聴の横の「ダウンロード」から、保存してください(ファイル名は、そのまま)。

| 鳴らす音(コードの名前) | 使う場面 | ファイル名 | ページ |
|---|---|---|---|
| roar | ドラゴンの咆哮 | dragon-cry1.mp3 | https://soundeffect-lab.info/sound/battle/ |
| flap | ドラゴンのはばたき | dragon-wing1.mp3 | https://soundeffect-lab.info/sound/battle/ |
| fire | ドラゴンの炎 | magic-flame2.mp3 | https://soundeffect-lab.info/sound/battle/ |
| thunder | 空がまっくらに(雷) | thunder1.mp3 | https://soundeffect-lab.info/sound/various/ |
| gate | お城の門 | gate-open1.mp3 | https://soundeffect-lab.info/sound/various/ |
| door | 門の奥へ・牢屋が開く | iron-door-open1.mp3 | https://soundeffect-lab.info/sound/various/ |
| cage | とらわれている牢屋 | jail-door-close1.mp3 | https://soundeffect-lab.info/sound/various/ |
| key | カギ | key-in1.mp3 | https://soundeffect-lab.info/sound/various/ |
| birds | 朝の小鳥 | passer-montanus-cry1.mp3 | https://soundeffect-lab.info/sound/animal/ |
| ribbit | 沼のカエル | toad1.mp3 | https://soundeffect-lab.info/sound/environment/ |
| boom | ドーン(ひかり・衝撃) | don-1.mp3 | https://soundeffect-lab.info/sound/anime/ |
| exclaim | びっくり(!) | surprise1.mp3 | 同上(anime) |
| bulb | ひらめき(電球) | flash2.mp3 | 同上 |
| dizzy | 目をまわす | dizzy1.mp3 | 同上 |
| boing | カエルのジャンプ | boyon1.mp3 | 同上 |
| fanfare | やった!(ラッパ) | trumpet1.mp3 | 同上 |
| harp | ありがとう(ハープ) | shine6.mp3 | 同上 |
| sparkle | ハート・きらきら | shine4.mp3 | 同上 |
| card | 話数の札 | logo-animation2.mp3 | 同上 |
| resolve | 「任せて!」 | shakin1.mp3 | 同上 |
| fall | ドラゴンが飛んでいく | hyun1.mp3 | 同上 |
| siren | 警告! | emergency-alert1.mp3 | 同上 |
| title | プロローグのタイトル | title1.mp3 | 同上 |
| end | おしまい | chan-chan1.mp3 | 同上 |
| sad2 | しょんぼり | cute-sad1.mp3 | 同上 |
| itemget | カギを拾った | item-get1.mp3 | 同上 |

(anime のページ:https://soundeffect-lab.info/sound/anime/ )

足し引きしたいときは、`story-sfx.js` の `EXT`(名前→ファイル名)と、`SCENE_SFX`(場面ごとの音の時刻)を直します。
ほかに よさそうな音(今回は入れていない):足音=草むらを歩く(walk-tussock1)・ドラゴンの鳴き声2(dragon-cry2)・ゴゴゴゴ(gogogogo1)・ジャジャーン(jajean1)・ちょこっと(cute-walk1=かわいい足音)。
