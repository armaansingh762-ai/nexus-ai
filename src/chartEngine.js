// ============================================
// NEXUS CHART ENGINE
// Intelligent business visualization engine.
// ============================================


// ============================================
// COLUMN TYPE DETECTION
// ============================================

export function getColumnTypes(data) {
  if (!data || data.length === 0) {
    return {
      numeric: [],
      categorical: [],
      date: []
    };
  }

  const columns = Object.keys(data[0]);

  const numeric = [];
  const categorical = [];
  const date = [];

  columns.forEach((column) => {
    const values = data
      .map((row) => row[column])
      .filter(
        (value) =>
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
      );

    if (values.length === 0) return;

    const lowerColumn =
      column.toLowerCase();

    // ------------------------------------------
    // ID DETECTION
    // ------------------------------------------

    const looksLikeId =
      lowerColumn === "id" ||
      lowerColumn.endsWith("id") ||
      lowerColumn.includes("uuid") ||
      lowerColumn.includes("identifier");

    // ------------------------------------------
    // NUMERIC DETECTION
    // ------------------------------------------

    const numericValues = values.filter(
      (value) =>
        typeof value === "number" ||
        (
          !isNaN(Number(value)) &&
          String(value).trim() !== ""
        )
    );

    const numericRatio =
      numericValues.length /
      values.length;

    // ------------------------------------------
    // DATE DETECTION
    // ------------------------------------------

    const dateKeywords = [
      "date",
      "time",
      "month",
      "year",
      "day",
      "timestamp",
      "created",
      "updated"
    ];

    const looksLikeDateColumn =
      dateKeywords.some((keyword) =>
        lowerColumn.includes(keyword)
      );

    const dateValues = values.filter(
      (value) => {
        const stringValue =
          String(value).trim();

        // Pure numbers are never dates.
        if (
          /^\d+(\.\d+)?$/.test(
            stringValue
          )
        ) {
          return false;
        }

        const parsed =
          Date.parse(stringValue);

        return !isNaN(parsed);
      }
    );

    const dateRatio =
      dateValues.length /
      values.length;

    // ------------------------------------------
    // UNIQUE VALUES
    // ------------------------------------------

    const uniqueValues =
      new Set(values).size;

    // ------------------------------------------
    // DATE COLUMN
    // ------------------------------------------

    if (
      !looksLikeId &&
      (
        (
          looksLikeDateColumn &&
          dateRatio >= 0.5
        ) ||
        dateRatio >= 0.8
      )
    ) {
      date.push(column);
      return;
    }

    // ------------------------------------------
    // NUMERIC COLUMN
    // ------------------------------------------

    if (
      !looksLikeId &&
      numericRatio >= 0.8
    ) {
      numeric.push(column);
      return;
    }

    // ------------------------------------------
    // CATEGORICAL COLUMN
    // ------------------------------------------

    if (
      !looksLikeId &&
      uniqueValues >= 2 &&
      uniqueValues <= 20
    ) {
      categorical.push(column);
    }
  });

  return {
    numeric,
    categorical,
    date
  };
}


// ============================================
// METRIC SEMANTICS
// ============================================

function getMetricType(
  column
) {
  if (!column) {
    return "average";
  }

  const name =
    column.toLowerCase();

  // ------------------------------------------
  // ADDITIVE BUSINESS METRICS
  // These make sense as totals.
  // ------------------------------------------

  const sumKeywords = [
    "revenue",
    "sales",
    "profit",
    "amount",
    "income",
    "total",
    "price",
    "cost",
    "spend",
    "quantity",
    "units",
    "volume"
  ];

  if (
    sumKeywords.some((keyword) =>
      name.includes(keyword)
    )
  ) {
    return "sum";
  }

  // ------------------------------------------
  // MEASUREMENT / SCORE METRICS
  // These are usually more meaningful
  // as averages across groups.
  // ------------------------------------------

  const averageKeywords = [
    "age",
    "salary",
    "rating",
    "score",
    "satisfaction",
    "tenure",
    "duration",
    "charge",
    "charges",
    "value",
    "balance",
    "distance",
    "rate",
    "percentage",
    "percent"
  ];

  if (
    averageKeywords.some((keyword) =>
      name.includes(keyword)
    )
  ) {
    return "average";
  }

  // ------------------------------------------
  // DEFAULT
  // ------------------------------------------

  return "average";
}


// ============================================
// FIND BUSINESS METRIC
// ============================================

