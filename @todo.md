# 日本人投手データビューアー MVP開発タスクリスト

## 開発環境構築 (Phase 1)
- [x] 🟡 Next.js プロジェクト初期化 (TypeScript, Tailwind CSS, ESLint)
  - `create-next-app` を使用
  - `globals.mdc`, `dev-rules/tech-stack.mdc` 記載のバージョンに合わせる
- [x] 🟡 Shadcn/ui セットアップ
  - `components.json` 設定済み
  - **TODO:** 必要なコンポーネントの初期インストール (例: `npx shadcn-ui@latest add button select table card`)
- [x] 🟡 Docker 環境構築 (`Dockerfile`, `docker-compose.yml`)
  - Node.js 環境
  - ポート設定

## データ準備 (Phase 1)
- [x] 🟢 日本人投手リストJSONファイル作成 (`src/lib/constants/pitchers.json`)
  - `requirement.md` のデータモデルに従う
  - 初期データとして数名の投手情報を入力

## 基本レイアウト実装 (Phase 1)
- [x] 🟢 ルートレイアウト (`src/app/layout.tsx`) 設定
  - Tailwind CSS 基本設定
  - フォント設定 (必要であれば)
- [x] 🟢 メインレイアウトコンポーネント (`src/components/layouts/main-layout.tsx`) 作成
  - `requirement.md` に記載の2カラムレイアウト（左: 投手リスト, 右: データ表示エリア）
  - ヘッダー/フッター (必要であれば)

## 投手リスト機能 (Phase 1)
- [x] 🟡 投手リスト表示コンポーネント (`src/components/features/pitchers/pitcher-list.tsx`) 作成
  - `pitchers.json` からデータを読み込み表示 (Server Component推奨)
  - 投手名（日本語/英語）を表示
  - 投手選択時のインタラクション（選択状態の管理、選択イベントの発火）
- [x] 🟢 投手データアクセス層 (`src/dal/pitchers.ts` または Server Component内で直接) 実装
  - `pitchers.json` を読み込む関数

## シーズン選択機能 (Phase 1)
- [x] 🟡 シーズン選択UIコンポーネント (`src/components/features/stats/season-selector.tsx`) 作成
  - 選択された投手に基づいて利用可能なシーズンを取得・表示 (Client Component)
  - ドロップダウン (Select) またはタブ形式
  - シーズン選択イベントの発火
- [x] 🟡 MLB Stats API ラッパー (`src/dal/mlb.ts`) 基本実装
  - APIエンドポイント定義
  - `fetch` を使用した基本的なAPI呼び出し関数
- [x] 🟡 選手情報取得API連携 (`/people/{personId}/stats?stats=yearByYear&group=pitching`)
  - 特定選手のシーズン別統計情報を取得し、利用可能なシーズンを抽出するロジック

## 試合データ表示機能 (Phase 1)
- [x] 🟡 試合ログ取得API連携 (`/people/{personId}/stats?stats=gameLog&season={season}&group=pitching`)
  - 選択された投手とシーズンに対応する試合ログを取得するロジック
- [x] 🟡 試合リスト表示コンポーネント (`src/components/features/stats/game-log-table.tsx`) 作成
  - 取得した試合データをテーブル形式で表示 (Server Component or Client Component + fetch)
  - `requirement.md` に記載の基本成績（日付, 対戦相手, イニング, 奪三振, 与四球, 失点, WHIP等）を表示
  - 試合選択時のインタラクション

## 投球詳細表示機能 (Phase 1)
- [x] 🟡 投球データ取得API連携 (`/game/{gamePk}/feed/live`)
  - 選択された試合の投球データを取得するロジック (データ量が大きい可能性あり)
- [x] 🟡 投球詳細表示コンポーネント (`src/components/features/stats/pitch-detail-view.tsx`) 作成
  - 取得した投球データを表示 (Server Component or Client Component + fetch)
  - 投球種類、速度、結果などを表示
  - MVPでは簡易的なリスト表示で可

## 状態管理と連携 (Phase 1)
- [x] 🟡 アプリケーション状態管理
  - 選択中の投手ID、シーズン、試合Pkを管理する方法を決定（URLパラメータ、Context API, Zustandなど）
  - 各コンポーネント間の連携ロジック実装

## UI調整と仕上げ (Phase 1)
- [x] 🟢 レスポンシブデザイン対応
  - Tailwind CSS のブレークポイントを利用してモバイル表示を調整
- [x] 🟢 ローディング/エラーステート表示
  - データ取得中のローディング表示 (`loading.tsx`, Suspense)
  - APIエラー時のエラーメッセージ表示 (`error.tsx`)
  - Skeleton コンポーネントによる表示改善
  - ThemeProvider, ModeToggle によるダークモード対応
  - Shadcn/ui コンポーネント (Select, Card) の適用

## 改善・追加検討事項 (Phase 1)
- [ ] モバイル表示時の投手リストのドロワー化
- [ ] テーブルのページネーション/ソート機能の追加
- [ ] 投球データフィルタ・検索機能 (球種やカウントごと)
- [ ] エラー発生時のトースト通知によるフィードバック
- [ ] テストコード (Unit/Integration) の追加
- [ ] 投球詳細: イニングごと折りたたみ（Accordion）
- [x] 投球詳細: ストライク/ボール色分け・アイコン化
- [ ] 投球詳細: 固定ヘッダー＋横スクロール対応
- [ ] 投球詳細: 投球ゾーンミニチャート
- [ ] 投球詳細: フィルタ／ソート機能追加
- [ ] 投球詳細: サマリーバー（合計投球数・平均速度など）
- [ ] 投球詳細: レスポンシブカード表示
- [ ] 投球詳細: 速度分布／球種割合グラフ
- [ ] 投球詳細: キーボード操作サポート
- [ ] 投球詳細: モーダル／詳細ポップアップ

## 将来拡張候補 (Phase 2以降)
- [ ] ⚪ 投球データの視覚化（ストライクゾーン、速度分布など）
- [ ] ⚪ Prisma + SQLiteによるデータ永続化
- [ ] ⚪ ユーザーアカウント（Clerk）の統合
- [ ] ⚪ お気に入り投手の保存機能
- [ ] ⚪ Server Components活用によるパフォーマンス最適化
- [ ] ⚪ Vercelへのデプロイメント
- [ ] ⚪ 日本プロ野球データとの連携
- [ ] ⚪ 検索/フィルター機能 (投手リスト)
- [ ] ⚪ テストコード (Unit/Integration) 