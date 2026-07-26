# 実施記録: 移行手順3 (トレーニング記録の作成API + フォーム分離)

実施日: 2026-07-26
対象方針: [design-policy-2026-07-25.md](./design-policy-2026-07-25.md) Part 2 移行手順3
前回記録: [improvements-cleanup-2026-07-26.md](./improvements-cleanup-2026-07-26.md)
※変更は作業ツリー上のみ。git にはコミットしていません。

---

## 1. 設計確認の結果 (Notion DB introspection に基づく)

| 論点 | 決定 |
|---|---|
| 日付 | **当日記録のみ**。TRAINING_LOGS に書き込み可能な date プロパティが無く createdTime(自動)のみのため。name に当日日付を設定。過去日付対応は Notion 側に date プロパティを追加したときに拡張 |
| スコープ | **新規作成のみ**(編集 PATCH はセット差分更新の設計が必要なため次回) |
| 命名規則 | 既存データ踏襲: ログ `"YYYY-MM-DD"` / 種目ログ `"record__<既存ログ数+1>__<種目名>"` / セット `"<連番>__<YYYYMMDD>__<種目名>"` |
| 途中失敗 | ロールバックなし。作成済みページ ID をエラーメッセージに含める(Notion 上で手直し可能) |
| theGoalWeightRelation | 直近の既存レコードでも空だったため自動リンクしない |

## 2. API (`apps/api`)

- **`POST /api/notion-training-app/training-logs`** を新設。
- `@repo/schemas` の `createTrainingLogSchema` を改訂: 日付入力を廃止、`kg`/`rep` は `z.coerce.number()`、`sets` は最低1件。ハンドラで `safeParse` → 不正は 400 + issues。
- 書き込みペイロードは設計どおり各 DB の db.ts に配置:
  - `trainingLog.db.ts` → `buildCreateTrainingLogProperties`
  - `exerciseLog.db.ts` → `buildCreateExerciseLogProperties`
  - **新規** `exerciseSet.db.ts` → `buildCreateExerciseSetProperties`(セットは双方向リレーションのためセット側から張れば種目ログ側に自動同期)
- `trainingLog.notion.ts` の `createTrainingLog()` がオーケストレーション: ログ本体 → 種目ログ(連番採番のため直列、既存ログ数は query でカウント)→ セット(`p-limit` 並列)。失敗時は `AppError`(cause 付き)に作成済み ID を含める。
- `config` に `NOTION_EXERCISE_SETS_DATABASE_ID` を追加。
- 種目名取得は種目ページから取得(クライアント入力を信用しない)。
- `/exercise/names` のレスポンスを `ApiResponse<{id,name}[]>` 封筒に統一。

## 3. フロントエンド (`apps/notion-training-app`)

**ページ肥大の解消 (方針: pages は薄い合成のみ)**

| ファイル | 行数 | 役割 |
|---|---|---|
| `pages/TrainingLogNew.tsx` | **493 → 63行** | PageHero + エラー表示 + Form 合成。submit で作成 → 詳細ページへ遷移 |
| `features/trainingLog/components/TrainingLogForm.tsx` | 362行 | フォーム UI 全体 (サマリー/種目リスト/基本情報/種目ダイアログ) |
| `features/trainingLog/hooks/useTrainingLogForm.ts` | 191行 | ドラフト状態管理 + `buildPayload()` (空セット除外・数値変換) |
| `features/trainingLog/hooks/useTrainingLogMutations.ts` | 44行 | `mutateJson` + SWR キー prefix 一括再検証 (ntpa の `useTaskMutations` パターン) |
| `features/exercise/hooks/useExerciseNames.ts` | 新規 | 種目選択肢を `/exercise/names` から取得 (従来はハードコードのモック配列) |

- 種目選択が**実データ**になり、`exerciseId` を保持して送信。
- 日付入力は「当日記録」の読み取り専用表示に変更。
- `@repo/types` に `CreateTrainingLogResult/Response`・`ExerciseNameItem/NamesResponse` を追加し、API と共有。

## 4. 検証結果

| 検証 | 結果 |
|---|---|
| `pnpm -r typecheck` / api・nta build | ✅ |
| POST 実データ作成 ([TEST] マーク付き) | ✅ 201。ログ+種目ログ+セット2件が作成され、命名規則も既存と一致 |
| 作成データの読み取り整合 | ✅ 詳細 API で sets 復元・総重量 380 (=20×10+22.5×8) を Notion 数式が正しく計算。一覧先頭にも表示 |
| バリデーション | ✅ 種目0件 / kg 不正 → 400 |

⚠️ **テストで実際に作成した Notion ページが残っています**: トレーニングログ `3a8684c1-6338-812f-aaa8-e963667a91f5`(memo: "[TEST] 作成API動作確認")+ 種目ログ1件 + セット2件。不要なら Notion 上で削除するか、指示があればアーカイブします。

## 5. 次の候補

- TrainingLogEdit の編集 (PATCH: セット差分更新の設計から)
- UI からの一連の操作確認 (ブラウザでの動作確認)
- ExerciseNew / ExerciseEdit のミューテーション実装 (同じパターンで小さく済む)
