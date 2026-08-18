import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";

function BusinessInsights({
  data,
  analysis,
  patterns = [],
}) {
  if (!data || data.length === 0) {
    return null;
  }

  // ==========================================
  // BASIC DATA
  // ==========================================

  const columns = Object.keys(data[0] || {});

  const numericColumns = columns.filter(
    (column) => {
      const values = data
        .map((row) => row[column])
        .filter(
          (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
        );

      if (values.length === 0) {
        return false;
      }

      const numericValues = values.filter(
        (value) =>
          typeof value === "number" ||
          (!isNaN(Number(value)) &&
            String(value).trim() !== "")
      );

      return (
        numericValues.length /
          values.length >=
        0.8
      );
    }
  );

  const categoricalColumns =
    columns.filter((column) => {
      const values = data
        .map((row) => row[column])
        .filter(
          (value) =>
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        );

      if (values.length === 0) {
        return false;
      }

      const uniqueValues =
        new Set(values).size;

      return (
        uniqueValues >= 2 &&
        uniqueValues <= 20
      );
    });

  // ==========================================
  // FIND BUSINESS METRIC
  // ==========================================

  const metricKeywords = [
    "revenue",
    "sales",
    "profit",
    "amount",
    "income",
    "value",
    "total",
    "price",
    "cost",
    "charge",
    "spend",
    "salary",
    "score",
  ];

  const metric =
    numericColumns.find((column) =>
      metricKeywords.some((keyword) =>
        column
          .toLowerCase()
          .includes(keyword)
      )
    ) ||
    numericColumns[0];

  // ==========================================
  // FIND BEST CATEGORY
  // ==========================================

  const category =
    categoricalColumns.find(
      (column) => {
        const uniqueValues =
          new Set(
            data.map(
              (row) => row[column]
            )
          ).size;

        return (
          uniqueValues >= 2 &&
          uniqueValues <= 8
        );
      }
    ) ||
    categoricalColumns[0];

  // ==========================================
  // HELPER
  // ==========================================

  const formatNumber = (value) => {
    if (value === undefined || value === null) {
      return "0";
    }

    return Number(value).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2,
      }
    );
  };

  const prettyName = (value) => {
    if (!value) {
      return "";
    }

    return String(value)
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .trim();
  };

  // ==========================================
  // GENERATE INSIGHTS
  // ==========================================

  const generatedInsights = [];

  // ==========================================
  // INSIGHT 1 — DATA SIGNAL
  // ==========================================

  if (patterns.length > 0) {
    const pattern = patterns[0];

    generatedInsights.push({
      type: "signal",
      label: "KEY SIGNAL",
      title:
        pattern.title ||
        "A meaningful pattern was detected.",
      description:
        pattern.description ||
        "NEXUS identified a relationship within the dataset that may have business relevance.",
      icon: Sparkles,
      className: "insight-purple",
    });
  }

  // ==========================================
  // INSIGHT 2 — CATEGORY PERFORMANCE
  // ==========================================

  if (metric && category) {
    const groups = {};

    data.forEach((row) => {
      const groupValue =
        row[category];

      const numericValue =
        Number(row[metric]);

      if (
        groupValue === undefined ||
        groupValue === null ||
        isNaN(numericValue)
      ) {
        return;
      }

      const key = String(groupValue);

      if (!groups[key]) {
        groups[key] = {
          total: 0,
          count: 0,
        };
      }

      groups[key].total +=
        numericValue;

      groups[key].count += 1;
    });

    const groupResults =
      Object.entries(groups)
        .map(
          ([name, values]) => ({
            name,
            average:
              values.total /
              values.count,
            total: values.total,
          })
        )
        .sort(
          (a, b) =>
            b.average -
            a.average
        );

    if (groupResults.length >= 2) {
      const highest =
        groupResults[0];

      const lowest =
        groupResults[
          groupResults.length - 1
        ];

      const difference =
        lowest.average !== 0
          ? ((highest.average -
              lowest.average) /
              Math.abs(
                lowest.average
              )) *
            100
          : 0;

      generatedInsights.push({
        type: "performance",
        label: "PERFORMANCE GAP",
        title: `${prettyName(
          highest.name
        )} leads ${prettyName(
          metric
        )}.`,
        description: `The ${prettyName(
          highest.name
        )} segment has the highest average ${prettyName(
          metric
        )}, approximately ${Math.abs(
          difference
        ).toFixed(
          1
        )}% above ${prettyName(
          lowest.name
        )}.`,
        icon: TrendingUp,
        className: "insight-green",
      });
    }
  }

  // ==========================================
  // INSIGHT 3 — DISTRIBUTION
  // ==========================================

  if (metric) {
    const values = data
      .map((row) =>
        Number(row[metric])
      )
      .filter(
        (value) => !isNaN(value)
      );

    if (values.length > 1) {
      const total = values.reduce(
        (sum, value) =>
          sum + value,
        0
      );

      const average =
        total / values.length;

      const aboveAverage =
        values.filter(
          (value) =>
            value > average
        ).length;

      const percentage =
        (aboveAverage /
          values.length) *
        100;

      generatedInsights.push({
        type: "distribution",
        label: "DATA DISTRIBUTION",
        title: `${percentage.toFixed(
          0
        )}% of records sit above average.`,
        description: `Across ${values.length.toLocaleString()} valid records, the average ${prettyName(
          metric
        )} is ${formatNumber(
          average
        )}. NEXUS found ${aboveAverage.toLocaleString()} records above that level.`,
        icon:
          percentage >= 50
            ? TrendingUp
            : TrendingDown,
        className:
          percentage >= 50
            ? "insight-green"
            : "insight-orange",
      });
    }
  }

  // ==========================================
  // INSIGHT 4 — OPPORTUNITY
  // ==========================================

  if (
    metric &&
    category &&
    generatedInsights.length < 5
  ) {
    const groups = {};

    data.forEach((row) => {
      const categoryValue =
        row[category];

      const value =
        Number(row[metric]);

      if (
        categoryValue === undefined ||
        categoryValue === null ||
        isNaN(value)
      ) {
        return;
      }

      const key =
        String(categoryValue);

      if (!groups[key]) {
        groups[key] = {
          total: 0,
          count: 0,
        };
      }

      groups[key].total += value;
      groups[key].count += 1;
    });

    const results =
      Object.entries(groups)
        .map(
          ([name, values]) => ({
            name,
            average:
              values.total /
              values.count,
          })
        )
        .sort(
          (a, b) =>
            a.average -
            b.average
        );

    if (results.length >= 2) {
      const opportunity =
        results[0];

      generatedInsights.push({
        type: "opportunity",
        label: "OPPORTUNITY",
        title: `${prettyName(
          opportunity.name
        )} may need attention.`,
        description: `This segment records the lowest average ${prettyName(
          metric
        )} among the detected categories. Investigating its drivers could reveal an improvement opportunity.`,
        icon: Target,
        className: "insight-orange",
      });
    }
  }

  // ==========================================
  // INSIGHT 5 — DATA QUALITY
  // ==========================================

  if (
    analysis &&
    generatedInsights.length < 5
  ) {
    const missing =
      Number(
        analysis.missingValues || 0
      );

    const duplicates =
      Number(
        analysis.duplicateRows || 0
      );

    if (
      missing > 0 ||
      duplicates > 0
    ) {
      generatedInsights.push({
        type: "risk",
        label: "DATA RISK",
        title:
          "Data quality may affect decisions.",
        description:
          missing > 0
            ? `NEXUS detected ${missing.toLocaleString()} missing values. These should be reviewed before relying on highly granular conclusions.`
            : `NEXUS detected ${duplicates.toLocaleString()} duplicate records that may influence certain calculations.`,
        icon: AlertTriangle,
        className: "insight-orange",
      });
    } else {
      generatedInsights.push({
        type: "quality",
        label: "DATA CONFIDENCE",
        title:
          "The dataset is structurally clean.",
        description:
          "No significant missing-value or duplication issues were detected, giving NEXUS a stronger foundation for analysis.",
        icon: Lightbulb,
        className: "insight-green",
      });
    }
  }

  const insights =
    generatedInsights.slice(0, 5);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <motion.section
      className="business-insights-section"
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
        amount: 0.12,
      }}
      transition={{
        duration: 0.7,
      }}
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="business-insights-header">
        <div>
          <div className="business-insights-eyebrow">
            <span className="eyebrow-line" />

            <span>
              BUSINESS INTELLIGENCE
            </span>
          </div>

          <h2>
            What actually
            <br />
            <span>
              matters.
            </span>
          </h2>

          <p>
            NEXUS translated the strongest
            signals in your dataset into
            business-ready insights.
          </p>
        </div>

        <div className="insights-status">
          <span className="insights-status-dot" />

          <span>
            {insights.length} SIGNALS DETECTED
          </span>
        </div>
      </div>

      {/* =====================================
          INSIGHTS GRID
      ===================================== */}

      <div className="business-insights-grid">
        {insights.map(
          (insight, index) => {
            const Icon = insight.icon;

            return (
              <motion.div
                key={`${insight.label}-${index}`}
                className={`business-insight-card ${insight.className} ${
                  index === 0
                    ? "insight-featured"
                    : ""
                }`}
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                }}
                whileHover={{
                  y: -4,
                }}
              >
                <div className="business-insight-top">
                  <div className="business-insight-icon">
                    <Icon size={18} />
                  </div>

                  <span className="business-insight-label">
                    {insight.label}
                  </span>

                  <ArrowUpRight
                    className="business-insight-arrow"
                    size={17}
                  />
                </div>

                <h3>
                  {insight.title}
                </h3>

                <p>
                  {insight.description}
                </p>

                <div className="business-insight-footer">
                  <span>
                    NEXUS SIGNAL
                  </span>

                  <span>
                    DETECTED
                  </span>
                </div>
              </motion.div>
            );
          }
        )}
      </div>

      {/* =====================================
          FOOTER
      ===================================== */}

      <div className="business-insights-footer">
        <div>
          <span className="footer-pulse-dot" />

          <span>
            NEXUS intelligence engine ready
          </span>
        </div>

        <span>
          Insights calculated from{" "}
          {data.length.toLocaleString()}{" "}
          records
        </span>
      </div>
    </motion.section>
  );
}

export default BusinessInsights;