import { useRef, useState, useEffect } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  X,
  Plus,
  Database,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";

const MAX_FILES = 2;
const MAX_FILE_SIZE = 500 * 1024 * 1024;

function DatasetWorkspace({
  onAnalyze,
  datasets = [],
  activeDatasetIndex = 0,
  onSelectDataset,
}) {
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [analysisComplete, setAnalysisComplete] =
    useState(false);

  const [analysisProgress, setAnalysisProgress] =
    useState(0);

  const [analysisStage, setAnalysisStage] =
    useState(0);

  // ==========================================
  // ANALYSIS STAGES
  // ==========================================

  const analysisStages = [
    "INITIALIZING NEXUS",
    "READING DATASET",
    "ANALYZING VARIABLES",
    "DETECTING PATTERNS",
    "GENERATING BUSINESS INTELLIGENCE",
    "ANALYSIS COMPLETE",
  ];

  // ==========================================
  // PREMIUM ANALYSIS PROGRESS
  // ==========================================

  useEffect(() => {
    if (!isAnalyzing) {
      return;
    }

    setAnalysisStage(0);
    setAnalysisProgress(8);

    const stageTimers = [];

    const stages = [
      {
        delay: 450,
        stage: 1,
        progress: 24,
      },
      {
        delay: 1000,
        stage: 2,
        progress: 43,
      },
      {
        delay: 1600,
        stage: 3,
        progress: 62,
      },
      {
        delay: 2200,
        stage: 4,
        progress: 82,
      },
    ];

    stages.forEach(
      ({ delay, stage, progress }) => {
        const timer = setTimeout(() => {
          setAnalysisStage(stage);
          setAnalysisProgress(progress);
        }, delay);

        stageTimers.push(timer);
      }
    );

    return () => {
      stageTimers.forEach(clearTimeout);
    };
  }, [isAnalyzing]);

  // ==========================================
  // COMPLETE ANALYSIS
  // ==========================================

  useEffect(() => {
    if (!analysisComplete) {
      return;
    }

    setAnalysisStage(
      analysisStages.length - 1
    );

    setAnalysisProgress(100);

    const timer = setTimeout(() => {
      setAnalysisComplete(false);
      setIsAnalyzing(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [analysisComplete]);

  // ==========================================
  // VALIDATE FILE
  // ==========================================

  const validateFile = (file) => {
    if (!file) {
      return "Invalid file.";
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      return `${file.name} is not a CSV file.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is larger than 500 MB.`;
    }

    if (file.size === 0) {
      return `${file.name} is empty.`;
    }

    return null;
  };

  // ==========================================
  // ADD FILES
  // ==========================================

  const handleFiles = (selectedFiles) => {
    setError("");

    if (
      !selectedFiles ||
      selectedFiles.length === 0
    ) {
      return;
    }

    const incomingFiles =
      Array.from(selectedFiles);

    if (
      files.length +
        incomingFiles.length >
      MAX_FILES
    ) {
      setError(
        `NEXUS currently supports a maximum of ${MAX_FILES} CSV files.`
      );

      return;
    }

    const validFiles = [];

    for (const file of incomingFiles) {
      const validationError =
        validateFile(file);

      if (validationError) {
        setError(validationError);
        continue;
      }

      const alreadyAdded = files.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size
      );

      if (alreadyAdded) {
        setError(
          `${file.name} has already been added.`
        );

        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setFiles((currentFiles) => [
        ...currentFiles,
        ...validFiles,
      ]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // FILE INPUT
  // ==========================================

  const handleInputChange = (event) => {
    handleFiles(event.target.files);
  };

  // ==========================================
  // DRAG & DROP
  // ==========================================

  const handleDrop = (event) => {
    event.preventDefault();

    handleFiles(event.dataTransfer.files);
  };

  // ==========================================
  // REMOVE FILE
  // ==========================================

  const removeFile = (index) => {
    setFiles((currentFiles) =>
      currentFiles.filter(
        (_, fileIndex) =>
          fileIndex !== index
      )
    );

    setError("");
  };

  // ==========================================
  // PARSE ONE CSV
  // ==========================================

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        delimiter: "",

        complete: (results) => {
          console.log(
            `NEXUS PARSED: ${file.name}`,
            results
          );

          if (
            !results.data ||
            results.data.length === 0
          ) {
            reject(
              new Error(
                `${file.name} does not contain usable data.`
              )
            );

            return;
          }

          const rows = results.data;

          const columns =
            results.meta?.fields || [];

          if (columns.length === 0) {
            reject(
              new Error(
                `${file.name} does not contain recognizable columns.`
              )
            );

            return;
          }

          const cleanedRows = rows.filter(
            (row) =>
              Object.values(row).some(
                (value) =>
                  value !== null &&
                  value !== undefined &&
                  String(value).trim() !== ""
              )
          );

          if (cleanedRows.length === 0) {
            reject(
              new Error(
                `${file.name} does not contain usable records.`
              )
            );

            return;
          }

          resolve({
            fileName: file.name,
            fileSize: file.size,

            rows: cleanedRows,

            columns,

            rowCount:
              cleanedRows.length,

            columnCount:
              columns.length,

            parseWarnings:
              results.errors || [],
          });
        },

        error: (parseError) => {
          reject(parseError);
        },
      });
    });
  };

  // ==========================================
  // ANALYZE ALL DATASETS
  // ==========================================

  const analyzeDatasets = async () => {
    if (files.length === 0) {
      setError(
        "Please add at least one CSV file."
      );

      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAnalysisStage(0);
    setAnalysisProgress(8);
    setError("");

    try {
      const parsedDatasets = [];

      for (const file of files) {
        try {
          const dataset =
            await parseCSV(file);

          parsedDatasets.push(dataset);
        } catch (fileError) {
          console.error(
            `NEXUS FAILED TO PARSE: ${file.name}`,
            fileError
          );

          throw new Error(
            `${file.name}: ${
              fileError.message ||
              "Unable to read this CSV file."
            }`
          );
        }
      }

      if (parsedDatasets.length === 0) {
        throw new Error(
          "No usable datasets were found."
        );
      }

      console.log(
        "================================="
      );

      console.log(
        "NEXUS MULTI-DATASET ANALYSIS"
      );

      console.log(
        "Datasets:",
        parsedDatasets
      );

      console.log(
        "Dataset count:",
        parsedDatasets.length
      );

      console.log(
        "================================="
      );

      // ----------------------------------------
      // SEND REAL DATA TO APP
      // ----------------------------------------

      if (onAnalyze) {
        onAnalyze(parsedDatasets);
      }

      // ----------------------------------------
      // SHOW COMPLETION STATE
      // ----------------------------------------

      setAnalysisStage(5);
      setAnalysisProgress(100);

      setTimeout(() => {
        setAnalysisComplete(true);
      }, 300);
    } catch (analysisError) {
      console.error(
        "NEXUS ANALYSIS ERROR:",
        analysisError
      );

      setError(
        analysisError.message ||
          "Unable to analyze one or more CSV files."
      );

      setIsAnalyzing(false);
    }
  };

  // ==========================================
  // DATASET SELECTOR
  // ==========================================

  const handleDatasetSelect = (index) => {
    if (
      datasets.length > 0 &&
      onSelectDataset
    ) {
      onSelectDataset(index);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      {/* ======================================
          UPLOAD WORKSPACE
      ====================================== */}

      <div
        className="upload-card"
        onDragOver={(event) =>
          event.preventDefault()
        }
        onDrop={handleDrop}
      >
        {/* HEADER */}

        <div className="upload-icon">
          <Upload size={24} />
        </div>

        {files.length === 0 ? (
          <>
            <h2>
              Drop your CSV files here
            </h2>

            <p>
              Upload one or two datasets
              for intelligent analysis
            </p>
          </>
        ) : (
          <>
            <div className="success-icon">
              <CheckCircle2 size={28} />
            </div>

            <h2>
              {files.length}{" "}
              {files.length === 1
                ? "dataset"
                : "datasets"}{" "}
              ready
            </h2>

            <p>
              NEXUS is ready to analyze
              your data
            </p>
          </>
        )}

        {/* FILE LIST */}

        {files.length > 0 && (
          <motion.div
            className="multi-file-list"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            {files.map(
              (file, index) => {
                const analyzedDataset =
                  datasets[index];

                const isActive =
                  datasets.length > 0 &&
                  index ===
                    activeDatasetIndex;

                return (
                  <motion.div
                    key={`${file.name}-${index}`}
                    className={`file-info ${
                      isActive
                        ? "active-dataset-file"
                        : ""
                    }`}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.25,
                      delay:
                        index * 0.05,
                    }}
                    onClick={() =>
                      handleDatasetSelect(
                        index
                      )
                    }
                    style={{
                      cursor:
                        datasets.length > 0
                          ? "pointer"
                          : "default",
                    }}
                  >
                    <div className="dataset-file-icon">
                      {datasets.length >
                      0 ? (
                        <Database
                          size={20}
                        />
                      ) : (
                        <FileText
                          size={20}
                        />
                      )}
                    </div>

                    <div>
                      <strong>
                        {file.name}
                      </strong>

                      <span>
                        {analyzedDataset
                          ? `${analyzedDataset.rowCount.toLocaleString()} records • ${analyzedDataset.columnCount} variables`
                          : `${(
                              file.size /
                              1024 /
                              1024
                            ).toFixed(
                              2
                            )} MB`}
                      </span>
                    </div>

                    {isActive && (
                      <span className="dataset-active-badge">
                        ACTIVE
                      </span>
                    )}

                    <button
                      className="remove-file"
                      onClick={(event) => {
                        event.stopPropagation();

                        removeFile(index);
                      }}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={18} />
                    </button>
                  </motion.div>
                );
              }
            )}
          </motion.div>
        )}

        {/* ACTIVE DATASET MESSAGE */}

        {datasets.length > 1 && (
          <motion.div
            className="dataset-switch-hint"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
          >
            <Database size={15} />

            <span>
              Click a dataset above to
              explore it
            </span>
          </motion.div>
        )}

        {/* FILE INPUT */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          multiple
          onChange={handleInputChange}
          hidden
        />

        {/* ADD BUTTON */}

        {files.length < MAX_FILES && (
          <button
            className="upload-button"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <Plus size={17} />

            {files.length === 0
              ? "Choose CSV files"
              : "Add another CSV"}
          </button>
        )}

        {/* FILE COUNT */}

        <span className="upload-note">
          {files.length}/{MAX_FILES} datasets
          added • CSV files up to 500 MB each
        </span>

        {/* ERROR */}

        {error && (
          <div className="upload-error">
            {error}
          </div>
        )}

        {/* ANALYZE BUTTON */}
{files.length > 0 && (
  <motion.button
    className={`analyze-button ${
      isAnalyzing ? "analyze-button-loading" : ""
    }`}
    onClick={analyzeDatasets}
    disabled={isAnalyzing}
    whileHover={
      !isAnalyzing
        ? {
            y: -1,
            transition: {
              duration: 0.25,
              ease: "easeOut",
            },
          }
        : {}
    }
    whileTap={
      !isAnalyzing
        ? {
            scale: 0.985,
            y: 0,
          }
        : {}
    }
  >
    <span className="analyze-button-sheen" />

    <span className="analyze-button-content">
      {isAnalyzing ? (
        <>
          <span className="analyze-orb" />

          {`Analyzing ${files.length} ${
            files.length === 1
              ? "dataset"
              : "datasets"
          }...`}
        </>
      ) : (
        <>
          Analyze {files.length}{" "}
          {files.length === 1
            ? "dataset"
            : "datasets"}
        </>
      )}
    </span>
  </motion.button>
)}

      </div>   {/* ← THIS WAS MISSING */}

      {/* ======================================
          NEXUS ANALYSIS OVERLAY
      ====================================== */}

      <AnimatePresence></AnimatePresence>

      {/* ======================================
          NEXUS ANALYSIS OVERLAY
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
              transition: {
                duration: 0.8,
              },
            }}
          >
            {/* BACKGROUND */}

            <div className="analysis-background-grid" />

            <div className="analysis-background-glow" />

            {/* MAIN CARD */}

            <motion.div
              className={`nexus-analysis-modal ${
                analysisComplete
                  ? "analysis-complete"
                  : ""
              }`}
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
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* TOP LABEL */}

              <div className="analysis-engine-label">
                <span className="analysis-live-dot" />

                NEXUS INTELLIGENCE ENGINE
              </div>

              {/* CORE */}

              <motion.div
                className="nexus-analysis-core"
                animate={
                  analysisComplete
                    ? {
                        scale: [
                          1,
                          1.08,
                          1,
                        ],
                      }
                    : {
                        scale: [
                          1,
                          1.025,
                          1,
                        ],
                      }
                }
                transition={{
                  duration: analysisComplete
                    ? 0.7
                    : 2.2,
                  repeat: analysisComplete
                    ? 0
                    : Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="analysis-orbit orbit-one" />
                <div className="analysis-orbit orbit-two" />

                <div className="analysis-core-inner">
                  <Sparkles
                    size={48}
                    strokeWidth={1.6}
                  />
                </div>
              </motion.div>

              {/* TITLE */}

              <motion.h2
                key={
                  analysisComplete
                    ? "complete"
                    : "running"
                }
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.35,
                }}
              >
                {analysisComplete
                  ? "ANALYSIS COMPLETE"
                  : "ANALYZING YOUR DATA"}
              </motion.h2>

              <motion.p
                key={
                  analysisComplete
                    ? "complete-description"
                    : "running-description"
                }
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.4,
                }}
              >
                {analysisComplete
                  ? "Your dataset has been transformed into actionable intelligence."
                  : "NEXUS is transforming your data into business intelligence."}
              </motion.p>

              {/* PROGRESS */}

              <div className="analysis-progress">
                <motion.div
                  className="analysis-progress-fill"
                  animate={{
                    width: `${analysisProgress}%`,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                />
              </div>

              {/* STAGES */}

              <div className="analysis-stages">
                {analysisStages.map(
                  (stage, index) => {
                    const completed =
                      index <
                      analysisStage;

                    const active =
                      index ===
                      analysisStage;

                    return (
                      <motion.div
                        key={stage}
                        className={`analysis-stage ${
                          completed
                            ? "stage-complete"
                            : ""
                        } ${
                          active
                            ? "stage-active"
                            : ""
                        }`}
                        initial={{
                          opacity: 0,
                          x: -8,
                        }}
                        animate={{
                          opacity:
                            index <=
                            analysisStage
                              ? 1
                              : 0.25,
                          x: 0,
                        }}
                        transition={{
                          duration: 0.35,
                          delay:
                            index * 0.03,
                        }}
                      >
                        <span className="stage-indicator">
                          {completed ||
                          analysisComplete ||
                          index ===
                            analysisStage
                            ? "✓"
                            : "•"}
                        </span>

                        <span>
                          {stage}
                        </span>
                      </motion.div>
                    );
                  }
                )}
              </div>

              {/* FOOTER */}

              <div className="analysis-modal-footer">
                <span>
                  {analysisComplete
                    ? "INTELLIGENCE READY"
                    : "PROCESSING DATA"}
                </span>

                <span>
                  {Math.round(
                    analysisProgress
                  )}
                  %
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default DatasetWorkspace;