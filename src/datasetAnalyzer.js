// ============================================================
// NEXUS INTELLIGENCE — DATASET ANALYZER
// ============================================================

export function analyzeDataset(dataset) {
  if (
    !dataset ||
    !Array.isArray(dataset.rows) ||
    !Array.isArray(dataset.columns)
  ) {
    return {
      rowCount: 0,
      columnCount: 0,
      numericColumns: [],
      categoricalColumns: [],
      dateColumns: [],
      binaryColumns: [],
      idColumns: [],
      constantColumns: [],
      missingValues: 0,
      missingPercentage: 0,
      duplicateRows: 0,
      duplicatePercentage: 0,
      qualityScore: 0,
      columnTypes: {},
      uniqueCounts: {},
      datasetType: "general",
    };
  }

  const { rows, columns } = dataset;

  const rowCount = rows.length;
  const columnCount = columns.length;

  // ==========================================================
  // STORAGE
  // ==========================================================

  let missingValues = 0;

  const numericColumns = [];
  const categoricalColumns = [];
  const dateColumns = [];
  const binaryColumns = [];
  const idColumns = [];
  const constantColumns = [];

  const columnTypes = {};
  const uniqueCounts = {};

  // ==========================================================
  // MISSING VALUES
  // ==========================================================

  columns.forEach((column) => {
    rows.forEach((row) => {
      const value = row[column];

      if (isMissing(value)) {
        missingValues++;
      }
    });
  });

  const totalCells =
    rowCount * columnCount;

  const missingPercentage =
    totalCells > 0
      ? (missingValues / totalCells) * 100
      : 0;

  // ==========================================================
  // DUPLICATES
  // ==========================================================

  const uniqueRows = new Set(
    rows.map((row) =>
      JSON.stringify(row)
    )
  );

  const duplicateRows =
    rowCount - uniqueRows.size;

  const duplicatePercentage =
    rowCount > 0
      ? (duplicateRows / rowCount) * 100
      : 0;

  // ==========================================================
  // COLUMN ANALYSIS
  // ==========================================================

  columns.forEach((column) => {
    const values = rows
      .map((row) => row[column])
      .filter(
        (value) => !isMissing(value)
      );

    // --------------------------------------------------------
    // UNIQUE VALUES
    // --------------------------------------------------------

    const uniqueValues = [
      ...new Set(
        values.map((value) =>
          normalizeValue(value)
        )
      ),
    ];

    uniqueCounts[column] =
      uniqueValues.length;

    // --------------------------------------------------------
    // EMPTY COLUMN
    // --------------------------------------------------------

    if (values.length === 0) {
      columnTypes[column] = "empty";

      categoricalColumns.push(
        column
      );

      return;
    }

    // --------------------------------------------------------
    // CONSTANT COLUMN
    // --------------------------------------------------------

    if (uniqueValues.length === 1) {
      constantColumns.push(
        column
      );

      columnTypes[column] =
        "constant";

      categoricalColumns.push(
        column
      );

      return;
    }

    // --------------------------------------------------------
    // DATE DETECTION
    // --------------------------------------------------------

    if (
      looksLikeDateColumn(
        column,
        values
      )
    ) {
      dateColumns.push(
        column
      );

      columnTypes[column] =
        "date";

      return;
    }

    // --------------------------------------------------------
    // NUMERIC DETECTION
    // --------------------------------------------------------

    const numericValues =
      values.filter((value) =>
        isNumeric(value)
      );

    const numericRatio =
      numericValues.length /
      values.length;

    if (numericRatio >= 0.8) {
      // ------------------------------------------------------
      // BINARY NUMERIC COLUMN
      // ------------------------------------------------------

      const numericUnique = [
        ...new Set(
          numericValues.map(
            (value) =>
              Number(value)
          )
        ),
      ];

      if (
        numericUnique.length === 2 &&
        numericUnique.every(
          (value) =>
            value === 0 ||
            value === 1
        )
      ) {
        binaryColumns.push(
          column
        );

        columnTypes[column] =
          "binary";

        return;
      }

      numericColumns.push(
        column
      );

      columnTypes[column] =
        "numeric";

      // IMPORTANT:
      // Do not use "continue" here because
      // this is a forEach callback.
      return;
    }

    // --------------------------------------------------------
    // BINARY CATEGORICAL
    // --------------------------------------------------------

    if (
      uniqueValues.length === 2
    ) {
      binaryColumns.push(
        column
      );

      columnTypes[column] =
        "binary";

      return;
    }

    // --------------------------------------------------------
    // ID DETECTION
    // --------------------------------------------------------

    if (
      looksLikeIdColumn(
        column,
        values,
        uniqueValues
      )
    ) {
      idColumns.push(
        column
      );

      columnTypes[column] =
        "identifier";

      // IMPORTANT:
      // Do not use "continue" here because
      // this is a forEach callback.
      return;
    }

    // --------------------------------------------------------
    // CATEGORICAL
    // --------------------------------------------------------

    categoricalColumns.push(
      column
    );

    columnTypes[column] =
      "categorical";
  });

  // ==========================================================
  // DATA QUALITY SCORE
  // ==========================================================

  const missingPenalty =
    Math.min(
      missingPercentage,
      30
    );

  const duplicatePenalty =
    Math.min(
      duplicatePercentage,
      20
    );

  const qualityScore =
    Math.max(
      0,
      Math.round(
        100 -
          missingPenalty -
          duplicatePenalty
      )
    );

  // ==========================================================
  // DATASET TYPE
  // ==========================================================

  let datasetType =
    "general";

  if (
    dateColumns.length > 0 &&
    numericColumns.length > 0
  ) {
    datasetType =
      "time-series";
  } else if (
    numericColumns.length > 0 &&
    categoricalColumns.length > 0
  ) {
    datasetType =
      "business";
  } else if (
    categoricalColumns.length > 0
  ) {
    datasetType =
      "categorical";
  } else if (
    numericColumns.length > 0
  ) {
    datasetType =
      "numeric";
  }

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    rowCount,
    columnCount,

    numericColumns,
    categoricalColumns,

    missingValues,

    missingPercentage:
      Number(
        missingPercentage.toFixed(
          2
        )
      ),

    duplicateRows,

    duplicatePercentage:
      Number(
        duplicatePercentage.toFixed(
          2
        )
      ),

    qualityScore,

    // NEXUS intelligence fields
    dateColumns,
    binaryColumns,
    idColumns,
    constantColumns,

    columnTypes,
    uniqueCounts,

    datasetType,
  };
}

