# 設計方針: 定義方法の最適化とフロント画面分割のシンプル化

作成日: 2026-07-25
関連資料: [design-review-2026-07-25.md](./design-review-2026-07-25.md) / [improvements-2026-07-25.md](./improvements-2026-07-25.md)
※本資料は方針(ポリシー)であり、コードはまだ変更していません。git にもコミットしていません。

---

## Part 1. 定義方法の最適化 (API / 型 / スキーマ)

### 1-1. 現状: 1つの Notion DB の知識が「4箇所」に分散している

例えば Exercise DB を1つ扱うために、以下を**すべて手で同期**させている:

| 場所 | 内容 | 例 |
|---|---|---|
| ① `apps/api/.../exercise.types.ts` | Notion プロパティの型定義 | `name: NotionProp<"name", "title">` ×16行 |
| ② `apps/api/.../exercise.notion.ts` | `notionDefineProperties` の取得キーリスト(用途別に3つ) + `getFormula`/`getRollup` 呼び出しによるマッピング | `exerciseSummaryProperties` 等 |
| ③ `packages/types/.../exercise.ts` | フロントへ返すドメイン型(手書き) | `ExerciseDetail` |
| ④ `packages/schemas/...` | zod スキーマ(③の enum から導出) | `exerciseRmTypesSchema` |

**問題点:**
- Notion 側でプロパティ名を1つ変えると ①②(場合により③④)を追いかけて直す必要がある。生のプロパティ名(`" Working hours"` の先頭スペース等)が複数ファイルに散在。
- ①の型は宣言だけで**ランタイム検証がない**ため、実際には `as unknown as` キャストで信頼している(レビュー指摘4)。型と実データがズレても気づけない。
- マッピングロジックが「一覧用」「詳細用」で重複しがち(`exercise.notion.ts` 内で `getRollupArrayValue(maxGoalWeightRollup)` が2箇所 等)。

### 1-2. 方針: 「1 DB = 1 定義ファイル」に集約する

**原則: Notion DB に関する知識(プロパティ名・型・ドメイン型への変換)は、feature ごとの `*.db.ts` 1ファイルだけが持つ。**

```
features/exercise/
  exercise.db.ts       ← ★ プロパティ名マップ + ページ→ドメイン変換(ここだけが Notion 生名を知る)
  exercise.notion.ts   ← クエリ組み立てと API 呼び出しのみ(生プロパティ名を書かない)
  exercise.handler.ts  ← リクエスト検証とレスポンス整形のみ
```

#### Step 1(すぐできる): マッピング関数の集約

`task.notion.ts` の `mapTaskPage()` が既に理想形。これを全 feature に展開する:

```ts
// exercise.db.ts
export const EXERCISE_PROPS = {
  name: "name",
  musclesTypes: "musclesTypes",
  maxGoalWeightRollup: "maxGoalWeightRollup",
  // ... Notion 生名はここだけ
} as const;

/** Notion ページ → ドメイン型。プロパティの読み方を知る唯一の場所 */
export function mapExercisePage(page: NotionExercisePage<...>): ExerciseDisplayBase { ... }
export function mapExerciseDetail(page: NotionExercisePage<...>): ExerciseDetail { ... }
```

- `*.notion.ts` からは `getFormula`/`getRollup` の直接呼び出しを排除し、`map*` 関数経由に統一。
- マッピングの重複(summary と detail で同じ rollup の読み方)は `map*` の合成で解消。

#### Step 2(中期): zod によるランタイム検証 + 型の導出

手書きの `NotionXxxProperties`(①)と `as unknown as` を、**zod パーサ + `z.infer`** に置き換える:

```ts
// exercise.db.ts
const exercisePageSchema = z.object({
  id: z.string(),
  url: z.string(),
  properties: z.object({
    name: notionTitle(),          // ← 共通ヘルパー (integrations/notion に用意)
    musclesTypes: notionMultiSelect(),
    maxGoalWeightRollup: notionRollupNumber(),
  }),
});
export type ExercisePage = z.infer<typeof exercisePageSchema>;
export const parseExercisePage = (raw: unknown) => exercisePageSchema.parse(raw);
```

