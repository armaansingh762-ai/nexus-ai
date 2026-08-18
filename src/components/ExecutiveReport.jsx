import { useMemo } from "react";
import {
  Sparkles,
  Database,
  ShieldCheck,
  TrendingUp,
  Activity,
  AlertTriangle,
  FileText,
} from "lucide-react";

function ExecutiveReport({
  data = [],
  analysis = {},
  patterns = [],
}) {
  if (!data || data.length === 0 || !analysis) {
    return null;
  }

  // ==========================================
  // DATASET METRICS
  // ==========================================

  const rowCount = Number(
    analysis.rowCount || data.length
  );

  const columnCount = Number(
    analysis.columnCount ||
      Object.keys(data[0] || {}).length
  );

  const qualityScore = Number(
    analysis.qualityScore || 0
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

  // ==========================================
  // NEXUS SCORE
  // ==========================================

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
            (duplicateRows / rowCount) *
              100
        )
      : 100;

  const nexusScore = Math.round(
    qualityScore * 0.5 +
      completenessScore * 0.3 +
      duplicateScore * 0.2
  );

  // ==========================================
  // SCORE LABEL
  // ==========================================

  const scoreLabel =
    nexusScore >= 90
      ? "Excellent"
      : nexusScore >= 75
      ? "Strong"
      : nexusScore >= 60
      ? "Needs attention"
      : "Requires review";

  // ==========================================
  // HEALTH STATUS
  // ==========================================

  const healthStatus =
    nexusScore >= 75
      ? "Healthy dataset"
      : nexusScore >= 60
      ? "Review recommended"
      : "Data quality issues detected";

  // ==========================================
  // PRIMARY INSIGHT
  // ==========================================

  const primaryPattern =
    patterns.length > 0
      ? patterns[0]
      : null;

  // ==========================================
  // REPORT DATE
  // ==========================================

  const reportDate = useMemo(() => {
    return new Date().toLocaleString(
      undefined,
      {
        dateStyle: "long",
        timeStyle: "short",
      }
    );
  }, []);

  // ==========================================
  // EXECUTIVE SUMMARY
  // ==========================================

  const executiveSummary =
    primaryPattern?.description ||
    `NEXUS analyzed ${rowCount.toLocaleString()} records across ${columnCount} variables and evaluated the dataset for structure, quality and meaningful business signals.`;

  // ==========================================
  // RECOMMENDATIONS
  // ==========================================

  const recommendations = [];

  if (missingValues > 0) {
    recommendations.push(
      `Review ${missingValues.toLocaleString()} missing values before using the dataset for critical business decisions.`
    );
  }

  if (duplicateRows > 0) {
    recommendations.push(
      `Investigate ${duplicateRows.toLocaleString()} duplicate records to ensure downstream calculations are reliable.`
    );
  }

  if (patterns.length > 0) {
    recommendations.push(
      "Investigate the strongest detected business signals and determine whether they represent actionable opportunities."
    );
  }

  if (
    missingValues === 0 &&
    duplicateRows === 0
  ) {
    recommendations.push(
      "The dataset shows strong structural quality and is suitable for deeper analytical exploration."
    );
  }

  recommendations.push(
    "Validate the most important findings against business context before making strategic decisions."
  );

  // ==========================================
  // EXPORT
  // ==========================================

  const handleExport = () => {
    window.print();
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      {/* ======================================
          EXPORT BUTTON
      ====================================== */}

      <div className="report-export-toolbar">
        <div>
          <span className="report-toolbar-eyebrow">
            NEXUS REPORTING
          </span>

          <h3>
            Turn your analysis into an
            executive report.
          </h3>

          <p>
            Generate a polished summary of
            your dataset, findings and
            business recommendations.
          </p>
        </div>

        <button
          className="report-export-button"
          onClick={handleExport}
        >
          <FileText size={17} />

          <span>
            EXPORT EXECUTIVE REPORT
          </span>
        </button>
      </div>

      {/* ======================================
          PRINT REPORT
      ====================================== */}

      <section className="executive-report-print">
        {/* REPORT HEADER */}

        <header className="report-cover">
          <div className="report-brand">
            <div className="report-brand-mark">
              <Sparkles size={20} />
            </div>

            <div>
              <strong>
                NEXUS
              </strong>

              <span>
                INTELLIGENCE ENGINE
              </span>
            </div>
          </div>

          <div className="report-cover-content">
            <span className="report-eyebrow">
              EXECUTIVE INTELLIGENCE REPORT
            </span>

            <h1>
              What actually
              <br />
              matters.
            </h1>

            <p>
              A business intelligence summary
              generated from your uploaded
              dataset.
            </p>
          </div>

          <div className="report-cover-meta">
            <span>
              REPORT GENERATED
            </span>

            <strong>
              {reportDate}
            </strong>
          </div>
        </header>

        {/* DATASET OVERVIEW */}

        <section className="report-section">
          <div className="report-section-heading">
            <span>
              01
            </span>

            <div>
              <small>
                DATASET OVERVIEW
              </small>

              <h2>
                Dataset at a glance.
              </h2>
            </div>
          </div>

          <div className="report-kpi-grid">
            <div className="report-kpi">
              <Database size={18} />

              <span>
                RECORDS
              </span>

              <strong>
                {rowCount.toLocaleString()}
              </strong>
            </div>

            <div className="report-kpi">
              <Activity size={18} />

              <span>
                VARIABLES
              </span>

              <strong>
                {columnCount}
              </strong>
            </div>

            <div className="report-kpi">
              <TrendingUp size={18} />

              <span>
                NUMERIC
              </span>

              <strong>
                {numericColumns.length}
              </strong>
            </div>

            <div className="report-kpi">
              <ShieldCheck size={18} />

              <span>
                DATA QUALITY
              </span>

              <strong>
                {qualityScore}%
              </strong>
            </div>
          </div>
        </section>

        {/* NEXUS SCORE */}

        <section className="report-section">
          <div className="report-score-layout">
            <div>
              <span className="report-eyebrow">
                NEXUS SCORE
              </span>

              <h2>
                {nexusScore}
                <small>
                  /100
                </small>
              </h2>

              <strong className="report-score-label">
                {scoreLabel}
              </strong>

              <p>
                The NEXUS Score combines dataset
                quality, completeness and
                duplication checks into a single
                readiness indicator.
              </p>
            </div>

            <div className="report-score-ring">
              <span>
                {nexusScore}
              </span>
            </div>
          </div>
        </section>

        {/* EXECUTIVE SUMMARY */}

        <section className="report-section report-highlight-section">
          <div className="report-section-heading">
            <span>
              02
            </span>

            <div>
              <small>
                EXECUTIVE SUMMARY
              </small>

              <h2>
                What matters most.
              </h2>
            </div>
          </div>

          <div className="report-primary-insight">
            <div className="report-insight-icon">
              <Sparkles size={20} />
            </div>

            <div>
              <span>
                KEY SIGNAL
              </span>

              <h3>
                {primaryPattern?.title ||
                  "Dataset ready for deeper analysis."}
              </h3>

              <p>
                {executiveSummary}
              </p>
            </div>
          </div>
        </section>

        {/* DATA HEALTH */}

        <section className="report-section">
          <div className="report-section-heading">
            <span>
              03
            </span>

            <div>
              <small>
                DATA HEALTH
              </small>

              <h2>
                Dataset readiness.
              </h2>
            </div>
          </div>

          <div className="report-health-grid">
            <div className="report-health-card">
              <ShieldCheck size={20} />

              <span>
                STATUS
              </span>

              <strong>
                {healthStatus}
              </strong>
            </div>

            <div className="report-health-card">
              <AlertTriangle size={20} />

              <span>
                MISSING VALUES
              </span>

              <strong>
                {missingValues.toLocaleString()}
              </strong>
            </div>

            <div className="report-health-card">
              <Database size={20} />

              <span>
                DUPLICATE ROWS
              </span>

              <strong>
                {duplicateRows.toLocaleString()}
              </strong>
            </div>
          </div>
        </section>

        {/* DETECTED SIGNALS */}

        <section className="report-section">
          <div className="report-section-heading">
            <span>
              04
            </span>

            <div>
              <small>
                BUSINESS INTELLIGENCE
              </small>

              <h2>
                Detected signals.
              </h2>
            </div>
          </div>

          <div className="report-pattern-list">
            {patterns.length > 0 ? (
              patterns
                .slice(0, 6)
                .map(
                  (pattern, index) => (
                    <div
                      className="report-pattern"
                      key={
                        pattern.title ||
                        index
                      }
                    >
                      <span>
                        0{index + 1}
                      </span>

                      <div>
                        <h3>
                          {pattern.title}
                        </h3>

                        <p>
                          {
                            pattern.description
                          }
                        </p>
                      </div>
                    </div>
                  )
                )
            ) : (
              <div className="report-pattern">
                <span>
                  01
                </span>

                <div>
                  <h3>
                    No major signals detected.
                  </h3>

                  <p>
                    NEXUS did not identify
                    enough meaningful patterns
                    to include additional
                    business signals in this
                    report.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RECOMMENDATIONS */}

        <section className="report-section">
          <div className="report-section-heading">
            <span>
              05
            </span>

            <div>
              <small>
                RECOMMENDATIONS
              </small>

              <h2>
                What to do next.
              </h2>
            </div>
          </div>

          <div className="report-recommendations">
            {recommendations.map(
              (recommendation, index) => (
                <div
                  className="report-recommendation"
                  key={index}
                >
                  <span>
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <p>
                    {recommendation}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* METHODOLOGY */}

        <section className="report-section report-methodology">
          <span className="report-eyebrow">
            METHODOLOGY
          </span>

          <p>
            This report was generated by NEXUS
            using the uploaded dataset. Analysis
            includes structural inspection, data
            quality evaluation, variable
            classification and pattern detection.
            Findings should be interpreted within
            the relevant business context.
          </p>
        </section>

        {/* FOOTER */}

        <footer className="report-footer">
          <div>
            <strong>
              NEXUS
            </strong>

            <span>
              Intelligence for modern business
            </span>
          </div>

          <span>
            CONFIDENTIAL · GENERATED BY NEXUS
          </span>
        </footer>
      </section>
    </>
  );
}

export default ExecutiveReport;