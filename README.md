# BEYBLADE RANDOM MAKER

BEYBLADE Xの所持パーツを登録して、決めた分岐ルールに従ってランダムカスタムを生成するWebアプリです。

## 確定ルール

### ブレード
- 通常 → ラチェット → ビット
- シンプル専用 → シンプルタイプのラチェット → ビット
- UXX → ラチェットを選択しない → ビット
- CX → ロックチップ → アシストブレード → ラチェット → ビット
- CXX → ロックチップ → オーバーブレード → アシストブレード → ラチェット → ビット

### ラチェット
UXX以外でラチェットを選択した場合、ラチェットが一体型ならビットを選択しません。

## データ保存

パーツ登録情報はGitHubには保存せず、使用している端末のブラウザのlocalStorageに保存します。

## GitHub Pages公開

1. GitHubで新しいPublic repositoryを作る。
2. このZIPを展開し、**中身をリポジトリ直下**へアップロードする。
3. `package.json` がリポジトリのトップ階層に見えることを確認する。
4. `.github/workflows/deploy.yml` も存在することを確認する。
5. Settings → Pages → Sourceを「GitHub Actions」にする。
6. mainへpush/commitするとActionsが自動でBuild→Deployする。
7. Actionsの「Deploy to GitHub Pages」が緑になったらPagesのURLを開く。

## ローカル開発

```bash
npm install
npm run dev
```
