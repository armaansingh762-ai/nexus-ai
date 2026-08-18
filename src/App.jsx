import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import DatasetWorkspace from "./components/DatasetWorkspace";
import ExecutiveReport from "./components/ExecutiveReport";
import DatasetSwitcher from "./components/DatasetSwitcher";
import BusinessInsights from "./components/BusinessInsights";
import DataCharts from "./components/DataCharts";
import ExecutiveOverview from "./components/ExecutiveOverview";
import AskYourData from "./components/AskYourData";
import AnalyticsExplorer from "./components/AnalyticsExplorer";

import { analyzeDataset } from "./datasetAnalyzer";
import { detectPatterns } from "./patternDetector";

import {
  ArrowUpRight,
  BarChart3,
  Sparkles,
  Zap,
} from "lucide-react";

import "./App.css";

function App() {
  // ==========================================
  // DATASET STATE
  // ==========================================

  const [datasets, setDatasets] = useState([]);

  const [activeDatasetIndex, setActiveDatasetIndex] =
    useState(0);

  const [dataset, setDataset] = useState(null);

  const [csvData, setCsvData] = useState([]);

  const [analysis, setAnalysis] = useState(null);

  // ==========================================
  // NEXUS ANALYSIS ANIMATION
  // ==========================================

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [analysisStage, setAnalysisStage] =
    useState(0);

  const analysisStages = [
    "INITIALIZING NEXUS",
    "READING DATASET",
    "ANALYZING VARIABLES",
    "DETECTING PATTERNS",
    "GENERATING BUSINESS INTELLIGENCE",
    "ANALYSIS COMPLETE",
  ];

  // ==========================================
  // PATTERNS
  // ==========================================

  const [patterns, setPatterns] = useState([]);

  // ==========================================
  // SWITCH ACTIVE DATASET
  // ==========================================

  const handleDatasetSelect = (index) => {
    if (
      !datasets ||
      !datasets[index]
    ) {
      return;
    }

    setActiveDatasetIndex(index);

    const selectedDataset =
      datasets[index];

    setDataset(selectedDataset);

    setCsvData(
      selectedDataset.rows
    );

    const results =
      analyzeDataset(
        selectedDataset
      );

    setAnalysis(results);

    const detectedPatterns =
      detectPatterns(
        selectedDataset,
        results
      );

    setPatterns(
      detectedPatterns
    );

    console.log(
      "NEXUS SWITCHED DATASET:",
      selectedDataset
    );

    console.log(
      "NEXUS ANALYSIS:",
      results
    );

    console.log(
      "NEXUS PATTERNS:",
      detectedPatterns
    );
  };

  // ==========================================
  // ANALYZE DATASETS
  // ==========================================

  const handleAnalyze = async (
    uploadedDatasets
  ) => {
    if (
      !uploadedDatasets ||
      uploadedDatasets.length === 0
    ) {
      return;
    }

    // ==========================================
    // START NEXUS ANALYSIS EXPERIENCE
    // ==========================================

    setIsAnalyzing(true);
    setAnalysisStage(0);

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 500)
    );

    setAnalysisStage(1);

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 450)
    );

    setAnalysisStage(2);

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 450)
    );

    setAnalysisStage(3);

    // ==========================================
    // STORE DATASETS
    // ==========================================

    setDatasets(
      uploadedDatasets
    );

    setActiveDatasetIndex(0);

    const activeDataset =
      uploadedDatasets[0];

    setDataset(
      activeDataset
    );

    setCsvData(
      activeDataset.rows
    );

    // ==========================================
    // REAL NEXUS ANALYSIS
    // ==========================================

    const results =
      analyzeDataset(
        activeDataset
      );

    setAnalysis(
      results
    );

    // ==========================================
    // PATTERN DETECTION
    // ==========================================

    const detectedPatterns =
      detectPatterns(
        activeDataset,
        results
      );

    setPatterns(
      detectedPatterns
    );

    // ==========================================
    // GENERATE BUSINESS INTELLIGENCE
    // ==========================================

    setAnalysisStage(4);

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 700)
    );

    // ==========================================
    // COMPLETE
    // ==========================================

    setAnalysisStage(5);

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 850)
    );

    setIsAnalyzing(false);

    // ==========================================
    // DEBUG
    // ==========================================

    console.log(
      "NEXUS DATASETS:",
      uploadedDatasets
    );

    console.log(
      "NEXUS DATASET COUNT:",
      uploadedDatasets.length
    );

    console.log(
      "NEXUS ACTIVE DATASET:",
      activeDataset
    );

    console.log(
      "NEXUS ANALYSIS:",
      results
    );

    console.log(
      "NEXUS PATTERNS:",
      detectedPatterns
    );
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="nexus-app">

      {/* ======================================
          BACKGROUND
      ====================================== */}

      <div className="background-glow glow-one" />

      <div className="background-glow glow-two" />

      {/* ======================================
          NEXUS ANALYSIS EXPERIENCE
      ====================================== */}

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            className="nexus-analysis-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.45,
            }}
          >

            {/* ==================================
                AMBIENT BACKGROUND
            ================================== */}

            <motion.div
              className="analysis-ambient analysis-ambient-one"
              animate={{
                scale: [
                  1,
                  1.25,
                  1,
                ],
                opacity: [
                  0.25,
                  0.5,
                  0.25,
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="analysis-ambient analysis-ambient-two"
              animate={{
                scale: [
                  1.2,
                  1,
                  1.2,
                ],
                opacity: [
                  0.2,
                  0.45,
                  0.2,
                ],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* ==================================
                MAIN INTELLIGENCE INTERFACE
            ================================== */}

            <motion.div
              className="nexus-analysis-modal"
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 1.04,
                y: -10,
              }}
              transition={{
                duration: 0.55,
                ease: [
                  0.16,
                  1,
                  0.3,
                  1,
                ],
              }}
            >

              {/* ==================================
                  TOP LABEL
              ================================== */}

              <div className="analysis-modal-label">

                <span className="analysis-live-dot" />

                NEXUS INTELLIGENCE ENGINE

              </div>

              {/* ==================================
                  CORE
              ================================== */}

              <div className="nexus-analysis-core">

                <motion.div
                  className="analysis-orbit orbit-one"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <motion.div
                  className="analysis-orbit orbit-two"
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <motion.div
                  className="analysis-core-ring"
                  animate={{
                    scale: [
                      1,
                      1.08,
                      1,
                    ],
                    boxShadow: [
                      "0 0 30px rgba(139,92,246,0.25)",
                      "0 0 70px rgba(139,92,246,0.55)",
                      "0 0 30px rgba(139,92,246,0.25)",
                    ],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles size={32} />
                </motion.div>

              </div>

              {/* ==================================
                  ANALYSIS TITLE
              ================================== */}

              <motion.h2
                key={analysisStage}
                initial={{
                  opacity: 0,
                  y: 10,
                  filter:
                    "blur(8px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter:
                    "blur(0px)",
                }}
                transition={{
                  duration: 0.45,
                }}
                className="analysis-stage-title"
              >
                {analysisStages[
                  analysisStage
                ]}
              </motion.h2>

              {/* ==================================
                  SUBTITLE
              ================================== */}

              <motion.p
                key={`description-${analysisStage}`}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="analysis-stage-description"
              >
                {analysisStage === 0 &&
                  "Connecting to the NEXUS intelligence engine."}

                {analysisStage === 1 &&
                  "Reading structure, records and dataset metadata."}

                {analysisStage === 2 &&
                  "Classifying variables and measuring data quality."}

                {analysisStage === 3 &&
                  "Searching for relationships, segments and meaningful signals."}

                {analysisStage === 4 &&
                  "Converting statistical signals into business-focused intelligence."}

                {analysisStage === 5 &&
                  "Your dataset has been transformed into actionable intelligence."}
              </motion.p>

              {/* ==================================
                  PROGRESS
              ================================== */}

              <div className="analysis-progress">

                <motion.div
                  className="analysis-progress-fill"
                  animate={{
                    width: `${Math.min(
                      100,
                      ((analysisStage + 1) /
                        analysisStages.length) *
                        100
                    )}%`,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                />

              </div>

              {/* ==================================
                  STAGE INDICATORS
              ================================== */}

              <div className="analysis-stage-list">

                {analysisStages.map(
                  (
                    stage,
                    index
                  ) => (
                    <motion.div
                      key={stage}
                      className={`analysis-stage-item ${
                        index ===
                        analysisStage
                          ? "active"
                          : ""
                      } ${
                        index <
                        analysisStage
                          ? "complete"
                          : ""
                      }`}
                    >

                      <span className="analysis-stage-marker">

                        {index <
                        analysisStage
                          ? "✓"
                          : index ===
                            analysisStage
                          ? "•"
                          : ""}

                      </span>

                      <span>
                        {stage}
                      </span>

                    </motion.div>
                  )
                )}

              </div>

              {/* ==================================
                  FOOTER STATUS
              ================================== */}

              <div className="analysis-modal-footer">

                <span>
                  {analysisStage <
                  5
                    ? "NEXUS IS THINKING"
                    : "INTELLIGENCE READY"}
                </span>

                <div className="analysis-thinking-dots">

                  <motion.span
                    animate={{
                      opacity: [
                        0.25,
                        1,
                        0.25,
                      ],
                    }}
                    transition={{
                      duration: 1,
                      repeat:
                        Infinity,
                      delay: 0,
                    }}
                  />

                  <motion.span
                    animate={{
                      opacity: [
                        0.25,
                        1,
                        0.25,
                      ],
                    }}
                    transition={{
                      duration: 1,
                      repeat:
                        Infinity,
                      delay: 0.2,
                    }}
                  />

                  <motion.span
                    animate={{
                      opacity: [
                        0.25,
                        1,
                        0.25,
                      ],
                    }}
                    transition={{
                      duration: 1,
                      repeat:
                        Infinity,
                      delay: 0.4,
                    }}
                  />

                </div>

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================
          NAVIGATION
      ====================================== */}

      <nav className="navbar">

        <div className="brand">

          <div className="brand-mark">
            <Sparkles size={17} />
          </div>

          <span>
            NEXUS
          </span>

        </div>

        <div className="nav-links">

          <a href="#product">
            Product
          </a>

          <a href="#how-it-works">
            How it works
          </a>

          <a href="#about">
            About
          </a>

        </div>

        <button className="nav-button">

          Get started

          <ArrowUpRight size={16} />

        </button>

      </nav>

      {/* ======================================
          HERO
      ====================================== */}

      <section
        className="hero"
        id="product"
      >

        <motion.div
          className="hero-badge"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
        >

          <span className="status-dot" />

          AI-powered business intelligence

        </motion.div>

        <motion.h1
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.1,
          }}
        >

          Turn your data

          <br />

          <span>
            into decisions.
          </span>

        </motion.h1>

        <motion.p
          className="hero-description"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.2,
          }}
        >

          Upload your datasets and let NEXUS
          uncover the patterns, opportunities
          and insights hiding inside your data.

        </motion.p>

        {/* ==================================
            MULTI-DATASET UPLOAD
        ================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
          }}
        >

          <DatasetWorkspace
            onAnalyze={
              handleAnalyze
            }
            datasets={
              datasets
            }
            activeDatasetIndex={
              activeDatasetIndex
            }
            onSelectDataset={
              handleDatasetSelect
            }
          />

        </motion.div>

        {/* ==================================
            FEATURES
        ================================== */}

        <motion.div
          className="feature-row"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.5,
          }}
        >

          <div className="feature">

            <div className="feature-icon">
              <BarChart3 size={17} />
            </div>

            <div>

              <strong>
                Automatic analysis
              </strong>

              <span>
                Understand your dataset instantly
              </span>

            </div>

          </div>

          <div className="feature">

            <div className="feature-icon">
              <Sparkles size={17} />
            </div>

            <div>

              <strong>
                AI-powered insights
              </strong>

              <span>
                Discover what actually matters
              </span>

            </div>

          </div>

          <div className="feature">

            <div className="feature-icon">
              <Zap size={17} />
            </div>

            <div>

              <strong>
                Actionable decisions
              </strong>

              <span>
                Turn findings into opportunities
              </span>

            </div>

          </div>

        </motion.div>

      </section>

      {/* ======================================
          DATASET SWITCHER
      ====================================== */}

      {datasets.length > 0 && (
        <DatasetSwitcher
          datasets={
            datasets
          }
          activeDatasetIndex={
            activeDatasetIndex
          }
          onSelectDataset={
            handleDatasetSelect
          }
        />
      )}

      {/* ======================================
          NEXUS EXECUTIVE OVERVIEW
      ====================================== */}

      {analysis &&
        csvData.length > 0 && (
          <ExecutiveOverview
            data={csvData}
            analysis={analysis}
            patterns={patterns}
          />
        )}

      {/* ======================================
          DATASET INTELLIGENCE
      ====================================== */}

      {analysis && (
        <motion.section
          className="analysis-section"
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
        >

          <div className="analysis-header">

            <div>

              <span className="section-eyebrow">
                DATASET INTELLIGENCE
              </span>

              <h2>
                Your dataset is ready to explore.
              </h2>

              <p>
                NEXUS analyzed your dataset and
                identified its structure, quality,
                and key characteristics.
              </p>

            </div>

            <div className="analysis-status">

              <span className="status-dot" />

              Analyzed

            </div>

          </div>

          {/* ==================================
              DATASET NAME
          ================================== */}

          <div className="analysis-file">

            <span>
              Dataset
            </span>

            <strong>
              {dataset?.fileName}
            </strong>

          </div>

          {/* ==================================
              METRICS
          ================================== */}

          <motion.div
            className="metrics-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.25,
            }}
            variants={{
              hidden: {},

              visible: {
                transition: {
                  staggerChildren:
                    0.12,
                  delayChildren:
                    0.25,
                },
              },
            }}
          >

            <motion.div
              className="metric-card"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 25,
                  scale: 0.96,
                },

                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,

                  transition: {
                    duration: 0.45,
                  },
                },
              }}
            >

              <span>
                Records
              </span>

              <strong>
                {analysis.rowCount.toLocaleString()}
              </strong>

              <small>
                Total rows
              </small>

            </motion.div>

            <motion.div
              className="metric-card"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 25,
                  scale: 0.96,
                },

                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,

                  transition: {
                    duration: 0.45,
                  },
                },
              }}
            >

              <span>
                Variables
              </span>

              <strong>
                {analysis.columnCount}
              </strong>

              <small>
                Total columns
              </small>

            </motion.div>

            <motion.div
              className="metric-card"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 25,
                  scale: 0.96,
                },

                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,

                  transition: {
                    duration: 0.45,
                  },
                },
              }}
            >

              <span>
                Data quality
              </span>

              <strong>
                {analysis.qualityScore}%
              </strong>

              <small>
                Overall score
              </small>

            </motion.div>

            <motion.div
              className="metric-card"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 25,
                  scale: 0.96,
                },

                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,

                  transition: {
                    duration: 0.45,
                  },
                },
              }}
            >

              <span>
                Missing values
              </span>

              <strong>
                {analysis.missingValues}
              </strong>

              <small>
                {analysis.missingPercentage}% of dataset
              </small>

            </motion.div>

            <motion.div
              className="metric-card"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 25,
                  scale: 0.96,
                },

                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,

                  transition: {
                    duration: 0.45,
                  },
                },
              }}
            >

              <span>
                Duplicate rows
              </span>

              <strong>
                {analysis.duplicateRows}
              </strong>

              <small>
                {analysis.duplicatePercentage}% of records
              </small>

            </motion.div>

          </motion.div>

          {/* ==================================
              VARIABLE STRUCTURE
          ================================== */}

          <div className="structure-grid">

            {/* NUMERIC */}

            <div className="structure-card">

              <span className="section-eyebrow">
                NUMERIC VARIABLES
              </span>

              <motion.div
                className="variable-list"
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.25,
                }}
                variants={{
                  hidden: {},

                  visible: {
                    transition: {
                      staggerChildren:
                        0.05,
                      delayChildren:
                        0.85,
                    },
                  },
                }}
              >

                {analysis.numericColumns.map(
                  (column) => (
                    <motion.span
                      key={column}
                      variants={{
                        hidden: {
                          opacity: 0,
                          scale: 0.8,
                          y: 8,
                        },

                        visible: {
                          opacity: 1,
                          scale: 1,
                          y: 0,

                          transition: {
                            duration: 0.3,
                          },
                        },
                      }}
                    >
                      {column}
                    </motion.span>
                  )
                )}

              </motion.div>

            </div>

            {/* CATEGORICAL */}

            <div className="structure-card">

              <span className="section-eyebrow">
                CATEGORICAL VARIABLES
              </span>

              <motion.div
                className="variable-list"
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.25,
                }}
                variants={{
                  hidden: {},

                  visible: {
                    transition: {
                      staggerChildren:
                        0.05,
                      delayChildren:
                        1.15,
                    },
                  },
                }}
              >

                {analysis.categoricalColumns.map(
                  (column) => (
                    <motion.span
                      key={column}
                      variants={{
                        hidden: {
                          opacity: 0,
                          scale: 0.8,
                          y: 8,
                        },

                        visible: {
                          opacity: 1,
                          scale: 1,
                          y: 0,

                          transition: {
                            duration: 0.3,
                          },
                        },
                      }}
                    >
                      {column}
                    </motion.span>
                  )
                )}

              </motion.div>

            </div>

          </div>

        </motion.section>
      )}

    {/* ==========================================
    VISUAL ANALYTICS
========================================== */}

