import { useMemo, useState } from "react";
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

function AnalyticsExplorer({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  // ==========================================
  // DETECT COLUMNS
  // ==========================================

  const columns = Object.keys(data[0] || {});

  const getValues = (column) =>
    data
      .map((row) => row[column])
      .filter(
        (value) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      );

  const isNumeric = (column) => {
    const values = getValues(column);

    if (values.length === 0) return false;

    const numericCount = values.filter(
      (value) =>
        typeof value === "number" ||
        (!isNaN(Number(value)) &&
          String(value).trim() !== "")
    ).length;

    return numericCount / values.length >= 0.8;
  };

  const numericColumns = columns.filter(isNumeric);

  const categoricalColumns = columns.filter(
    (column) => {
      if (isNumeric(column)) return false;

      const values = getValues(column);

      const uniqueValues =
        new Set(values).size;

      return (
        uniqueValues >= 2 &&
        uniqueValues <= 30
      );
    }
  );

  // ==========================================
  // DEFAULTS
  // ==========================================

  const [dimension, setDimension] =
    useState(
      categoricalColumns[0] ||
        columns[0] ||
        ""
    );

  const [metric, setMetric] =
    useState(
      numericColumns[0] || ""
    );

  const [chartType, setChartType] =
    useState("bar");

  // ==========================================
  // BUILD CHART DATA
  // ==========================================

  const chartData = useMemo(() => {
    if (!dimension) return [];

    // ----------------------------------------
    // BAR
    // ----------------------------------------

    if (chartType === "bar") {
      const groups = {};

      data.forEach((row) => {
        const category =
          row[dimension];

        if (
          category === undefined ||
          category === null ||
          category === ""
        ) {
          return;
        }

        if (!groups[category]) {
          groups[category] = 0;
        }

        if (metric) {
          const value =
            Number(row[metric]);

          if (!isNaN(value)) {
            groups[category] += value;
          }
        } else {
          groups[category] += 1;
        }
      });

      return Object.entries(groups)
        .map(([name, value]) => ({
          name,
          value,
        }))
        .sort(
          (a, b) =>
            b.value - a.value
        )
        .slice(0, 12);
    }

    // ----------------------------------------
    // LINE
    // ----------------------------------------

    if (chartType === "line") {
      const groups = {};

      data.forEach((row) => {
        const category =
          row[dimension];

        const value = metric
          ? Number(row[metric])
          : 1;

        if (
          category === undefined ||
          category === null ||
          category === "" ||
          isNaN(value)
        ) {
          return;
        }

        if (!groups[category]) {
          groups[category] = 0;
        }

        groups[category] += value;
      });

      return Object.entries(groups)
        .map(([name, value]) => ({
          name,
          value,
        }))
        .slice(0, 30);
    }

    // ----------------------------------------
    // SCATTER
    // ----------------------------------------

    if (
      chartType === "scatter" &&
      numericColumns.length >= 2
    ) {
      return data
        .map((row) => ({
          x: Number(row[dimension]),
          y: Number(row[metric]),
        }))
        .filter(
          (row) =>
            !isNaN(row.x) &&
            !isNaN(row.y)
        )
        .slice(0, 500);
    }

    return [];
  }, [
    data,
    dimension,
    metric,
    chartType,
  ]);

  // ==========================================
  // TITLE
  // ==========================================

  const chartTitle = metric
    ? `${metric} by ${dimension}`
    : `Distribution of ${dimension}`;

  // ==========================================
  // RENDER CHART
  // ==========================================

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="explorer-empty">
          No compatible data found for
          this configuration.
        </div>
      );
    }

    // ----------------------------------------
    // BAR
    // ----------------------------------------

    if (chartType === "bar") {
      return (
        <ResponsiveContainer
          width="100%"
          height={400}
        >
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 0,
              bottom: 30,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.12}
            />

            <XAxis
              dataKey="name"
              tick={{
                fontSize: 12,
              }}
              interval={0}
              angle={
                chartData.length > 6
                  ? -20
                  : 0
              }
              textAnchor={
                chartData.length > 6
                  ? "end"
                  : "middle"
              }
            />

            <YAxis
              tick={{
                fontSize: 12,
              }}
            />

            <Tooltip
              contentStyle={{
                background:
                  "#11101A",
                border:
                  "1px solid rgba(139, 92, 246, 0.35)",
                borderRadius: "12px",
                color: "#ffffff",
              }}
            />

            <Bar
              dataKey="value"
              fill="#8B5CF6"
              radius={[
                10,
                10,
                0,
                0,
              ]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // ----------------------------------------
    // LINE
    // ----------------------------------------

    if (chartType === "line") {
      return (
        <ResponsiveContainer
          width="100%"
          height={400}
        >
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.12}
            />

            <XAxis
              dataKey="name"
              tick={{
                fontSize: 12,
              }}
            />

            <YAxis
              tick={{
                fontSize: 12,
              }}
            />

            <Tooltip
              contentStyle={{
                background:
                  "#11101A",
                border:
                  "1px solid rgba(139, 92, 246, 0.35)",
                borderRadius: "12px",
                color: "#ffffff",
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={false}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // ----------------------------------------
    // SCATTER
    // ----------------------------------------

    if (
      chartType === "scatter" &&
      isNumeric(dimension) &&
      metric
    ) {
      return (
        <ResponsiveContainer
          width="100%"
          height={400}
        >
          <ScatterChart
            margin={{
              top: 20,
              right: 20,
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid
              opacity={0.12}
            />

            <XAxis
              type="number"
              dataKey="x"
              name={dimension}
            />

            <YAxis
              type="number"
              dataKey="y"
              name={metric}
            />

            <Tooltip
              contentStyle={{
                background:
                  "#11101A",
                border:
                  "1px solid rgba(139, 92, 246, 0.35)",
                borderRadius: "12px",
                color: "#ffffff",
              }}
            />

            <Scatter
              data={chartData}
              fill="#8B5CF6"
              animationDuration={1000}
            />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    return (
      <div className="explorer-empty">
        Scatter charts require two
        numeric variables.
      </div>
    );
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <motion.section
      className="explorer-section"
      initial={{
        opacity: 0,
        y: 50,
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
        duration: 0.7,
      }}
    >
      <div className="explorer-header">
        <div>
          <span className="section-eyebrow">
            INTERACTIVE ANALYTICS
          </span>

          <h2>
            Explore your data.
          </h2>

          <p>
            Build your own analysis by
            selecting the dimensions,
            metrics, and visualization
            style.
          </p>
        </div>
      </div>

      <div className="explorer-card">

        {/* CONTROLS */}

        <div className="explorer-controls">

          <div className="explorer-control">
            <label>
              DIMENSION
            </label>

            <select
              value={dimension}
              onChange={(event) =>
                setDimension(
                  event.target.value
                )
              }
            >
              {columns.map((column) => (
                <option
                  key={column}
                  value={column}
                >
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div className="explorer-control">
            <label>
              METRIC
            </label>

            <select
              value={metric}
              onChange={(event) =>
                setMetric(
                  event.target.value
                )
              }
            >
              <option value="">
                Record count
              </option>

              {numericColumns.map(
                (column) => (
                  <option
                    key={column}
                    value={column}
                  >
                    {column}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="explorer-control">
            <label>
              VISUALIZATION
            </label>

            <select
              value={chartType}
              onChange={(event) =>
                setChartType(
                  event.target.value
                )
              }
            >
              <option value="bar">
                Bar chart
              </option>

              <option value="line">
                Line chart
              </option>

              {numericColumns.length >=
                2 && (
                <option value="scatter">
                  Scatter plot
                </option>
              )}
            </select>
          </div>

        </div>

        {/* CHART HEADER */}

        <div className="explorer-chart-header">
          <div>
            <span className="chart-label">
              CUSTOM ANALYSIS
            </span>

            <h3>
              {chartTitle}
            </h3>
          </div>

          <motion.span
            className="chart-badge"
            key={chartType}
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
          >
            {chartType.toUpperCase()}
          </motion.span>
        </div>

        {/* CHART */}

        <div className="explorer-chart">
          {renderChart()}
        </div>

      </div>
    </motion.section>
  );
}

export default AnalyticsExplorer;