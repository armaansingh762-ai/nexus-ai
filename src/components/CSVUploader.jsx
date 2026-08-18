import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  X,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import Papa from "papaparse";

function CSVUploader({ onAnalyze }) {
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  // ==========================================
  // VALIDATE FILE
  // ==========================================

  const validateFile = (file) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return "Only CSV files are supported.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is larger than 50 MB.`;
    }

    return null;
  };

  // ==========================================
  // ADD FILES
  // ==========================================

  const addFiles = (selectedFiles) => {
    setError("");

    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    const incomingFiles = Array.from(selectedFiles);

    // Validate every file
    for (const file of incomingFiles) {
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Prevent duplicate filenames
    const existingNames = new Set(
      files.map((file) => file.name)
    );

    const newFiles = incomingFiles.filter(
      (file) => !existingNames.has(file.name)
    );

    if (newFiles.length === 0) {
      setError("Those CSV files have already been added.");
      return;
    }

    // Maximum dataset limit
    if (
      files.length + newFiles.length >
      MAX_FILES
    ) {
      setError(
        `NEXUS currently supports up to ${MAX_FILES} CSV files at once.`
      );
      return;
    }

    setFiles((currentFiles) => [
      ...currentFiles,
      ...newFiles,
    ]);

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // FILE INPUT
  // ==========================================

  const handleInputChange = (event) => {
    addFiles(event.target.files);
  };

  // ==========================================
  // DRAG & DROP
  // ==========================================

  const handleDrop = (event) => {
    event.preventDefault();

    addFiles(event.dataTransfer.files);
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
  // ANALYZE ALL DATASETS
  // ==========================================

  const analyzeDatasets = async () => {
    if (files.length === 0) {
      setError("Please add at least one CSV file.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const parsedDatasets = [];

      for (const file of files) {
        const dataset = await new Promise(
          (resolve, reject) => {
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: true,

              complete: (results) => {
                if (
                  results.errors &&
                  results.errors.length > 0
                ) {
                  console.error(
                    `CSV errors in ${file.name}:`,
                    results.errors
                  );
                }

                const rows = results.data || [];

                const columns =
                  results.meta.fields || [];

                resolve({
                  fileName: file.name,
                  fileSize: file.size,
                  rows,
                  columns,
                  rowCount: rows.length,
                  columnCount: columns.length,
                });
              },

              error: (parseError) => {
                reject(parseError);
              },
            });
          }
        );

        parsedDatasets.push(dataset);
      }

      console.log(
        "NEXUS DATASETS:",
        parsedDatasets
      );

      // Send all datasets to App.jsx
      onAnalyze?.(parsedDatasets);

    } catch (parseError) {
      console.error(
        "NEXUS MULTI-DATASET ERROR:",
        parseError
      );

      setError(
        "Unable to analyze one or more CSV files."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (files.length === 0) {
    return (
      <div
        className="upload-card"
        onDragOver={(event) =>
          event.preventDefault()
        }
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <Upload size={24} />
        </div>

        <h2>
          Drop your CSV files here
        </h2>

        <p>
          Add one or multiple datasets to NEXUS
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          multiple
          onChange={handleInputChange}
          hidden
        />

        <button
          className="upload-button"
          onClick={() =>
            fileInputRef.current?.click()
          }
        >
          <Upload size={17} />
          Choose CSV files
        </button>

        <span className="upload-note">
          Up to 10 CSV files · 50 MB each
        </span>

        {error && (
          <div className="upload-error">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // FILES SELECTED
  // ==========================================

  return (
    <div
      className="upload-card"
      onDragOver={(event) =>
        event.preventDefault()
      }
      onDrop={handleDrop}
    >
      <motion.div
        className="file-success"
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
      >
        {/* SUCCESS ICON */}

        <div className="success-icon">
          <CheckCircle2 size={28} />
        </div>

        {/* TITLE */}

        <h2>
          {files.length}{" "}
          {files.length === 1
            ? "dataset"
            : "datasets"}{" "}
          ready
        </h2>

        {/* FILE LIST */}

        <div className="multi-file-list">
          {files.map((file, index) => (
            <motion.div
              key={`${file.name}-${index}`}
              className="file-info"
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
              }}
            >
              <FileText size={20} />

              <div>
                <strong>
                  {file.name}
                </strong>

                <span>
                  {(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </span>
              </div>

              <button
                className="remove-file"
                onClick={() =>
                  removeFile(index)
                }
                aria-label={`Remove ${file.name}`}
              >
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* ADD MORE */}

        {files.length < MAX_FILES && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              multiple
              onChange={handleInputChange}
              hidden
            />

            <button
              className="upload-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <Plus size={18} />
              Add another CSV
            </button>
          </>
        )}

        {/* ERROR */}

        {error && (
          <div className="upload-error">
            {error}
          </div>
        )}

        {/* ANALYZE */}

        <button
          className="analyze-button"
          onClick={analyzeDatasets}
          disabled={isAnalyzing}
        >
          {isAnalyzing
            ? `Analyzing ${files.length} datasets...`
            : `Analyze ${files.length} ${
                files.length === 1
                  ? "dataset"
                  : "datasets"
              }`}
        </button>
      </motion.div>
    </div>
  );
}

export default CSVUploader;