{analysis &&
  csvData.length > 0 && (
    <DataCharts
      data={csvData}
    />
  )}

{/* ==========================================
    BUSINESS INTELLIGENCE
========================================== */}

{analysis &&
  csvData.length > 0 && (
    <BusinessInsights
      data={csvData}
      analysis={analysis}
    />
  )}

  {/* ==========================================
    EXECUTIVE REPORT
========================================== */}

{analysis &&
  csvData.length > 0 && (
    <ExecutiveReport
      data={csvData}
      analysis={analysis}
      patterns={patterns}
    />
  )}

{/* ==========================================
    ASK YOUR DATA
========================================== */}

{analysis &&
  csvData.length > 0 && (
    <AskYourData
      data={csvData}
    />
  )}
      

      {/* ======================================
          INTERACTIVE ANALYTICS
      ====================================== */}

      {analysis &&
        csvData.length > 0 && (
          <AnalyticsExplorer
            data={csvData}
          />
        )}

      {/* ======================================
          PATTERN DETECTION
      ====================================== */}

      {patterns.length > 0 && (
        <motion.section
          className="patterns-section"
          initial={{
            opacity: 0,
            y: 40,
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

          <div className="patterns-header">

            <div>

              <span className="section-eyebrow">
                NEXUS DISCOVERED
              </span>

              <h2>
                Patterns worth your attention.
              </h2>

              <p>
                NEXUS analyzed relationships and
                distributions across your dataset
                to identify potentially meaningful
                business patterns.
              </p>

            </div>

            <div className="patterns-count">

              <strong>
                {patterns.length}
              </strong>

              <span>
                patterns detected
              </span>

            </div>

          </div>

          <div className="patterns-grid">

            {patterns.map(
              (
                pattern,
                index
              ) => (
                <motion.div
                  key={`${pattern.type}-${index}`}
                  className="pattern-card"
                  initial={{
                    opacity: 0,
                    y: 25,
                    scale: 0.97,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.45,
                    delay:
                      index * 0.1,
                  }}
                >

                  <div className="pattern-top">

                    <span className="pattern-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <span className="pattern-type">
                      {pattern.type}
                    </span>

                  </div>

                  <h3>
                    {pattern.title}
                  </h3>

                  <p>
                    {pattern.description}
                  </p>

                  {pattern.correlation !==
                    undefined && (
                    <div className="pattern-strength">

                      <span>
                        Relationship strength
                      </span>

                      <strong>
                        {pattern.correlation}
                      </strong>

                    </div>
                  )}

                  {pattern.percentage !==
                    undefined && (
                    <div className="pattern-strength">

                      <span>
                        Share of records
                      </span>

                      <strong>
                        {pattern.percentage}%
                      </strong>

                    </div>
                  )}

                  {pattern.values && (
                    <div className="pattern-values">

                      {pattern.values.map(
                        (value) => (
                          <span
                            key={String(
                              value
                            )}
                          >
                            {String(
                              value
                            )}
                          </span>
                        )
                      )}

                    </div>
                  )}

                </motion.div>
              )
            )}

          </div>

        </motion.section>
      )}

      {/* ======================================
          BUSINESS INSIGHTS
      ====================================== */}

      

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="footer">

        <span>
          © 2026 NEXUS
        </span>

        <span>
          Intelligence for modern business
        </span>

      </footer>

    </main>
  );
}

export default App;