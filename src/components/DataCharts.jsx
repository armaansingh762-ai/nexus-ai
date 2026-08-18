import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { motion } from "framer-motion";

import {
  Sparkles,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react";

import {
  determineChart,
  buildChartData,
} from "../chartEngine";

function DataCharts({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  // ==========================================
  // NEXUS CHART ENGINE
  // ==========================================

  const configuration = determineChart(data);

  const chartData = buildChartData(
    data,
    configuration
  );

  if (
    !configuration.type ||
    chartData.length === 0
  ) {
    return null;
  }

  // ==========================================
  // CHART TITLE
  // ==========================================

  const getChartTitle = () => {
    if (configuration.type === "line") {
      return `${configuration.metric} over time`;
    }

    if (configuration.type === "scatter") {
      return `${configuration.dimension} vs ${configuration.metric}`;
    }

    if (configuration.metric) {
      return `${configuration.metric} by ${configuration.dimension}`;
    }

    return `Distribution of ${configuration.dimension}`;
  };

  // ==========================================
  // CHART TYPE
  // ==========================================

  const getChartTypeLabel = () => {
    if (configuration.type === "bar") {
      return "BAR DISTRIBUTION";
    }

    if (configuration.type === "line") {
      return "TIME SERIES";
    }

    if (configuration.type === "scatter") {
      return "CORRELATION";
    }

    return "VISUAL ANALYSIS";
  };

  // ==========================================
  // CHART ICON
  // ==========================================

  const getChartIcon = () => {
    if (configuration.type === "line") {
      return <Activity size={17} />;
    }

    if (configuration.type === "scatter") {
      return <TrendingUp size={17} />;
    }

    return <BarChart3 size={17} />;
  };

  // ==========================================
  // AI INTERPRETATION
  // ==========================================

  const getChartInsight = () => {
    // BAR
    if (
      configuration.type === "bar" &&
      chartData.length > 0
    ) {
      const sortedData = [...chartData].sort(
        (a, b) => b.value - a.value
      );

      const highest = sortedData[0];

      const lowest =
        sortedData[sortedData.length - 1];

      const total = chartData.reduce(
        (sum, item) =>
          sum + Number(item.value || 0),
        0
      );

      const highestShare =
        total > 0
          ? (highest.value / total) * 100
          : 0;

      if (configuration.metric) {
  if (configuration.aggregation === "average") {
    return `${highest.name} has the highest average ${configuration.metric.toLowerCase()} at ${Number(
      highest.value
    ).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}. ${lowest.name} records the lowest average value, creating a potentially meaningful difference between segments.`;
  }

  if (configuration.aggregation === "sum") {
    return `${highest.name} generated the highest total ${configuration.metric.toLowerCase()}, contributing approximately ${highestShare.toFixed(
      1
    )}% of the displayed total. ${lowest.name} recorded the lowest total, making the difference between segments worth investigating.`;
  }

  return `${highest.name} has the highest number of records in the displayed segments, while ${lowest.name} has the lowest representation.`;
}

      return `${highest.name} is the most represented segment in the dataset, with ${Number(
        highest.value
      ).toLocaleString()} records. ${lowest.name} has the smallest representation among the displayed categories.`;
    }

    // LINE
    if (
      configuration.type === "line" &&
      chartData.length > 1
    ) {
      const first = chartData[0];

      const last =
        chartData[chartData.length - 1];

      const values = chartData.map(
        (item) =>
          Number(item.value || 0)
      );

      const highestValue = Math.max(
        ...values
      );

      const highestPoint =
        chartData.find(
          (item) =>
            Number(item.value || 0) ===
            highestValue
        );

      const change =
        first.value !== 0
          ? ((last.value - first.value) /
              Math.abs(first.value)) *
            100
          : 0;

      const direction =
        change > 5
          ? "increased"
          : change < -5
          ? "decreased"
          : "remained relatively stable";

      return `${configuration.metric} ${direction} across the observed period. The highest recorded value was ${highestValue.toLocaleString()} around ${highestPoint?.name}. NEXUS recommends investigating the periods where the largest changes occurred.`;
    }

    // SCATTER
    if (
      configuration.type === "scatter" &&
      chartData.length > 1
    ) {
      const xValues = chartData.map(
        (item) =>
          Number(item.x || 0)
      );

      const yValues = chartData.map(
        (item) =>
          Number(item.y || 0)
      );

      const xAverage =
        xValues.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / xValues.length;

      const yAverage =
        yValues.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / yValues.length;

      let aboveAverage = 0;

      chartData.forEach((item) => {
        if (
          Number(item.x || 0) >
            xAverage &&
          Number(item.y || 0) >
            yAverage
        ) {
          aboveAverage++;
        }
      });

      const percentage =
        (aboveAverage /
          chartData.length) *
        100;

      return `${percentage.toFixed(
        1
      )}% of observed records are above average on both ${configuration.dimension} and ${configuration.metric}. This relationship may indicate a useful business segment worth investigating further.`;
    }

    return "NEXUS identified a meaningful structure in the dataset that can be explored further.";
  };

  // ==========================================
  // TOOLTIP
  // ==========================================

  const tooltipStyle = {
    background:
      "rgba(14, 12, 24, 0.97)",
    border:
      "1px solid rgba(139, 92, 246, 0.35)",
    borderRadius: "14px",
    color: "#ffffff",
    padding: "12px 14px",
    boxShadow:
      "0 20px 50px rgba(0, 0, 0, 0.35)",
  };

  // ==========================================
  // CHART RENDERER
  // ==========================================

  const renderChart = () => {
    // BAR
    if (configuration.type === "bar") {
      return (
        <ResponsiveContainer
          width="100%"
          height={480}
        >
          <BarChart
            data={chartData}
            margin={{
              top: 25,
              right: 30,
              left: 12,
              bottom: 35,
            }}
          >
            <CartesianGrid
              strokeDasharray="4 7"
              stroke="rgba(255,255,255,0.065)"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              tick={{
                fill:
                  "rgba(255,255,255,0.48)",
                fontSize: 13,
              }}
              axisLine={{
                stroke:
                  "rgba(255,255,255,0.10)",
              }}
              tickLine={false}
              interval={0}
              angle={
                chartData.length > 5
                  ? -18
                  : 0
              }
              textAnchor={
                chartData.length > 5
                  ? "end"
                  : "middle"
              }
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fill:
                  "rgba(255,255,255,0.42)",
                fontSize: 13,
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={
                tooltipStyle
              }
              cursor={{
                fill:
                  "rgba(139, 92, 246, 0.055)",
              }}
            />

            <Bar
              dataKey="value"
              radius={[
                10,
                10,
                3,
                3,
              ]}
              animationDuration={1100}
              animationBegin={150}
              fill="#8B5CF6"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // LINE
    if (configuration.type === "line") {
      return (
        <ResponsiveContainer
          width="100%"
          height={480}
        >
          <LineChart
            data={chartData}
            margin={{
              top: 25,
              right: 30,
              left: 12,
              bottom: 25,
            }}
          >
            <CartesianGrid
              strokeDasharray="4 7"
              stroke="rgba(255,255,255,0.065)"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              tick={{
                fill:
                  "rgba(255,255,255,0.48)",
                fontSize: 13,
              }}
              axisLine={{
                stroke:
                  "rgba(255,255,255,0.10)",
              }}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill:
                  "rgba(255,255,255,0.42)",
                fontSize: 13,
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={
                tooltipStyle
              }
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#9B6CFF"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                fill: "#A77BFF",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // SCATTER
    if (
      configuration.type ===
      "scatter"
    ) {
      return (
        <ResponsiveContainer
          width="100%"
          height={480}
        >
          <ScatterChart
            margin={{
              top: 25,
              right: 30,
              left: 12,
              bottom: 25,
            }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.065)"
              strokeDasharray="4 7"
            />

            <XAxis
              type="number"
              dataKey="x"
              name={
                configuration.dimension
              }
              tick={{
                fill:
                  "rgba(255,255,255,0.48)",
                fontSize: 13,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              type="number"
              dataKey="y"
              name={
                configuration.metric
              }
              tick={{
                fill:
                  "rgba(255,255,255,0.42)",
                fontSize: 13,
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{
                strokeDasharray:
                  "4 7",
                stroke:
                  "rgba(139, 92, 246, 0.45)",
              }}
              contentStyle={
                tooltipStyle
              }
            />

            <Scatter
              data={chartData}
              fill="#9B6CFF"
              animationDuration={1000}
            />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <motion.section
      className="charts-section premium-analytics-section"
      initial={{
        opacity: 0,
        y: 45,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="charts-header premium-charts-header">
        <div className="charts-heading-block">

          <div className="analytics-eyebrow">
            <span className="eyebrow-line" />

            <span>
              VISUAL ANALYTICS
            </span>
          </div>

          <h2>
            Patterns in your data.
          </h2>

          <p>
            NEXUS automatically selected the
            most relevant visualization based
            on the structure of your dataset.
          </p>

        </div>

        <motion.div
          className="ai-selection-badge"
          initial={{
            opacity: 0,
            y: 8,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
            delay: 0.15,
          }}
        >
          <Sparkles size={15} />

          <span>
            AI SELECTED
          </span>
        </motion.div>
      </div>

      {/* =====================================
          CHART CARD
      ===================================== */}

      <motion.div
        className="chart-card premium-chart-card"
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.12,
        }}
        transition={{
          duration: 0.65,
          delay: 0.08,
          ease: [0.22, 1, 0.36, 1],
        }}
      >

        <div className="chart-card-glow" />

        {/* CARD HEADER */}

        <div className="premium-chart-top">

          <div className="chart-title-area">

            <div className="chart-icon-box">
              {getChartIcon()}
            </div>

            <div>
             <span className="chart-label">
  {configuration.aggregation === "average"
    ? "AVERAGE BUSINESS METRIC"
    : configuration.aggregation === "sum"
    ? "TOTAL BUSINESS METRIC"
    : configuration.aggregation === "count"
    ? "RECORD DISTRIBUTION"
    : configuration.type === "scatter"
    ? "RELATIONSHIP ANALYSIS"
    : "VISUAL ANALYSIS"}
</span>

              <h3>
                {getChartTitle()}
              </h3>
            </div>

          </div>

          <div className="chart-type-pill">

            <span className="chart-type-icon">
              {getChartIcon()}
            </span>

            <span>
              {getChartTypeLabel()}
            </span>

          </div>

        </div>

        {/* CHART */}

        <div className="premium-chart-stage">

          <div className="chart-stage-label">

            <span>
              NEXUS VISUALIZATION
            </span>

            <span className="live-indicator">
              <span />
              LIVE
            </span>

          </div>

          <div className="chart-container premium-chart-container">
            {renderChart()}
          </div>

        </div>

        {/* WHY */}

        <div className="chart-explanation premium-explanation">

          <div className="explanation-icon">
            <Sparkles size={15} />
          </div>

          <div>

            <span className="section-eyebrow">
              WHY THIS CHART?
            </span>

            <p>
              {configuration.reason}
            </p>

          </div>

        </div>

        {/* INSIGHT */}

        <motion.div
          className="chart-insight premium-chart-insight"
          initial={{
            opacity: 0,
            y: 12,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.55,
            delay: 0.15,
          }}
        >

          <div className="insight-heading">

            <div className="insight-icon">
              <Sparkles size={16} />
            </div>

            <div>

              <span className="section-eyebrow">
                WHAT NEXUS FOUND
              </span>

              <strong>
                AI-generated interpretation
              </strong>

            </div>

          </div>

          <p>
            {getChartInsight()}
          </p>

        </motion.div>

      </motion.div>
    </motion.section>
  );
}

export default DataCharts;