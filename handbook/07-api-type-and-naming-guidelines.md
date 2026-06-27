# 07. API型定義と命名規約

> 対象: 開発者

## 目的

API、外部サービス、フロントエンドの型を明確に分離し、同じ名前が異なるデータ構造を指す状態を避ける。

この規約は、特に以下の境界を対象とする。

```txt
Notionなどの外部サービス
  ↓
API内部の取得・変換処理
  ↓
HTTPレスポンス
  ↓
フロントエンド
```

## 基本原則

```txt
外部サービスの生データ型
→ API内部だけで使用する

APIから返す型
→ packages/types に定義し、APIとフロントで共有する

画面表示専用の型
→ フロントエンド内に定義する
```

同じ項目を持っていても、役割が異なる型は統合しない。

## APIレスポンスの共通型

単体データやページネーションのないデータには `ApiResponse<T>` を使用する。

```ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
```

ページネーション可能な一覧には `PaginatedResponse<T>` を使用する。

```ts
export type PaginationMetaResponse = {
  has_more: boolean;
  next_cursor?: string;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: PaginationMetaResponse;
};
```

レスポンス形状は次の形式に統一する。

```ts
// 単体
{
  message: "getNewestTrainingLog",
  data: item
}

// ページネーション可能な一覧
{
  message: "getTrainingLogs",
  data: items,
  meta: {
    has_more: true,
    next_cursor: "..."
  }
}
```

### データが存在しない場合

- 単体取得: `data: null`
- 一覧取得: `data: []`
- `undefined` でデータの不在を表現しない

```ts
export type NewestTrainingLogResponse =
  ApiResponse<NewestTrainingLogItemResponse | null>;
```

## 共有レスポンス型の命名

APIからフロントへ渡す型には必ず `Response` 接尾辞を付ける。

### 最上位レスポンス

HTTPレスポンス全体は `〇〇Response` とする。

```ts
TrainingLogSummaryResponse;
ExerciseSummaryResponse;
NewestTrainingLogResponse;
```

### 一覧要素と入れ子要素

`data` 配列の要素やレスポンス内の構造体は `〇〇ItemResponse` とする。

```ts
TrainingLogSummaryItem;
TrainingLogExerciseItem;
ExerciseSummaryItemResponse;
ExerciseLogWithSetsItemResponse;
ExerciseSetBase;
```

最上位と要素に同じ名前を使用しない。

```ts
// Bad
type ExerciseSummary = {};
type ExerciseSummaryResponse = ExerciseSummary[];

// Good
type ExerciseSummaryItemResponse = {};
type ExerciseSummaryResponse = PaginatedResponse<ExerciseSummaryItemResponse>;
```

### 未実装APIの型

将来使用する可能性だけでは型を追加しない。

```txt
API実装時に追加する
使用されなくなったAPI契約は削除する
```

## 共有型の配置

アプリ単位のディレクトリ内を機能別ファイルに分割し、`index.ts` は再exportだけを行う。

```txt
packages/types/notion-training-app/
  index.ts
  exercise.ts
  exerciseLog.ts
  exerciseSet.ts
  trainingLog.ts
```

```ts
// index.ts
export * from "./exercise";
export * from "./exerciseLog";
export * from "./exerciseSet";
export * from "./trainingLog";
```

## 外部サービス型の命名

Notion SDKから取得した未変換データには `Notion` 接頭辞を付ける。

```ts
NotionExerciseProperties;
NotionExercisePage;
NotionExerciseQueryResult;
NotionExerciseLogProperties;
NotionExerciseLogPage;
NotionExerciseSetWeightPage;
```

接尾辞はデータの形に合わせる。

| 接尾辞        | 用途                        |
| ------------- | --------------------------- |
| `Properties`  | Notionページの `properties` |
| `Page`        | Notionの単一ページ          |
| `QueryResult` | Notionの一覧クエリ結果      |

外部サービス型に `Response` を付けない。`Response` はHTTPで公開する型のために予約する。

