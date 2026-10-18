夏の大将 メイン画像差し替え／手動アップロード用
2026年10月18日

状態：未公開。公開コミットは作成していません。
基準コミット：9ba3ad9a60e047e60d6a92580dc7e69c03d96da8
対象：https://sumilogomotion-pixel.github.io/portfolio.github.io/art/kutan/seasons/

変更は次の2ファイルだけです。
1. art/assets/seasons/summer-main-20261018.jpg（新規）
2. art/kutan/seasons/seasons-data.js（s20の画像参照と寸法だけ更新）

新しいJPEGは1229×1536px、257787バイト。添付元とバイト単位で一致。
切り抜き、再描画、色調補正、再圧縮はしていません。
Instagram表記・文字・絵全体・余白をそのまま表示します。
四季入口の夏／夏の人物紹介／同じs20作品カードと拡大表示が更新されます。
春・秋・冬、ほか19作品のデータ、作品数、都道府県、URL、QR、noindexは変更しません。
既存s20.jpgとs20.webpはリポジトリから削除しません。

手動での反映方法
1. ZIPをPCで展開します。
2. GitHubの sumilogomotion-pixel/portfolio.github.io の現在のブランチを開きます。
3. 前回確認後に別の変更が入っていれば、今回のseasons-data.jsとの差分を先に確認してください。
   このファイルは上記基準コミットを元にしています。
4. リポジトリ直下で Add file → Upload files を開き、
   github-upload フォルダーの中の art フォルダーをドラッグします。
   ZIPそのもの、README、backup-before-change はアップロードしません。
5. 保存対象のパスが上記2件だけであることを確認。
   seasons-data.jsはs20の画像URLと寸法以外を変更しない差分です。
6. コミット例：Replace summer character main illustration
7. GitHub Pages反映後、対象ページを再読み込みし、「夏の大将」を確認します。
   キャッシュが残る場合は再読み込みしてください。必要なら一度別タブで開きます。
   拡大表示も開き、上のInstagram表記と右の「夏、準備中」が全体表示されるか確認。
8. 新規画像の確認先：
   https://sumilogomotion-pixel.github.io/portfolio.github.io/art/assets/seasons/summer-main-20261018.jpg
   このURLはアップロード後の確認先です。現時点の公開済みURLではありません。

元に戻す場合
backup-before-change/art/kutan/seasons/seasons-data.js を同じ場所へ戻します。
古いs20.jpg／s20.webpは残しているので参照が戻ります。
バックアップの画像は保管用で、今回のアップロードには混ぜません。

検証
スマホ幅360／390pxとPC幅1440pxで、入口・人物紹介・拡大表示を確認。
画像の自然寸法1229×1536pxと表示縦横比が一致。横はみ出しなし。
CSS・表示処理・HTMLは既存のままです。夏のほかの作品数も10点のまま。

公開できなかった理由
既存GitHub連携の書き込みは403 Resource not accessible by integrationで拒否済み。
今回、その制限が変わった証拠はなく、ローカルのサイト作業フォルダーもGit管理されていません。
書き込みの再試行、別経路での公開、認証や権限変更は行っていません。
