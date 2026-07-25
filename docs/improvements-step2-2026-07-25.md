# 実施記録: 設計方針 移行手順2 (AppLayout / PageHero 導入)

実施日: 2026-07-25
対象方針: [design-policy-2026-07-25.md](./design-policy-2026-07-25.md) Part 2 / 移行手順2
前回記録: [improvements-step1-2026-07-25.md](./improvements-step1-2026-07-25.md)
※変更は作業ツリー上のみ。git にはコミットしていません。

---

## 1. 何をしたか (`apps/notion-training-app`)

### 1-1. `app/AppLayout.tsx` 新設 — ページラッパの一元化
全9ページ + Skeleton 2つに重複していた

```tsx
<main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
  <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
```

を `AppLayout`(react-router のレイアウトルート + `<Outlet/>`)に集約。`router.tsx` は全ルートを `<Route element={<AppLayout />}>` で包む形に変更。各ページはフラグメント(`<>...</>`)でセクションを並べるだけになった。

### 1-2. `components/PageHero.tsx` 新設 — ダークヒーローの一元化
全ページに重複していた `rounded-3xl bg-zinc-950 ...` のヒーロー section を `PageHero`(props: `badge` / `eyebrow` / `title` / `description` / `actions`)+ `HeroLinkButton`(outline=戻る系 / primary=主要アクション)に集約。

**置換したファイル (9箇所):**
- `pages/TrainingLogList.tsx` / `TrainingLogNew.tsx` / `TrainingLogEdit.tsx` / `TrainingLogDetail.tsx`
- `pages/ExerciseList.tsx` / `ExerciseNew.tsx` / `ExerciseEdit.tsx`
- `features/trainingLog/components/DailyLogsHeader.tsx`(動的: badge + 日付タイトル + メモ)
- `features/exercise/components/ExerciseDetailHeader.tsx`(動的: eyebrow に最新日付)

Skeleton 3つ(`DetailPageSkeleton` / `ExerciseDetailSkeleton` / `DailyLogsHeaderSkeleton`)はヒーロー形のプレースホルダとして意図的に独自マークアップを維持(ラッパのみ AppLayout 対応に修正)。

### 1-3. ついでに発見・修正したバグ
| ファイル | 誤ったリンク | 修正後 |
|---|---|---|
| `pages/TrainingLogList.tsx` | `/training-log/${id}`(存在しないルート) | `/training-logs/${id}` |
| `pages/ExerciseDetail/ExerciseDetail.tsx` | `/exercise/new` | `/exercises/new` |
| `features/exercise/components/ExerciseDetailHeader.tsx` | `/exercise-logs` | `/exercises` |

また `HomePage.tsx` のコンポーネント名が `TrainingLogDetail` と誤っていたのを `HomePage` に修正。

## 2. 効果

- **grep 検証**: ヒーローのマークアップ実体は `PageHero.tsx`(+Skeleton プレースホルダ)のみ、`<main>` ラッパは `AppLayout.tsx` のみに。
- 今後トーンや余白を変えるときの修正箇所が 11ファイル → 2ファイルに。
- 新規ページは「AppLayout 配下に置き、`<PageHero>` + セクション群を返すだけ」で見た目が揃う。

## 3. 検証結果

| 検証 | 結果 |
|---|---|
| `pnpm -r typecheck` | ✅ 全て成功(未使用 import 2件を検出→除去済み) |
| `pnpm --filter @repo/notion-training-app build` | ✅ 成功 |
| ヒーロー/ラッパ残存 grep | ✅ 期待箇所のみ |

## 4. 次の候補

- 移行手順3: `TrainingLogNew`(現511→493行)/`TrainingLogEdit`(610→592行)のフォーム分離(`TrainingLogForm` + `useTrainingLogForm`)。**ミューテーション実装(API 書き込み)と同時に行うのが効率的**
- Part 1 Step 2: `*.db.ts` の zod ランタイム検証化
