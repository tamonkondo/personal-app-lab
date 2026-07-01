# ExerciseDetail Data Hooks Plan

## Goal

`apps/notion-training-app/src/pages/ExerciseDetail.tsx` で直接行っている種目詳細・種目別ログの API 取得を hooks に分離し、モックの `sessionLogs` 表示を API の実データ表示へ置き換える。

既存の似た構造は優先して再利用する。特にログカードは `ExerciseSummaryCard` のカード構造に寄せ、セット表は既存の `ExerciseSetTable` を使う。

「最近の傾向」周辺は後続 API 実装予定のため変更しない。

## Goal Criteria

- `ExerciseDetail.tsx` から直接の `useSWR`, `fetcher`, モック `sessionLogs`, `console.log(exerciseLogs)` がなくなっている。
- 種目詳細 API `/exercise/:exerciseId` の取得が `features/exercise/hooks/useExerciseDetail.ts` に分離されている。
- 種目別ログ API `/exercise/:exerciseId/logs` の取得が `features/exerciseLog/hooks/useExerciseLogsInfinite.ts` に分離されている。
- 種目別ログのページ管理が `features/exerciseLog/hooks/useExerciseLogsParams.ts` に分離され、URL query は `exerciseLogsPage` を使う。
- `ExerciseDetail.tsx` の hero、summary cards、目標進捗が `useExerciseDetail` の実データを使って表示される。
- 種目別ログ欄が API の実データで表示され、ログなし・読み込み中・取得失敗・追加読み込みの状態を扱える。
- ログカードは `ExerciseSummaryCard` と同じ `article` 外枠、ヘッダー、Badge、Link/Button の基本構造に寄せている。
- セット表は新規に重複実装せず、既存 `features/exercise/components/ExerciseSetTable.tsx` を利用している。
- 「最近の傾向」の `trendItems`, `Select`, `trendPeriod`, `setSearchParamsWithReset` 周辺の挙動・表示を変更していない。
- `pnpm --filter @repo/notion-training-app typecheck` が通る。

## Implementation Plan

1. `useExerciseDetail`
   - `features/exercise/hooks/useExerciseDetail.ts` を追加する。
   - `useSWR` で `${VITE_API_URL}/exercise/${exerciseId}` を取得する。
   - `exerciseId` がない場合は key を `null` にして fetch しない。
   - 戻り値は `exerciseDetail`, `isLoading`, `error`, `mutate` にする。

2. `useExerciseLogsParams`
   - `features/exerciseLog/hooks/useExerciseLogsParams.ts` を追加する。
   - `exerciseLogsPage` を `Number(searchParams.get("exerciseLogsPage") || 1)` で取得する。
   - `createSetSearchParamsWithReset` を使い、他の query parameter を保持したまま更新する。

3. `useExerciseLogsInfinite`
   - `features/exerciseLog/hooks/useExerciseLogsInfinite.ts` を追加する。
   - `useSWRInfinite<ExerciseLogWithSetsResponse>` を使う。
   - 初回 URL は `/exercise/${exerciseId}/logs?limit=7`。
   - 2ページ目以降は `previousPageData.meta.next_cursor` を `cursor` に付ける。
   - `exerciseLogs` は `data?.flatMap((page) => page.data) ?? []` として返す。
   - `hasMore` は最後の page の `meta.has_more` から返す。

4. Log components
   - `features/exerciseLog/components/ExerciseLogHistoryList.tsx` を追加する。
   - `features/exerciseLog/components/ExerciseLogHistoryCard.tsx` を追加する。
   - `ExerciseLogHistoryList` は hooks を呼び、状態分岐と `さらに読み込む` を担当する。
   - `ExerciseLogHistoryCard` は `ExerciseSummaryCard` の構造を参考に、ログ1件を表示する。
   - `ExerciseLogHistoryCard` 内で `ExerciseSetTable` を使う。
   - best set は `sets` 内で `maxWeight` が最大の set とする。
   - volume は `sets.reduce((sum, set) => sum + set.kg * set.rep, 0)` とする。
   - PR badge は best set の `maxWeight` が `exerciseDetail.currentMaxWeight` と一致する場合に表示する。
   - 詳細リンクは `/training-log/${exerciseLogId}` とする。

5. `ExerciseDetail.tsx`
   - `useExerciseDetail`, `useExerciseLogsParams`, `ExerciseLogHistoryList` を使う。
   - 既存の summary cards、目標進捗、空表示は実データに合わせる。
   - `goalProgress` は `maxGoalWeight <= 0` の場合 `0`、それ以外は `Math.min(Math.round((currentMaxWeight / maxGoalWeight) * 100), 100)` とする。
   - 種目別ログの `CardContent` 内を `ExerciseLogHistoryList` に置き換える。
   - 「最近の傾向」ブロックは編集しない。

## Verification

- `pnpm --filter @repo/notion-training-app typecheck`
- 可能なら `pnpm --filter @repo/notion-training-app build`
- ブラウザ確認項目:
  - 種目詳細が存在するページで hero、summary cards、目標進捗が表示される。
  - 種目別ログが API データで表示される。
  - `さらに読み込む` でログが追加され、URL の `exerciseLogsPage` が増える。
  - ログなし、詳細なし、取得エラーで `AlertCard` が表示される。
  - 「最近の傾向」の表示と期間選択が変更前と同じように動く。

## Assumptions

- API と共有型は変更しない。
- 種目別ログの初期取得件数は `limit=7`。
- 曜日や明示的な PR 履歴は API レスポンスにないため表示しない。
- 既存 `ExerciseSetTable` は他画面でも利用されているため、大きな見た目変更はしない。
