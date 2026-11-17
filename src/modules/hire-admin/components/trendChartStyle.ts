export interface TrendPoint {
  date: string;
  count: number;
}

/** Every number the chart takes in design pixels; the chart multiplies them by the page's scale unit. */
export interface TrendChartStyle {
  color: string;
  tick: number;
  yAxisWidth: number;
  /** Gap between the y labels and the plot; the library's own gap when left out. */
  yTickMargin?: number;
  xTickMargin: number;
  margin: { top: number; right: number; left: number; bottom: number };
  line: number;
  dot: number;
  fillTop: number;
  fillBottom: number;
  /** The value badge scales with its font size; 11 is the size its other measures are drawn for. */
  badgeFont: number;
  /** The badge sits centred over the last point, or is right-aligned just past it. */
  badgeCentered: boolean;
  /** The y axis is drawn up to the largest value times this, so the line can stop short of the top. */
  axisHeadroom: number;
  /**
   * A fixed y axis: exactly this domain, with a label at min, min + step, ... max. When left out
   * the axis is rounded up from the largest value (see niceAxis).
   */
  axisRange?: { min: number; max: number; step: number };
}

export const DEFAULT_TREND_STYLE: TrendChartStyle = {
  color: '#F45116',
  tick: 11,
  yAxisWidth: 36,
  xTickMargin: 4,
  margin: { top: 26, right: 24, left: -8, bottom: 0 },
  line: 2,
  dot: 4.5,
  fillTop: 0.22,
  fillBottom: 0.02,
  badgeFont: 11,
  badgeCentered: false,
  axisHeadroom: 1
};
