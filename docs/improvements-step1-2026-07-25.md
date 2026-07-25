# 実施記録: 設計方針 Step 1 (map 集約) + widgets 移動

実施日: 2026-07-25
対象方針: [design-policy-2026-07-25.md](./design-policy-2026-07-25.md)
※変更は作業ツリー上のみ。git にはコミットしていません。

---

## 1. フロント: widgets 廃止・移動 (方針 Part 2 / 移行手順1)

### 移動内容 (`apps/notion-training-app`)

| 移動前 | 移動後 | 判断基準 |
|---|---|---|
| `pages/home/widgets/DailyLogsHeader.tsx` | `features/trainingLog/components/` | fetch を含むドメイン UI |
| `pages/home/widgets/DailyLogsHeaderSkeleton.tsx` | `features/trainingLog/components/` | 本体コンポーネントに隣接配置 |
| `pages/ExerciseDetail/widgets/ExerciseDetailHeader.tsx` | `features/exercise/components/` | ドメイン UI |
| `pages/ExerciseDetail/widgets/ExerciseDetailMain.tsx` | `features/exercise/components/` | ドメイン UI (exerciseLog の hooks/コンポーネントを使用) |
| `pages/home/widgets/{TabPanel, TabPanelCard, ControllPanel, SidePanel}.tsx` | `pages/home/` 直下 | ホーム専用の見た目の合成部品 |
| `pages/TrainingLogs.tsx` | **削除** | 参照ゼロの残骸 (3行) |

- `widgets/` ディレクトリは全廃(`pages/home/widgets` / `pages/ExerciseDetail/widgets` を削除)。
- import 修正は `HomePage.tsx` / `ExerciseDetail.tsx` / `TabPanel.tsx` の3ファイルのみ(features 移動分は相対深度が同じため無修正)。

### 移動後の構成

```
pages/
  home/            HomePage + ホーム専用の合成部品 (TabPanel 等)
  ExerciseDetail/  ExerciseDetail + ExerciseDetailSkeleton (ページ本体のみ)
features/
  trainingLog/components/  DailyLogsHeader(+Skeleton) を含むドメイン UI
  exercise/components/     ExerciseDetailHeader / Main を含むドメイン UI
```

---

## 2. API: Step 1 — 「1 DB = 1 定義ファイル (`*.db.ts`)」への集約 (方針 Part 1)

全5 feature に `*.db.ts` を新設し、**Notion の生プロパティ名と「ページ ⇔ ドメイン型」変換をそこだけに集約**した。`*.notion.ts` は「クエリ組み立て + API 呼び出し」専任になった。

### 新設ファイルと集約した内容

| ファイル | 集約した内容 |
|---|---|
| `task/task.db.ts` | `TASK_PROPS`(論理名→生名マップ。`" Working hours"` 等の罠をここだけに)、`mapTaskPage`、`buildCreateTaskProperties` / `buildUpdateTaskProperties`(作成/更新ペイロード) |
| `project/project.db.ts` | `PROJECT_PROPS`、`mapProjectPage` |
| `exercise/exercise.db.ts` | 取得プロパティリスト3種(name/summary/detail)、`mapExerciseSummaryItem` / `mapExerciseDetail` / `mapExerciseTrends`、`readExerciseLogRefs`。**summary/detail で重複していた rollup 読み取りを `readMaxGoalWeight` / `readCurrentMaxWeight` に共通化** |
| `exerciseLog/exerciseLog.db.ts` | `exerciseLogWithSetsProperties`、`mapExerciseLogWithSetsItem` / `emptyExerciseLogWithSets` / `mapExerciseLogsWithSets` |
| `trainingLog/trainingLog.db.ts` | 取得プロパティリスト4種、`mapTrainingLogSummaryItem` / `mapTrainingLogDetail`(集計値計算含む) / `mapNewestTrainingLog` |

### 支援ヘルパー

- `libs/notion/propertyExtract.ts` に `notionPropOf<Properties>()` を追加。filter でのプロパティ名参照を型チェック付きにした:
  ```ts
  filter: { property: exerciseProp("maxGoalWeightRollup"), ... }  // typo はコンパイルエラー
  ```
- `*.notion.ts` から `property: "生名"` の直書きを全廃(grep で残存ゼロを確認)。`filter_properties` のリテラル配列も db.ts の定義リストに置換。
- `exerciseSet.types.ts` の `NotionExerciseSetWeightProperties` を export 化(kg/rep リストの型付けに使用)。

### 効果

- Notion 側でプロパティ名を変更した場合の修正箇所が **feature ごとに `*.db.ts` 1ファイル**になった。
- `*.notion.ts` の役割が「クエリと取得フロー」に限定され、見通しが改善(例: `exercise.notion.ts` のマッピング約60行が db.ts の関数呼び出しに)。
- 次フェーズ(方針 Step 2: zod ランタイム検証)は、この `*.db.ts` の map 関数を zod パーサへ置き換えるだけで済む土台ができた。

---

## 3. 検証結果

| 検証 | 結果 |
|---|---|
| `pnpm -r typecheck`(4アプリ) | ✅ 全て成功(各 feature 移行ごとに実行) |
| `pnpm --filter @repo/api build` / 両フロント build | ✅ 成功 |
| API 起動 + `/api/health` | ✅ 200 |
| `/tasks?scope=active`(実データで map 集約後の動作確認) | ✅ 200・レスポンス形不変 |
| `/projects` `/exercise/summary` `/training-logs` `/training-logs/newest` | ✅ すべて 200 |

## 4. 補足

- レスポンスの JSON 形状は一切変更していない(純粋なリファクタリング)。フロント側の修正は不要。
- 次にやる場合の候補: 方針 Part 2 移行手順2(nta への AppLayout / PageHero 導入)、または Part 1 Step 2(`*.db.ts` の zod 化)。
