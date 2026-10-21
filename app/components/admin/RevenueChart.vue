<script setup lang="ts">
/**
 * Daily revenue columns (single series, brand gold). Inline SVG: thin
 * columns with rounded data-ends, hairline grid, per-column hover tooltip
 * and a hidden table for screen readers.
 */
const props = withDefaults(
  defineProps<{ data: { day: string; orders: number; revenue: number }[]; days?: number }>(),
  { days: 14 },
);

const { price, number } = useLocalized();

const WIDTH = 640;
const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 26, left: 44 };
const BAR_MAX = 24;

/** Fill missing days so the axis is continuous. */
const series = computed(() => {
  const byDay = new Map(props.data.map((d) => [d.day.slice(0, 10), d]));
  const out: { day: string; orders: number; revenue: number }[] = [];
  const today = new Date();
  for (let i = props.days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const hit = byDay.get(key);
    out.push({ day: key, orders: Number(hit?.orders ?? 0), revenue: Number(hit?.revenue ?? 0) });
  }
  return out;
});

/** Clean round axis maximum (1, 2, 2.5, 5 × 10^n). */
const yMax = computed(() => {
  const max = Math.max(...series.value.map((d) => d.revenue), 0);
  if (max <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= max) ?? 10;
  return step * magnitude;
});
const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map((r) => r * yMax.value));

const plotW = WIDTH - PAD.left - PAD.right;
const plotH = HEIGHT - PAD.top - PAD.bottom;
const band = computed(() => plotW / series.value.length);
const barW = computed(() => Math.min(BAR_MAX, band.value - 2));
const y = (value: number) => PAD.top + plotH - (value / yMax.value) * plotH;

const compact = (value: number) =>
  value >= 1_000_000 ? `${+(value / 1_000_000).toFixed(1)}M` : value >= 1000 ? `${+(value / 1000).toFixed(1)}K` : String(value);

/** Column path: square at the baseline, 4px rounded data-end. */
function columnPath(x: number, value: number): string {
  const top = y(value);
  const bottom = PAD.top + plotH;
  const h = bottom - top;
  if (h <= 0) return '';
  const r = Math.min(4, h, barW.value / 2);
  const w = barW.value;
  return `M${x},${bottom}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${bottom}Z`;
}

/** Every few days plus the last day, never two labels side by side. */
function showTick(index: number): boolean {
  const step = Math.ceil(series.value.length / 7);
  const last = series.value.length - 1;
  return index === last || (index % step === 0 && last - index >= step);
}

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' });
const hovered = ref<number | null>(null);
const total = computed(() => series.value.reduce((sum, d) => sum + d.revenue, 0));
</script>

<template>
  <figure class="chart">
    <figcaption class="chart__head">
      <div>
        <h2 class="chart__title">الإيرادات اليومية</h2>
        <p class="chart__sub">آخر {{ days }} يوماً · بدون الطلبات الملغاة</p>
      </div>
      <p class="chart__total">{{ price(total) }}</p>
    </figcaption>

    <div class="chart__plot" dir="ltr">
      <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" role="img" aria-label="رسم بياني للإيرادات اليومية" @mouseleave="hovered = null">
        <g class="chart__grid">
          <template v-for="tick in ticks" :key="tick">
            <line :x1="PAD.left" :x2="WIDTH - PAD.right" :y1="y(tick)" :y2="y(tick)" />
            <text :x="PAD.left - 8" :y="y(tick) + 4" text-anchor="end">{{ compact(tick) }}</text>
          </template>
        </g>

        <g v-for="(point, index) in series" :key="point.day">
          <path
            class="chart__bar"
            :class="{ 'is-dim': hovered !== null && hovered !== index }"
            :d="columnPath(PAD.left + index * band + (band - barW) / 2, point.revenue)"
          />
          <!-- Hit target: the whole band, taller than the mark. -->
          <rect
            class="chart__hit"
            :x="PAD.left + index * band"
            :y="PAD.top"
            :width="band"
            :height="plotH"
            @mouseenter="hovered = index"
          />
          <text
            v-if="showTick(index)"
            class="chart__x"
            :x="PAD.left + index * band + band / 2"
            :y="HEIGHT - 6"
            text-anchor="middle"
          >
            {{ dayLabel(point.day) }}
          </text>
        </g>
      </svg>

      <div
        v-if="hovered !== null && series[hovered]"
        class="chart__tooltip"
        :style="{ insetInlineStart: `${((PAD.left + hovered * band + band / 2) / WIDTH) * 100}%` }"
      >
        <strong>{{ dayLabel(series[hovered]!.day) }}</strong>
        <span>{{ price(series[hovered]!.revenue) }}</span>
        <span class="chart__muted">{{ number(series[hovered]!.orders) }} طلب</span>
      </div>
    </div>

    <table class="visually-hidden">
      <caption>الإيرادات اليومية</caption>
      <thead><tr><th>اليوم</th><th>الطلبات</th><th>الإيرادات</th></tr></thead>
      <tbody>
        <tr v-for="point in series" :key="point.day">
          <td>{{ point.day }}</td><td>{{ point.orders }}</td><td>{{ point.revenue }}</td>
        </tr>
      </tbody>
    </table>
  </figure>
</template>

<style scoped>
.chart {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.chart__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}
.chart__title {
  font-size: var(--text-lg);
}
.chart__sub,
.chart__muted {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
.chart__total {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
}
.chart__plot {
  position: relative;
}
.chart__plot svg {
  display: block;
  inline-size: 100%;
  block-size: auto;
  overflow: visible;
}
.chart__grid line {
  stroke: var(--color-border);
  stroke-width: 1;
}
.chart__grid text,
.chart__x {
  fill: var(--color-text-subtle);
  font-size: 11px;
}
.chart__bar {
  fill: var(--gold-600);
  transition: opacity var(--duration-fast) ease;
}
.chart__bar.is-dim {
  opacity: 0.35;
}
.chart__hit {
  fill: transparent;
  cursor: default;
}
.chart__tooltip {
  position: absolute;
  inset-block-start: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  font-size: var(--text-xs);
  white-space: nowrap;
  transform: translateX(-50%);
  pointer-events: none;
}
</style>
