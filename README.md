# MLB Pitch History
日本人投手データビューアー MVP

## 概要

MLB の公開 API から日本人投手のシーズン・試合ログおよび投球詳細データを取得し、統計情報やチャート表示を行う Web アプリケーションです。

主な機能：
- 日本人投手リストから投手を選択
- シーズン選択（取得可能な年度）
- 年次試合ログテーブル（勝敗、IP、SO、BB、R、H、ER、HR、ERA、WHIP など）
- 投球詳細画面（球種、速度、カウント、結果）
- 速度分布ヒストグラム・球種割合ドーナツチャート（Recharts）
- ストライク/ボール/アウト/安打などを色分けアイコン化

## 使用技術

- Next.js 14 (TypeScript)
- React 18
- Tailwind CSS
- Shadcn/ui, Radix UI
- Recharts (グラフ表示)
- Lucide React (アイコン)
- Node.js

## セットアップと実行

1. リポジトリをクローン
   ```bash
   git clone https://github.com/your-org/mlb_pitch_history.git
   cd mlb_pitch_history
   ```
2. Docker イメージをビルド
   ```bash
   docker build -t mlb-pitch-history .
   ```
3. Docker コンテナを実行
   ```bash
   docker run --rm -p 3000:3000 mlb-pitch-history
   ```
4. ブラウザで http://localhost:3000 を開く

## ディレクトリ構成

```text
src/
├─ app/             Next.js アプリケーションルート
├─ components/      UI コンポーネント
│  ├─ features/     投球詳細／試合ログ関連
│  └─ ui/           テーブル／カード／スケルトンなど共通
├─ dal/             データアクセスレイヤ（MLB APIラッパー）
└─ lib/             ユーティリティ／型定義
```

## デプロイ

Vercel などのプラットフォームでのデプロイを推奨します。

## 今後の拡張予定

- ユーザー認証・お気に入り投手機能
- リアルタイムライブ更新（WebSocket/SSE）
- ストライクゾーンヒートマップ表示
- モバイル向け PWA サポート

---

© 2024 Your Name or Organization
