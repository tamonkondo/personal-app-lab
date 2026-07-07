/**
 * Notion の filter_properties 用キー配列を定義する helper。
 *
 * 使い方:
 * const exerciseProperties = notionDefineProperties<NotionExerciseProperties>()([
 *   "name",
 *   "musclesTypes",
 * ]);
 *
 * type ExercisePropertyKeys = NotionKeysOfProperties<typeof exerciseProperties>;
 * type ExercisePage = NotionExercisePage<ExercisePropertyKeys>;
 *
 * Notion SDK の filter_properties は mutable string[] を要求するため、
 * 渡すときは filter_properties: [...exerciseProperties] のように展開する。
 */
export const notionDefineProperties =
  <Properties>() =>
  <const Keys extends readonly (keyof Properties)[]>(keys: Keys) =>
    keys;

export type NotionKeysOfProperties<T extends readonly unknown[]> = T[number];