// ============================================================
// MISSING VALUE DETECTION
// ============================================================

function isMissing(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  if (
    typeof value === "string"
  ) {
    const normalized =
      value
        .trim()
        .toLowerCase();

    return (
      normalized === "" ||
      normalized === "null" ||
      normalized === "undefined" ||
      normalized === "n/a" ||
      normalized === "na" ||
      normalized === "nan"
    );
  }

  return false;
}

// ============================================================
// VALUE NORMALIZATION
// ============================================================

function normalizeValue(value) {
  if (
    typeof value === "string"
  ) {
    return value
      .trim()
      .toLowerCase();
  }

  return value;
}

// ============================================================
// NUMERIC DETECTION
// ============================================================

function isNumeric(value) {
  if (
    typeof value === "number"
  ) {
    return Number.isFinite(
      value
    );
  }

  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const cleaned =
    value
      .replace(/,/g, "")
      .replace(/%/g, "")
      .trim();

  if (!cleaned) {
    return false;
  }

  return Number.isFinite(
    Number(cleaned)
  );
}

// ============================================================
// DATE DETECTION
// ============================================================

function looksLikeDateColumn(
  column,
  values
) {
  const columnName =
    String(column)
      .toLowerCase()
      .replace(/[_-]/g, " ");

  const dateKeywords = [
    "date",
    "time",
    "timestamp",
    "created",
    "updated",
    "modified",
    "month",
    "year",
    "day",
    "week",
    "quarter",
    "period",
    "dob",
    "birth",
    "signup",
    "purchase",
    "transaction",
    "order date",
    "start date",
    "end date",
  ];

  const nameSuggestsDate =
    dateKeywords.some(
      (keyword) =>
        columnName.includes(
          keyword
        )
    );

  const sample =
    values.slice(
      0,
      Math.min(
        values.length,
        100
      )
    );

  let validDates = 0;

  sample.forEach(
    (value) => {
      if (
        value instanceof Date &&
        !Number.isNaN(
          value.getTime()
        )
      ) {
        validDates++;
        return;
      }

      if (
        typeof value !==
        "string"
      ) {
        return;
      }

      const trimmed =
        value.trim();

      if (!trimmed) {
        return;
      }

      // Avoid treating ordinary numbers as dates.
      if (
        /^[0-9]+$/.test(
          trimmed
        )
      ) {
        return;
      }

      const parsed =
        Date.parse(
          trimmed
        );

      if (
        !Number.isNaN(
          parsed
        )
      ) {
        validDates++;
      }
    }
  );

  const dateRatio =
    sample.length > 0
      ? validDates /
        sample.length
      : 0;

  return (
    dateRatio >= 0.8 ||
    (nameSuggestsDate &&
      dateRatio >= 0.5)
  );
}

// ============================================================
// ID DETECTION
// ============================================================

function looksLikeIdColumn(
  column,
  values,
  uniqueValues
) {
  const columnName =
    String(column)
      .toLowerCase()
      .replace(/[_-]/g, " ");

  const idKeywords = [
    "id",
    "identifier",
    "uuid",
    "guid",
    "customer number",
    "customer no",
    "account number",
    "account no",
    "transaction id",
    "order id",
    "user id",
    "record id",
  ];

  const nameSuggestsId =
    idKeywords.some(
      (keyword) =>
        columnName ===
          keyword ||
        columnName.endsWith(
          ` ${keyword}`
        ) ||
        columnName.includes(
          `${keyword} `
        )
    );

  const uniquenessRatio =
    values.length > 0
      ? uniqueValues.length /
        values.length
      : 0;

  const highUniqueness =
    uniquenessRatio >=
    0.95;

  return (
    nameSuggestsId &&
    highUniqueness
  );
}