export function findBusinessMetric(
  numericColumns
) {
  if (
    !numericColumns ||
    numericColumns.length === 0
  ) {
    return null;
  }

  const priorityKeywords = [
    "revenue",
    "sales",
    "profit",
    "amount",
    "income",
    "total",
    "value",
    "price",
    "cost",
    "charge",
    "spend",
    "salary",
    "score",
    "rating",
    "satisfaction",
    "tenure",
    "age"
  ];

  for (
    const keyword of priorityKeywords
  ) {
    const match =
      numericColumns.find(
        (column) =>
          column
            .toLowerCase()
            .includes(keyword)
      );

    if (match) {
      return match;
    }
  }

  return numericColumns[0] || null;
}


// ============================================
// FIND BEST CATEGORY
// ============================================

export function findBestCategory(
  data,
  categoricalColumns
) {
  if (
    !data ||
    data.length === 0 ||
    categoricalColumns.length === 0
  ) {
    return null;
  }

  const preferredKeywords = [
    "gender",
    "segment",
    "category",
    "region",
    "country",
    "city",
    "state",
    "department",
    "product",
    "service",
    "plan",
    "contract",
    "type",
    "status",
    "channel",
    "payment",
    "internet"
  ];

  const candidates =
    categoricalColumns
      .map((column) => {
        const values = data
          .map(
            (row) =>
              row[column]
          )
          .filter(
            (value) =>
              value !== undefined &&
              value !== null &&
              String(value).trim() !== ""
          );

        const uniqueValues =
          new Set(values).size;

        const keywordScore =
          preferredKeywords.some(
            (keyword) =>
              column
                .toLowerCase()
                .includes(keyword)
          )
            ? 10
            : 0;

        return {
          column,
          uniqueValues,
          keywordScore
        };
      })
      .filter(
        (item) =>
          item.uniqueValues >= 2 &&
          item.uniqueValues <= 12
      )
      .sort(
        (a, b) => {
          if (
            b.keywordScore !==
            a.keywordScore
          ) {
            return (
              b.keywordScore -
              a.keywordScore
            );
          }

          return (
            a.uniqueValues -
            b.uniqueValues
          );
        }
      );

  return (
    candidates[0]?.column ||
    null
  );
}


// ============================================
// DETERMINE BEST CHART
// ============================================

export function determineChart(
  data
) {
  const types =
    getColumnTypes(data);

  const {
    numeric,
    categorical,
    date
  } = types;

  // ------------------------------------------
  // DATE + NUMERIC
  // → LINE CHART
  // ------------------------------------------

  if (
    date.length > 0 &&
    numeric.length > 0
  ) {
    const metric =
      findBusinessMetric(
        numeric
      );

    const aggregation =
      getMetricType(metric);

    return {
      type: "line",

      dimension: date[0],

      metric,

      aggregation,

      reason:
        aggregation === "sum"
          ? `NEXUS detected a genuine time-based variable and selected total ${metric} to reveal how the business metric changes over time.`
          : `NEXUS detected a genuine time-based variable and selected average ${metric} to reveal how the typical value changes over time.`
    };
  }


  // ------------------------------------------
  // CATEGORY + NUMERIC
  // → BAR CHART
  // ------------------------------------------

  if (
    categorical.length > 0 &&
    numeric.length > 0
  ) {
    const dimension =
      findBestCategory(
        data,
        categorical
      );

    const metric =
      findBusinessMetric(
        numeric
      );

    const aggregation =
      getMetricType(metric);

    let reason;

    if (
      aggregation === "sum"
    ) {
      reason =
        `NEXUS selected ${dimension} as the comparison dimension and total ${metric} as the primary business measure because this metric is naturally additive.`;
    } else {
      reason =
        `NEXUS selected ${dimension} as the comparison dimension and average ${metric} because comparing typical values across groups is more meaningful than allowing group size to dominate the result.`;
    }

    return {
      type: "bar",

      dimension,

      metric,

      aggregation,

      reason
    };
  }


  // ------------------------------------------
  // CATEGORY ONLY
  // → BAR CHART
  // ------------------------------------------

  if (
    categorical.length > 0
  ) {
    return {
      type: "bar",

      dimension:
        findBestCategory(
          data,
          categorical
        ),

      metric: null,

      aggregation: "count",

      reason:
        "NEXUS detected a categorical variable without a suitable numeric metric, so it created a distribution based on record count."
    };
  }


  // ------------------------------------------
  // TWO NUMERIC VARIABLES
  // → SCATTER CHART
  // ------------------------------------------

  if (
    numeric.length >= 2
  ) {
    return {
      type: "scatter",

      dimension:
        numeric[0],

      metric:
        numeric[1],

      aggregation: null,

      reason:
        `NEXUS detected multiple numeric variables and selected a relationship analysis to explore whether ${numeric[0]} and ${numeric[1]} move together.`
    };
  }


  // ------------------------------------------
  // FALLBACK
  // ------------------------------------------

  return {
    type: null,

    dimension: null,

    metric: null,

    aggregation: null,

    reason:
      "NEXUS could not determine a suitable visualization for this dataset."
  };
}


