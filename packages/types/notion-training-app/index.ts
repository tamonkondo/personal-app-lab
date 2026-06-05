/**
 *  共通のAPIを定義する。
 * APIの出入口
 * 
*/

// トレーニングの登録
// トレーニングデータの取得
// 

// 最新のトレーニングログを取得するAPI
export interface NewestTrainingLog {
  id: string;
    createdTime: string;
    bodyWeight: number;
    memo: string;
    trainingExercisesRelation: string[];
}