```ts
// Bad
type ExerciseResponse = NotionResults<Exercise>;

// Good
type NotionExerciseQueryResult = NotionResults<NotionExercisePage>;
```

## API内部処理の責務

### Notion取得関数

Notionアクセスを行う関数は `fetch〇〇` とする。

```ts
fetchTrainingLogs;
fetchNewestTrainingLog;
fetchExerciseSummaryLogs;
```

取得関数はHTTPの `message` を組み立てない。必要な `data` と `meta`、または単体データだけを返す。

```ts
type FetchTrainingLogsResult = Pick<
  TrainingLogSummaryResponse,
  "data" | "meta"
>;
```

取得関数固有の戻り値型は外部公開せず、同じファイル内に `Fetch〇〇Result` として定義する。

### Handler

HTTPレスポンス全体はhandlerで組み立てる。

```ts
const result = await fetchTrainingLogs(cursor, limit);

const response: TrainingLogSummaryResponse = {
  message: "getTrainingLogs",
  ...result,
};

res.status(200).json(response);
```

handler名はHTTP操作に合わせる。

```txt
GET    → get〇〇
POST   → create〇〇
PATCH  → update〇〇
DELETE → delete〇〇
```

## 変数名

変数名からデータの役割と単数・複数が判断できるようにする。

| 役割               | 推奨名                           |
| ------------------ | -------------------------------- |
| Notionのクエリ結果 | `trainingLogs`, `exercises`      |
| 単一データ         | `trainingLog`, `exerciseLog`     |
| 取得関数の戻り値   | `result` または内容を表す名前    |
| HTTPレスポンス全体 | `response`                       |
| 配列要素           | `trainingLog`, `exercise`, `set` |
| IDの配列           | `exerciseLogIds`, `relationIds`  |
| IDをキーにしたMap  | `exerciseLogById`                |

### 単数形と複数形

```ts
const exercise = exercises.results[0];
const exerciseLogIds = exercises.results.map(...);
```

配列に単数形、単体に複数形を使用しない。

### 曖昧な名前を避ける

```ts
// Bad
const data = await fetchTrainingLogs();
const resData = {};
const temp = [];

// Good
const trainingLogs = await fetchTrainingLogs();
const response: TrainingLogSummaryResponse = {
  message: "getTrainingLogs",
  data: [],
  meta: {
    has_more: false,
  },
};
const exerciseLogIds = [];
```

`data` と `meta` はHTTP契約上のプロパティ名としては使用してよい。ローカル変数では、内容を表す名前を優先する。

## 表記ルール

- TypeScriptの型、interface、class: `PascalCase`
- 変数、関数: `camelCase`
- 環境変数: `UPPER_SNAKE_CASE`
- HTTP契約の既存Notionページング項目: `has_more`, `next_cursor`
- JavaScript内部で新設する項目: 原則 `camelCase`
- 型だけのimport: `import type`

`has_more` と `next_cursor` は公開済みAPIとの互換性を維持するため、現状はsnake_caseを使用する。

## 共通化しない型

以下は `packages/types` に置かない。

- Notion、Prisma、SDKが返す生データ型
- API内部だけの中間データ型
- ReactコンポーネントのProps
- 画面表示専用のViewModel
- 特定関数内でしか使用しない型

```txt
packages/types
→ APIとフロントの境界を越える契約

apps/api
→ Notion型、DB型、取得処理の中間型

apps/*/src
→ Props、フォーム状態、ViewModel
```

## 追加・変更時のチェックリスト

1. この型はHTTP境界を越えるか
2. HTTP境界を越えるなら `Response` または `ItemResponse` か
3. 一覧でページネーション可能なら `PaginatedResponse<T>` か
4. 単体でデータが存在しない可能性を `null` で表現しているか
5. Notionの生データ型に `Notion` 接頭辞があるか
6. `fetch` 関数がHTTPレスポンス全体を組み立てていないか
7. handlerのレスポンスが共有型で型付けされているか
8. 配列と単体の変数名が複数形・単数形になっているか
9. 未実装機能の型を先回りして追加していないか
10. APIとフロントのtypecheck、buildが通るか
