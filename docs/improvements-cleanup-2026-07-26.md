# 実施記録: デッドコード削減 (zod 化後のクリーンアップ)

実施日: 2026-07-26
前回記録: [improvements-zod-validation-2026-07-25.md](./improvements-zod-validation-2026-07-25.md)
※変更は作業ツリー上のみ。git にはコミットしていません。

---

## 1. 実施した削減

| 対象 | 削減量 | 内容 |
|---|---|---|
| `apps/api/.../notion.mapper.ts` | 261行 → 54行 | zod 化で実使用が `getFormula` / `getTitle` の2つだけになっていた。未使用の14関数 (`getRollup` 系 / `getSelectName` / `getDate` / `getRelationIds` 等) を削除。「notionLenient 経由でのみ使うレガシー」であることをヘッダに明記 |
| `.../notion.types.ts` | `NotionRollup` / `RollupValueMap` を削除 | mapper 削減で未使用化したため |
| `nta/pages/ExerciseDetail/ExerciseDetailSkeleton.tsx` | **149行のファイル削除** | `components/DetailPageSkeleton.tsx` とほぼ同一のコピー(diff は命名と整形のみ)で、**参照ゼロ**だった |
| `ntpa/src/lib/fetch.ts` | default export 削除 | 全 importer が named import のため |

検証: `pnpm -r typecheck` / api・両フロント build ✅、lenient 経路を含む実データスモーク (`/training-logs` `/tasks`) ✅

## 2. 検討したが「やらない」と判断したもの (理由つき)

| 候補 | 判断 | 理由 |
|---|---|---|
| nta の infinite フック3本 (`useTrainingLogsInfinite` 等、計167行) を汎用 `useCursorInfinite` に統合 | **見送り** | 共通部分は SWR 呼び出しと page 同期の ~15行/本のみで、getKey (クエリ組み立て) は本ごとに異なる。統合しても正味 ~30行の削減にジェネリクスの間接化が加わり、可読性が下がる方が大きい |
| `TrainingLogList.tsx` (272行) / `ExerciseList.tsx` (326行) のモックデータ | **現状維持** | 静的モックで行数は多いが、未実装ページのデザイン確認用として機能している。実データ接続時に自然に消える |
| `exercise.schema.ts` (7行) を db.ts へ統合 | **現状維持** | ファイル数は減るが、今後クエリスキーマが増える置き場として維持する方が構成が予測しやすい |
| Skeleton 3種のさらなる共通化 | **現状維持** | 残る `DailyLogsHeaderSkeleton` は形が異なり、共通化するとレイアウト調整の自由度が下がる |

## 3. 方針との整合

- 削除したのは「参照ゼロ」または「同一コピー」のみで、レイヤー構成 (db.ts / notion.ts / handler、pages / features / components) は不変。
- 「削減のための抽象化」は行わず、可読性が下がる統合は明示的に見送った。