- `notionTitle()` / `notionRollupNumber()` 等は `integrations/notion/notion.schema.ts` として一度だけ作る(既存 mapper の zod 版)。
- これで「Notion 側のスキーマ変更 → 実行時に明確なエラー」となり、キャスト頼みが解消される(指摘4の恒久対応)。
- `filter_properties` リストは `Object.keys(schema.shape.properties.shape)` から**導出**でき、②の手書きリストも不要になる。

#### Step 3(将来・任意): DB スキーマの自動生成

Notion API はデータソースの schema introspection ができるため、`scripts/generate-notion-types.ts` を作れば ①相当を自動生成できる。個人開発の規模なら Step 2 まで(手書き zod)で十分。**Step 3 は DB が5個を超えて辛くなってから**でよい。

### 1-3. レスポンス定義の方針

- 封筒型は `@repo/types` の `ApiResponse<T>` / `PaginatedResponse<T>` に**統一**(手書きの `{ message; data }` 再宣言禁止。improvements で一部対応済み)。
- `message: "getExerciseDetail"` のような関数名エコーは情報価値がないため、**新規エンドポイントでは廃止**してよい(既存はフロント互換のため維持し、置き換え時に削除)。
- ドメイン型(③)は当面手書きを維持し、Step 2 完了後に「API レスポンス型 = ハンドラ返り値からの導出」へ寄せる。

### 1-4. やらないこと(明示)

- `packages/types` / `schemas` への package.json 付与・本格パッケージ化: 現行の tsconfig paths + vite alias 方式で困っていないため、**モノレポ構成の全面見直しをする時まで保留**。
- ORM / DB 層の導入(Prisma 復活): データソースは Notion に一本化されており、README の TODO(Neon デプロイ)が具体化するまで着手しない。

---

## Part 2. フロント画面分割のシンプル化

### 2-1. 現状の課題

1. **UI の置き場が3系統あり、ルールが曖昧**
   - `pages/<Page>/widgets/`(nta のみ)/ `features/<domain>/components/` / `src/components/`
   - 例: `pages/home/widgets/DailyLogsHeader.tsx` は**データフェッチを含む**のに pages 配下 — 「widgets = ページ専用の見た目部品」という区分けが実態と合っていない。
2. **ページの肥大化**: `TrainingLogEdit.tsx` 610行、`TrainingLogNew.tsx` 511行。フォームの状態・バリデーション・マークアップがページ直書き。
3. **アプリ間の不統一**: ntpa には `AppLayout`(共通ナビ)があるが nta にはなく、各ページがヒーロー section を重複記述(レビュー指摘16)。
4. **スケルトンの置き場が3箇所**: `components/DetailPageSkeleton` / `pages/ExerciseDetail/ExerciseDetailSkeleton` / `pages/home/widgets/DailyLogsHeaderSkeleton`。
5. **残骸**: `pages/TrainingLogs.tsx`(3行・どこからも参照されていない)。
6. 定数が `src/constants/` と `features/*/constants/` に分かれ、基準がない。

### 2-2. 方針: レイヤーを4つに固定する(軽量 Feature-Sliced)

ntpa が概ねこの形なので、**ntpa の構成を標準**とし nta を寄せる:

```
src/
  app/          ← router / providers / AppLayout (アプリの骨格。ここ以外にレイアウトを書かない)
  pages/        ← ルート1つ = ファイル1つ。「薄い合成」のみ
  features/     ← ドメイン単位。UI もデータも状態もここ
    <domain>/
      components/   ← データフェッチを含んでよい。Skeleton は同 dir に隣接配置
      hooks/        ← データ取得 (SWR) / URL params
      store/        ← Zustand (必要な場合のみ)
      constants.ts  ← そのドメインでしか使わない定数
      lib/          ← 純粋ロジック (テスト対象)
  components/   ← ドメイン非依存の共通部品のみ (AlertCard, ScrollToTop 等)
  lib/          ← fetch shim / searchParams / sentry 等の横断ユーティリティ
```

**各レイヤーのルール(依存は下向きのみ: pages → features → components/lib):**

| レイヤー | してよいこと | してはいけないこと | 目安 |
|---|---|---|---|
| `pages/` | feature コンポーネントとフックの合成、URL パラメータの受け渡し | fetch 呼び出し、フォーム状態、100行超のマークアップ | **~100行** |
| `features/` | fetch / 状態 / ドメイン UI すべて | 他 feature の内部への import(必要なら hooks 経由の公開 API にする) | — |
| `components/` | props だけで動く汎用 UI | fetch、ドメイン型への依存 | — |
| `app/` | ルーティング、レイアウト、Provider | 業務ロジック | — |

