import { useMemo, useRef, useState } from "react";
import type { ExerciseTrendPoint } from "@repo/types/notion-training-app";

/**
 * 種目の重量トレンド折れ線チャート (単一系列 + 目標の参照線)。
 * 依存ライブラリなしの SVG 実装。ホバーで最近傍の点をツールチップ表示する。
 */

const VIEW_W = 280;
const VIEW_H = 170;
const MARGIN = { top: 14, right: 10, bottom: 22, left: 34 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

/** 系列色 (単一系列。dataviz パレット検証済み) */
const SERIES_COLOR = "#2a78d6";

const formatShortDate = (iso: string) => {
  const date = new Date(iso);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/** ラベルが読みやすい丸め幅で y 軸の目盛りを作る */
const buildTicks = (min: number, max: number): number[] => {
  if (max <= min) return [min];
  const rawStep = (max - min) / 3;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step =
    [1, 2, 2.5, 5, 10]
      .map((unit) => unit * magnitude)
      .find((candidate) => candidate >= rawStep) ?? rawStep;
  const ticks: number[] = [];
  for (
    let tick = Math.ceil(min / step) * step;
    tick <= max + 1e-9;
    tick += step
  ) {
    ticks.push(Number(tick.toFixed(2)));
  }
  return ticks;
};

interface Props {
  points: ExerciseTrendPoint[];
  /** 目標重量 (0 以下なら参照線を描かない) */
  goalWeight: number;
}

const ExerciseTrendChart = ({ points, goalWeight }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const layout = useMemo(() => {
    if (points.length === 0) return null;

    const weights = points.map((point) => point.maxWeight);
    const yValues = goalWeight > 0 ? [...weights, goalWeight] : weights;
    const rawMin = Math.min(...yValues);
    const rawMax = Math.max(...yValues);
    const padding = Math.max((rawMax - rawMin) * 0.15, 2.5);
    const yMin = Math.max(rawMin - padding, 0);
    const yMax = rawMax + padding;

    const times = points.map((point) => new Date(point.date).getTime());
    const tMin = Math.min(...times);
    const tMax = Math.max(...times);
    const tSpan = tMax - tMin || 1;

    const x = (time: number) =>
      MARGIN.left + ((time - tMin) / tSpan) * PLOT_W;
    const y = (weight: number) =>
      MARGIN.top + PLOT_H - ((weight - yMin) / (yMax - yMin)) * PLOT_H;

    const coords = points.map((point, index) => ({
      x: points.length === 1 ? MARGIN.left + PLOT_W / 2 : x(times[index]!),
      y: y(point.maxWeight),
      point,
    }));

    return { coords, y, ticks: buildTicks(yMin, yMax), yMin, yMax };
  }, [points, goalWeight]);

  if (!layout) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed bg-zinc-50 text-sm text-zinc-500">
        期間内の記録がありません
      </div>
    );
  }

  const { coords, y, ticks } = layout;
  const linePath = coords
    .map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x},${coord.y}`)
    .join(" ");
  const lastCoord = coords[coords.length - 1]!;
  const hovered = hoverIndex !== null ? coords[hoverIndex] : null;

  /** マウス位置 → 最近傍の点の index */
  const handleMove = (event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewX = ((event.clientX - rect.left) / rect.width) * VIEW_W;
    let nearest = 0;
    let nearestDistance = Infinity;
    coords.forEach((coord, index) => {
      const distance = Math.abs(coord.x - viewX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });
    setHoverIndex(nearest);
  };

  return (
    <div ref={containerRef} className="relative">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label="重量推移チャート"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* グリッド (控えめ) + y 軸ラベル */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={MARGIN.left}
              x2={VIEW_W - MARGIN.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#f4f4f5"
              strokeWidth={1}
            />
            <text
              x={MARGIN.left - 5}
              y={y(tick) + 3}
              textAnchor="end"
              fontSize={9}
              fill="#71717a"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* 目標重量の参照線 */}
        {goalWeight > 0 && (
          <g>
            <line
              x1={MARGIN.left}
              x2={VIEW_W - MARGIN.right}
              y1={y(goalWeight)}
              y2={y(goalWeight)}
              stroke="#a1a1aa"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <text
              x={VIEW_W - MARGIN.right}
              y={y(goalWeight) - 4}
              textAnchor="end"
              fontSize={9}
              fill="#52525b"
            >
              目標 {goalWeight}kg
            </text>
          </g>
        )}

        {/* ホバー時のクロスヘア */}
        {hovered && (
          <line
            x1={hovered.x}
            x2={hovered.x}
            y1={MARGIN.top}
            y2={MARGIN.top + PLOT_H}
            stroke="#d4d4d8"
            strokeWidth={1}
          />
        )}

        {/* 系列 (2px 線 + 点) */}
        {coords.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke={SERIES_COLOR}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {coords.map((coord, index) => (
          <circle
            key={coord.point.exerciseLogId}
            cx={coord.x}
            cy={coord.y}
            r={hoverIndex === index ? 4.5 : 2.5}
            fill={SERIES_COLOR}
            stroke="#ffffff"
            strokeWidth={hoverIndex === index ? 2 : 1}
          />
        ))}

        {/* 直近値の直接ラベル (テキストはテキスト色で) */}
        <text
          x={Math.min(lastCoord.x, VIEW_W - MARGIN.right - 2)}
          y={Math.max(lastCoord.y - 8, 10)}
          textAnchor="end"
          fontSize={10}
          fontWeight={600}
          fill="#3f3f46"
        >
          {lastCoord.point.maxWeight}kg
        </text>

        {/* x 軸ラベル (最初と最後の日付) */}
        <text
          x={MARGIN.left}
          y={VIEW_H - 6}
          fontSize={9}
          fill="#71717a"
        >
          {formatShortDate(coords[0]!.point.date)}
        </text>
        {coords.length > 1 && (
          <text
            x={VIEW_W - MARGIN.right}
            y={VIEW_H - 6}
            textAnchor="end"
            fontSize={9}
            fill="#71717a"
          >
            {formatShortDate(lastCoord.point.date)}
          </text>
        )}
      </svg>

      {/* ツールチップ */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border bg-white px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: `${(hovered.x / VIEW_W) * 100}%`,
            top: 0,
          }}
        >
          <p className="font-semibold text-zinc-700">
            {formatShortDate(hovered.point.date)}
          </p>
          <p className="text-zinc-600">Max {hovered.point.maxWeight}kg</p>
          <p className="text-zinc-500">
            {hovered.point.setsCount}set / {hovered.point.totalVolume}kg
          </p>
        </div>
      )}

      {/* スクリーンリーダー向けのデータテーブル */}
      <table className="sr-only">
        <caption>重量推移</caption>
        <thead>
          <tr>
            <th>日付</th>
            <th>最大重量</th>
            <th>セット数</th>
            <th>総ボリューム</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.exerciseLogId}>
              <td>{formatShortDate(point.date)}</td>
              <td>{point.maxWeight}kg</td>
              <td>{point.setsCount}</td>
              <td>{point.totalVolume}kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExerciseTrendChart;
