import { motion } from "framer-motion";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Database,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

function ExecutiveOverview({
  data,
  analysis,
  patterns = [],
}) {
  if (
    !data ||
    data.length === 0 ||
    !analysis
  ) {
    return null;
  }

  // =========================================================
  // CORE DATA
  // =========================================================

  const qualityScore = Number(
    analysis.qualityScore || 0
  );

  const rowCount = Number(
    analysis.rowCount || data.length
  );

  const columnCount = Number(
    analysis.columnCount || 0
  );

  const missingValues = Number(
    analysis.missingValues || 0
  );

  const duplicateRows = Number(
    analysis.duplicateRows || 0
  );

  const missingPercentage = Number(
    analysis.missingPercentage || 0
  );

  const numericColumns =
    analysis.numericColumns || [];

  const categoricalColumns =
    analysis.categoricalColumns || [];

  // =========================================================
  // NEXUS SCORE
  // =========================================================

  const completenessScore =
    missingPercentage > 0
      ? Math.max(
          0,
          100 - missingPercentage
        )
      : 100;

  const duplicateScore =
    rowCount > 0
      ? Math.max(
          0,
          100 -
            (duplicateRows /
              rowCount) *
              100
        )
      : 100;

  const nexusScore = Math.round(
    qualityScore * 0.5 +
      completenessScore * 0.3 +
      duplicateScore * 0.2
  );

  // =========================================================
  // SCORE LABEL
  // =========================================================

  const getScoreLabel = () => {
    if (nexusScore >= 90) {
      return "Excellent";
    }

    if (nexusScore >= 75) {
      return "Strong";
    }

    if (nexusScore >= 60) {
      return "Needs attention";
    }

    return "Requires review";
  };

  // =========================================================
  // HEALTH
  // =========================================================

  const getHealthStatus = () => {
    if (nexusScore >= 90) {
      return {
        label: "Healthy dataset",
        className: "health-good",
        icon: ShieldCheck,
      };
    }

    if (nexusScore >= 75) {
      return {
        label: "Good dataset",
        className: "health-good",
        icon: ShieldCheck,
      };
    }

    if (nexusScore >= 60) {
      return {
        label: "Review recommended",
        className: "health-warning",
        icon: AlertTriangle,
      };
    }

    return {
      label: "Data quality issues",
      className: "health-risk",
      icon: AlertTriangle,
    };
  };

  const healthStatus =
    getHealthStatus();

  const HealthIcon =
    healthStatus.icon;

  // =========================================================
  // PATTERN SIGNAL
  // =========================================================

  const primaryPattern =
    patterns.length > 0
      ? patterns[0]
      : null;

  // =========================================================
  // METRICS
  // =========================================================

  const summaryMetrics = [
    {
      label: "RECORDS",
      value: rowCount.toLocaleString(),
      description: "Rows analyzed",
      icon: Database,
    },
    {
      label: "VARIABLES",
      value: columnCount,
      description: "Columns detected",
      icon: Activity,
    },
    {
      label: "NUMERIC",
      value: numericColumns.length,
      description: "Numeric variables",
      icon: TrendingUp,
    },
    {
      label: "QUALITY",
      value: `${qualityScore}%`,
      description: "Data quality",
      icon: ShieldCheck,
    },
  ];

  // =========================================================
  // SCORE RING
  // =========================================================

  const scoreCircumference =
    2 * Math.PI * 43;

  const scoreOffset =
    scoreCircumference -
    (nexusScore / 100) *
      scoreCircumference;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <motion.section
      className="executive-section premium-executive-section"
      initial={{
        opacity: 0,
        y: 35,
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
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="executive-header premium-executive-header">

        <div className="executive-heading-block">

          <div className="executive-eyebrow">
            <span className="executive-eyebrow-line" />

            <Sparkles size={13} />

            <span>
              NEXUS INTELLIGENCE
            </span>
          </div>

          <h2>
            Your data,
            <br />

            <span>
              understood.
            </span>
          </h2>

          <p>
            NEXUS analyzed the structure,
            quality and signals within your
            dataset to create an executive
            intelligence summary.
          </p>

        </div>


        {/* ===================================================
            NEXUS SCORE
        =================================================== */}

        <motion.div
          className="nexus-score-card premium-score-card"
          initial={{
            opacity: 0,
            scale: 0.94,
            x: 15,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
            x: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.65,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
        >

          <div className="score-ring">

            <svg
              viewBox="0 0 100 100"
              className="score-ring-svg"
            >

              <circle
                cx="50"
                cy="50"
                r="43"
                className="score-ring-background"
              />

              <motion.circle
                cx="50"
                cy="50"
                r="43"
                className="score-ring-progress"
                strokeDasharray={
                  scoreCircumference
                }
                initial={{
                  strokeDashoffset:
                    scoreCircumference,
                }}
                whileInView={{
                  strokeDashoffset:
                    scoreOffset,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 1.3,
                  delay: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

            </svg>

            <div className="score-ring-content">

              <strong>
                {nexusScore}
              </strong>

              <span>
                /100
              </span>

            </div>

          </div>


          <div className="score-copy">

            <span>
              NEXUS SCORE
            </span>

            <strong>
              {getScoreLabel()}
            </strong>

            <small>
              Dataset readiness
            </small>

          </div>

        </motion.div>

      </div>


      {/* =====================================================
          EXECUTIVE METRICS
      ===================================================== */}

      <motion.div
        className="executive-summary premium-executive-summary"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.15,
        }}
        variants={{
          hidden: {},

          visible: {
            transition: {
              staggerChildren: 0.07,
              delayChildren: 0.15,
            },
          },
        }}
      >

        {summaryMetrics.map(
          (metric) => {

            const Icon =
              metric.icon;

            return (
              <motion.div
                key={metric.label}
                className="summary-item premium-summary-item"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 12,
                  },

                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                transition={{
                  duration: 0.4,
                }}
                whileHover={{
                  y: -3,
                }}
              >

                <div className="summary-icon">

                  <Icon size={16} />

                </div>

                <div className="summary-copy">

                  <span>
                    {metric.label}
                  </span>

                  <strong>
                    {metric.value}
                  </strong>

                  <small>
                    {metric.description}
                  </small>

                </div>

              </motion.div>
            );
          }
        )}

      </motion.div>


      {/* =====================================================
          SIGNALS
      ===================================================== */}

      <div className="executive-signals premium-executive-signals">

        {/* ===================================================
            KEY SIGNAL
        =================================================== */}

        <motion.article
          className="executive-signal signal-primary premium-signal-card"
          initial={{
            opacity: 0,
            y: 18,
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
            delay: 0.25,
          }}
          whileHover={{
            y: -4,
          }}
        >

          <div className="signal-heading">

            <div className="signal-icon">

              <Sparkles size={15} />

            </div>

            <span>
              KEY SIGNAL
            </span>

            <ArrowUpRight
              size={15}
              className="signal-arrow"
            />

          </div>


          <h3>
            {primaryPattern
              ? primaryPattern.title
              : "Your dataset is ready for deeper analysis."}
          </h3>


          <p>
            {primaryPattern
              ? primaryPattern.description
              : `NEXUS identified ${patterns.length} meaningful patterns across ${rowCount.toLocaleString()} records.`}
          </p>


          <div className="signal-footer">

            <span>
              BUSINESS RELEVANCE
            </span>

            <span>
              {patterns.length > 0
                ? "SIGNAL DETECTED"
                : "READY"}
            </span>

          </div>

        </motion.article>


        {/* ===================================================
            DATA HEALTH
        =================================================== */}

        <motion.article
          className={`executive-signal ${healthStatus.className} premium-signal-card`}
          initial={{
            opacity: 0,
            y: 18,
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
            delay: 0.33,
          }}
          whileHover={{
            y: -4,
          }}
        >

          <div className="signal-heading">

            <div className="signal-icon">

              <HealthIcon size={15} />

            </div>

            <span>
              DATA HEALTH
            </span>

            <span className="health-status-pill">
              {nexusScore >= 75
                ? "STABLE"
                : "REVIEW"}
            </span>

          </div>


          <h3>
            {healthStatus.label}
          </h3>


          <p>
            {missingValues > 0
              ? `NEXUS found ${missingValues.toLocaleString()} missing values that may require attention before deeper analysis.`
              : duplicateRows > 0
              ? `NEXUS detected ${duplicateRows.toLocaleString()} duplicate records that may affect certain calculations.`
              : "The dataset contains no significant missing-value or duplication issues."}
          </p>


          <div className="signal-footer">

            <span>
              COMPLETENESS
            </span>

            <span>
              {Math.round(
                completenessScore
              )}
              %
            </span>

          </div>

        </motion.article>

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <motion.div
        className="executive-footer premium-executive-footer"
        initial={{
          opacity: 0,
        }}
        whileInView={{
          opacity: 1,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.5,
          delay: 0.45,
        }}
      >

        <div>

          <span className="status-dot" />

          <span>
            NEXUS analysis complete
          </span>

        </div>


        <span>
          {numericColumns.length} numeric
          <span className="footer-divider">
            ·
          </span>
          {categoricalColumns.length}
          categorical
          <span className="footer-divider">
            ·
          </span>
          {patterns.length} signals detected
        </span>

      </motion.div>

    </motion.section>
  );
}

export default ExecutiveOverview;