**widgets ディレクトリは廃止**する。移行先の判断基準:
- データフェッチやドメイン知識を含む → `features/<domain>/components/`
- そのページ専用の純粋な見た目の分割 → ページと同じファイル内の子コンポーネント、または `pages/<Page>/` 直下(サブディレクトリを掘らない)

### 2-3. nta の具体的な移行マッピング

| 現在 | 移行先 | 理由 |
|---|---|---|
| `pages/home/widgets/DailyLogsHeader(+Skeleton).tsx` | `features/trainingLog/components/` | fetch を含むドメイン UI |
| `pages/home/widgets/TabPanel(Card).tsx` `ControllPanel.tsx` `SidePanel.tsx` | `pages/home/` 直下 or HomePage 内に統合 | ホーム専用の合成部品(29〜42行と小さい) |
| `pages/ExerciseDetail/widgets/*` | `features/exercise/components/` | ドメイン UI |
| `pages/ExerciseDetail/ExerciseDetailSkeleton.tsx` | 対応コンポーネントの隣 | スケルトン隣接配置ルール |
| `pages/TrainingLogEdit.tsx` (610行) / `TrainingLogNew.tsx` (511行) | `features/trainingLog/components/TrainingLogForm.tsx` + `hooks/useTrainingLogForm.ts` に分離。New/Edit ページは Form に初期値を渡すだけの薄い合成に | ページ肥大の解消。New/Edit のマークアップ重複も削減 |
| `pages/TrainingLogs.tsx` | **削除** | 参照ゼロの残骸 |
| `src/constants/parts.ts` | `features/` 横断で使うため現状維持でよい(1ファイルなら `constants/` のままが最小) | — |
| ヒーロー section の重複 | `app/AppLayout.tsx` を新設(ntpa の AppLayout を参考)。ページタイトル部は `<PageHero title action>` として `components/` へ | 指摘16の解消 |

### 2-4. アプリ間の共有方針

- **共有するもの**(`@repo/ui` / `@repo/api-client` / `@repo/utils`): 見た目のプリミティブ、fetch 層、日付フォーマット(ntpa の `lib/format.ts` は `@repo/utils` へ吸収)。
- **共有しないもの**: `AppLayout`・ナビゲーション。アプリごとに世界観が違ってよい部分まで共通化すると変更コストが逆に上がるため、**構造(規約)だけ揃えて実装は各アプリに置く**。
- 迷ったら「2つのアプリで同時に変更したくなるか?」で判断する。Yes なら packages へ。

### 2-5. 移行の進め方(推奨順)

1. **無害な削除・移動から**: `TrainingLogs.tsx` 削除 → widgets の features への移動(import パス変更のみ、挙動不変)
2. **AppLayout / PageHero 導入**: ホーム以外のページからヒーロー重複を除去
3. **フォーム分離**: TrainingLogNew/Edit → `TrainingLogForm`(ここで初めてロジックに触るので、ミューテーション実装(指摘15)と同時にやると二度手間がない)
4. API 側は Part 1 の Step 1(map 関数集約)→ Step 2(zod 化)の順に feature 単位で少しずつ。**全部一気にやらない**(1 feature 移行 → typecheck / 動作確認 → 次へ)

### 2-6. 新しい画面・機能を作るときのチェックリスト

- [ ] ページは `pages/` に1ファイル、100行を超えたら feature へ切り出し
- [ ] fetch する UI は必ず `features/<domain>/components/` に置く
- [ ] SWR キーは `API_BASE` + `buildQuery()` で組み立てる(手書きクエリ文字列禁止)
- [ ] レスポンス型は `ApiResponse<T>` / `PaginatedResponse<T>` を使う(封筒の再宣言禁止)
- [ ] Notion の生プロパティ名は `*.db.ts`(API 側)以外に書かない
- [ ] Skeleton は本体コンポーネントの隣に置く
- [ ] 定数は「そのドメイン専用 → features 内 / アプリ横断 → src/constants / アプリ間共通 → @repo/types」
