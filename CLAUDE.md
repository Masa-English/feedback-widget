# プロジェクト設定

## 🔴 環境変数の運用ルール（重要・全員必読）

このリポジトリの環境変数は **Doppler を source of truth として一元管理**します。

1. **Vercel の「Sensitive」指定は使わないこと。**
   - Sensitive にすると値が二度と読み出せなくなり（`vercel env pull` が空で返る）、Doppler への一元化・バックアップ・引き継ぎが不可能になります。
   - 後から解除はできず、削除して入れ直すしかありません。
   - CLI: `vercel env add` に **`--sensitive` を付けない**。ダッシュボードでは「Sensitive」トグルを**オフ**にする。
   - チーム設定で Sensitive がデフォルトONになっていないかも確認する。
2. **環境変数は Vercel に手で直接登録せず、Doppler に入れて Doppler→Vercel sync で反映する。**
   - Doppler 側にバージョン履歴が残り、ロールバック・バックアップが効きます。