// ============================================
// CREATE CHART DATA
// ============================================

export function buildChartData(
  data,
  configuration
) {
  if (
    !data ||
    data.length === 0 ||
    !configuration
  ) {
    return [];
  }

  const {
    type,
    dimension,
    metric,
    aggregation
  } = configuration;


  // ==========================================
  // BAR CHART
  // ==========================================

  if (
    type === "bar"
  ) {
    const groups = {};

    data.forEach((row) => {
      const category =
        row[dimension];

      if (
        category === undefined ||
        category === null ||
        String(category).trim() === ""
      ) {
        return;
      }

      const key =
        String(category);

      if (!groups[key]) {
        groups[key] = {
          name: key,
          values: []
        };
      }

      // ----------------------------------------
      // COUNT
      // ----------------------------------------

      if (
        aggregation === "count"
      ) {
        groups[key].values.push(
          1
        );

        return;
      }

      // ----------------------------------------
      // NUMERIC VALUE
      // ----------------------------------------

      if (metric) {
        const numericValue =
          Number(
            row[metric]
          );

        if (
          Number.isFinite(
            numericValue
          )
        ) {
          groups[key].values.push(
            numericValue
          );
        }
      }
    });


    return Object.values(
      groups
    )
      .map(
        (group) => {
          let value = 0;

          // --------------------------------------
          // SUM
          // --------------------------------------

          if (
            aggregation ===
            "sum"
          ) {
            value =
              group.values.reduce(
                (
                  sum,
                  current
                ) =>
                  sum + current,
                0
              );
          }

          // --------------------------------------
          // AVERAGE
          // --------------------------------------

          else if (
            aggregation ===
            "average"
          ) {
            value =
              group.values.length
                ? group.values.reduce(
                    (
                      sum,
                      current
                    ) =>
                      sum + current,
                    0
                  ) /
                  group.values.length
                : 0;
          }

          // --------------------------------------
          // COUNT
          // --------------------------------------

          else {
            value =
              group.values.length;
          }

          return {
            name:
              group.name,

            value
          };
        }
      )
      .sort(
        (a, b) =>
          b.value -
          a.value
      )
      .slice(0, 10);
  }


  // ==========================================
  // LINE CHART
  // ==========================================

  if (
    type === "line"
  ) {
    const groups = {};

    data.forEach((row) => {
      const dateValue =
        row[dimension];

      const numericValue =
        Number(
          row[metric]
        );

      if (
        !dateValue ||
        !Number.isFinite(
          numericValue
        )
      ) {
        return;
      }

      const key =
        String(dateValue);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(
        numericValue
      );
    });


    return Object.entries(
      groups
    )
      .map(
        ([
          name,
          values
        ]) => {
          let value;

          if (
            aggregation ===
            "sum"
          ) {
            value =
              values.reduce(
                (
                  sum,
                  current
                ) =>
                  sum + current,
                0
              );
          } else {
            value =
              values.reduce(
                (
                  sum,
                  current
                ) =>
                  sum + current,
                0
              ) /
              values.length;
          }

          return {
            name,
            value
          };
        }
      )
      .sort(
        (a, b) =>
          new Date(a.name) -
          new Date(b.name)
      )
      .slice(0, 100);
  }


  // ==========================================
  // SCATTER CHART
  // ==========================================

  if (
    type === "scatter"
  ) {
    return data
      .map((row) => ({
        x: Number(
          row[dimension]
        ),

        y: Number(
          row[metric]
        )
      }))
      .filter(
        (row) =>
          Number.isFinite(
            row.x
          ) &&
          Number.isFinite(
            row.y
          )
      )
      .slice(0, 500);
  }


  return [];
}