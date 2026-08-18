// ============================================================
// NEXUS INTELLIGENCE — PATTERN DETECTION ENGINE
// ============================================================
//
// Detects:
// 1. Numeric correlations
// 2. Category concentration
// 3. Business targets
// 4. Date-aware trends
// 5. Outliers
// 6. Numeric variability
// 7. Category imbalance
// 8. High-cardinality fields
// 9. Segment performance
// 10. Outcome / target segment relationships
// 11. Data-quality signals
//
// IMPORTANT:
// NEXUS NEVER treats arbitrary row order as time.
// Trends require an actual date/time column.
// ============================================================

export function detectPatterns(
  dataset,
  analysis
) {
  if (
    !dataset ||
    !Array.isArray(dataset.rows) ||
    dataset.rows.length === 0 ||
    !analysis
  ) {
    return [];
  }

  const {
    rows = [],
    columns = [],
  } = dataset;

  const patterns = [];

  // ==========================================================
  // ANALYSIS METADATA
  // ==========================================================

  const numericColumns =
    Array.isArray(
      analysis.numericColumns
    )
      ? analysis.numericColumns
      : [];

  const categoricalColumns =
    Array.isArray(
      analysis.categoricalColumns
    )
      ? analysis.categoricalColumns
      : [];

  const dateColumns =
    Array.isArray(
      analysis.dateColumns
    )
      ? analysis.dateColumns
      : [];

  const binaryColumns =
    Array.isArray(
      analysis.binaryColumns
    )
      ? analysis.binaryColumns
      : [];

  const idColumns =
    Array.isArray(
      analysis.idColumns
    )
      ? analysis.idColumns
      : [];

  const constantColumns =
    Array.isArray(
      analysis.constantColumns
    )
      ? analysis.constantColumns
      : [];

  // ==========================================================
  // CONFIGURATION
  // ==========================================================

  const MAX_SAMPLE_SIZE = 10000;

  const MAX_CORRELATION_COLUMNS = 12;

  const MAX_CATEGORY_COLUMNS = 15;

  const CORRELATION_THRESHOLD = 0.7;

  const CONCENTRATION_THRESHOLD = 0.4;

  const TREND_THRESHOLD = 0.25;

  const SEGMENT_DIFFERENCE_THRESHOLD = 25;

  // ==========================================================
  // SAMPLE LARGE DATASETS
  // ==========================================================

  const sampledRows =
    rows.length > MAX_SAMPLE_SIZE
      ? sampleRows(
          rows,
          MAX_SAMPLE_SIZE
        )
      : rows;

  // ==========================================================
  // HELPER: EXCLUDE IDENTIFIERS
  // ==========================================================

  const analyticalNumericColumns =
    numericColumns.filter(
      (column) =>
        !idColumns.includes(
          column
        ) &&
        !constantColumns.includes(
          column
        )
    );

  const analyticalCategoricalColumns =
    categoricalColumns.filter(
      (column) =>
        !idColumns.includes(
          column
        ) &&
        !constantColumns.includes(
          column
        )
    );

  // ==========================================================
  // 1. NUMERIC CORRELATIONS
  // ==========================================================

  const correlationColumns =
    analyticalNumericColumns.slice(
      0,
      MAX_CORRELATION_COLUMNS
    );

  for (
    let i = 0;
    i < correlationColumns.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < correlationColumns.length;
      j++
    ) {
      const columnA =
        correlationColumns[i];

      const columnB =
        correlationColumns[j];

      const valuesA = [];

      const valuesB = [];

      sampledRows.forEach(
        (row) => {
          const a = toNumber(
            row[columnA]
          );

          const b = toNumber(
            row[columnB]
          );

          if (
            Number.isFinite(a) &&
            Number.isFinite(b)
          ) {
            valuesA.push(a);
            valuesB.push(b);
          }
        }
      );

      if (
        valuesA.length < 20
      ) {
        continue;
      }

      const correlation =
        calculateCorrelation(
          valuesA,
          valuesB
        );

      const absoluteCorrelation =
        Math.abs(correlation);

      if (
        absoluteCorrelation <
        CORRELATION_THRESHOLD
      ) {
        continue;
      }

      const strength =
        absoluteCorrelation;

      const relationship =
        correlation >= 0
          ? "positive"
          : "negative";

      const strengthLabel =
        getCorrelationLabel(
          absoluteCorrelation
        );

      patterns.push({
        type: "correlation",

        strength,

        score:
          calculateBusinessScore(
            strength * 100,
            "correlation"
          ),

        title:
          correlation >= 0
            ? `${columnA} and ${columnB} move together`
            : `${columnA} and ${columnB} move in opposite directions`,

        description:
          correlation >= 0
            ? `${columnA} and ${columnB} show a ${strengthLabel.toLowerCase()} positive relationship with a correlation of ${correlation.toFixed(
                2
              )}.`
            : `${columnA} and ${columnB} show a ${strengthLabel.toLowerCase()} negative relationship with a correlation of ${correlation.toFixed(
                2
              )}.`,

        columns: [
          columnA,
          columnB,
        ],

        correlation:
          Number(
            correlation.toFixed(
              2
            )
          ),

        relationship,

        strengthLabel,

        sampleSize:
          valuesA.length,
      });
    }
  }

  // ==========================================================
  // 2. CATEGORY CONCENTRATION
  // ==========================================================

  analyticalCategoricalColumns
    .slice(
      0,
      MAX_CATEGORY_COLUMNS
    )
    .forEach(
      (column) => {
        const counts =
          {};

        sampledRows.forEach(
          (row) => {
            const value =
              normalizeCategoryValue(
                row[column]
              );

            if (
              value === null
            ) {
              return;
            }

            counts[value] =
              (counts[value] ||
                0) + 1;
          }
        );

        const entries =
          Object.entries(
            counts
          );

        if (
          entries.length < 2 ||
          entries.length > 30
        ) {
          return;
        }

        entries.sort(
          (a, b) =>
            b[1] - a[1]
        );

        const top =
          entries[0];

        const percentage =
          (top[1] /
            sampledRows.length) *
          100;

        if (
          percentage <
          CONCENTRATION_THRESHOLD *
            100
        ) {
          return;
        }

        patterns.push({
          type:
            "concentration",

          strength:
            percentage / 100,

          score:
            calculateBusinessScore(
              percentage,
              "concentration"
            ),

          title: `${column} is highly concentrated`,

          description: `${top[0]} represents ${percentage.toFixed(
            1
          )}% of the observed records in ${column}.`,

          column,

          value: top[0],

          percentage:
            Number(
              percentage.toFixed(
                1
              )
            ),

          categories:
            entries.length,
        });
      }
    );

  // ==========================================================
  // 3. BUSINESS TARGET DETECTION
  // ==========================================================

  const targetKeywords = [
    "churn",
    "revenue",
    "sales",
    "profit",
    "conversion",
    "default",
    "attrition",
    "outcome",
    "status",
    "target",
    "response",
    "retention",
    "loss",
    "margin",
    "amount",
    "income",
    "risk",
    "claim",
    "payment",
    "complaint",
    "satisfaction",
  ];

  const targetCandidates =
    columns.filter(
      (column) => {
        const normalized =
          normalizeColumnName(
            column
          );

        return targetKeywords.some(
          (keyword) =>
            normalized.includes(
              keyword
            )
        );
      }
    );

  targetCandidates.forEach(
    (target) => {
      const values =
        sampledRows
          .map(
            (row) =>
              row[target]
          )
          .filter(
            (value) =>
              !isMissing(value)
          );

      const uniqueValues = [
        ...new Set(
          values.map(
            (value) =>
              normalizeCategoryValue(
                value
              )
          )
        ),
      ].filter(
        (value) =>
          value !== null
      );

      if (
        uniqueValues.length <
          2 ||
        uniqueValues.length >
          20
      ) {
        return;
      }

      const matchedKeyword =
        targetKeywords.find(
          (keyword) =>
            normalizeColumnName(
              target
            ).includes(
              keyword
            )
        );

      patterns.push({
        type: "target",

        strength:
          targetStrength(
            target,
            matchedKeyword,
            uniqueValues.length
          ),

        score:
          calculateTargetScore(
            target,
            matchedKeyword,
            uniqueValues.length
          ),

        title: `${target} looks like a key business outcome`,

        description: `NEXUS detected ${target} as a potential business outcome variable worth investigating.`,

        column: target,

        values:
          uniqueValues.slice(
            0,
            20
          ),

        matchedKeyword,

        cardinality:
          uniqueValues.length,
      });
    }
  );

  // ==========================================================
  // 4. DATE-AWARE TREND DETECTION
  // ==========================================================
  //
  // IMPORTANT:
  // We ONLY detect trends when an actual date/time
  // column exists.
  //
  // This prevents fake trends caused by CSV row order.
  // ==========================================================

  if (
    dateColumns.length > 0
  ) {
    const dateColumn =
      selectBestDateColumn(
        dateColumns
      );

    const trendColumns =
      analyticalNumericColumns.slice(
        0,
        10
      );

    trendColumns.forEach(
      (numericColumn) => {
        const points =
          sampledRows
            .map(
              (row) => ({
                date:
                  parseDate(
                    row[
                      dateColumn
                    ]
                  ),

                value:
                  toNumber(
                    row[
                      numericColumn
                    ]
                  ),
              })
            )
            .filter(
              (point) =>
                point.date &&
                Number.isFinite(
                  point.value
                )
            )
            .sort(
              (a, b) =>
                a.date - b.date
            );

        if (
          points.length < 20
        ) {
          return;
        }

        const trend =
          calculateTimeTrend(
            points
          );

        if (
          !trend ||
          Math.abs(
            trend.changePercentage
          ) <
            TREND_THRESHOLD *
              100
        ) {
          return;
        }

        const increasing =
          trend.slope > 0;

        const direction =
          increasing
            ? "upward"
            : "downward";

        const strength =
          Math.min(
            1,
            Math.abs(
              trend.changePercentage
            ) / 100
          );

        patterns.push({
          type: "trend",

          strength:
            Math.max(
              0.65,
              strength
            ),

          score:
            calculateBusinessScore(
              Math.abs(
                trend.changePercentage
              ),
              "trend"
            ),

          title: `${numericColumn} shows a ${direction} trend`,

          description: increasing
            ? `${numericColumn} increased by approximately ${Math.abs(
                trend.changePercentage
              ).toFixed(
                1
              )}% across the observed time period.`
            : `${numericColumn} decreased by approximately ${Math.abs(
                trend.changePercentage
              ).toFixed(
                1
              )}% across the observed time period.`,

          column:
            numericColumn,

          dateColumn,

          direction,

          changePercentage:
            Number(
              trend.changePercentage.toFixed(
                1
              )
            ),

          trendStrength:
            Number(
              trend.rSquared.toFixed(
                2
              )
            ),

          startDate:
            points[0].date.toISOString(),

          endDate:
            points[
              points.length -
                1
            ].date.toISOString(),
        });
      }
    );
  }

  // ==========================================================
  // 5. OUTLIER DETECTION
  // ==========================================================

  analyticalNumericColumns.forEach(
    (column) => {
      const values =
        sampledRows
          .map(
            (row) =>
              toNumber(
                row[column]
              )
          )
          .filter(
            (value) =>
              Number.isFinite(
                value
              )
          );

      if (
        values.length < 20
      ) {
        return;
      }

      const statistics =
        calculateStatistics(
          values
        );

      if (
        statistics.outlierCount ===
        0
      ) {
        return;
      }

      const outlierPercentage =
        (statistics.outlierCount /
          values.length) *
        100;

      if (
        outlierPercentage <
        0.5
      ) {
        return;
      }

      patterns.push({
        type: "outlier",

        strength:
          Math.min(
            1,
            outlierPercentage /
              10
          ),

        score:
          calculateBusinessScore(
            outlierPercentage *
              10,
            "outlier"
          ),

        title: `${column} contains unusual values`,

        description: `NEXUS identified ${statistics.outlierCount.toLocaleString()} potential outliers in ${column}, representing approximately ${outlierPercentage.toFixed(
          1
        )}% of observed values.`,

        column,

        outlierCount:
          statistics.outlierCount,

        outlierPercentage:
          Number(
            outlierPercentage.toFixed(
              1
            )
          ),

        lowerBound:
          Number(
            statistics.lowerBound.toFixed(
              2
            )
          ),

        upperBound:
          Number(
            statistics.upperBound.toFixed(
              2
            )
          ),
      });
    }
  );

  // ==========================================================
  // 6. HIGH VARIABILITY
  // ==========================================================

  analyticalNumericColumns.forEach(
    (column) => {
      const values =
        sampledRows
          .map(
            (row) =>
              toNumber(
                row[column]
              )
          )
          .filter(
            (value) =>
              Number.isFinite(
                value
              )
          );

      if (
        values.length < 20
      ) {
        return;
      }

      const stats =
        calculateStatistics(
          values
        );

      if (
        !Number.isFinite(
          stats.mean
        ) ||
        stats.mean === 0
      ) {
        return;
      }

      const coefficientOfVariation =
        Math.abs(
          stats.standardDeviation /
            stats.mean
        );

      if (
        coefficientOfVariation <
        1
      ) {
        return;
      }

      patterns.push({
        type:
          "variability",

        strength:
          Math.min(
            1,
            coefficientOfVariation /
              2
          ),

        score:
          calculateBusinessScore(
            coefficientOfVariation *
              50,
            "variability"
          ),

        title: `${column} has high variability`,

        description: `${column} shows substantial variation around its average value, which may indicate distinct segments or unusual observations.`,

        column,

        mean:
          Number(
            stats.mean.toFixed(
              2
            )
          ),

        standardDeviation:
          Number(
            stats.standardDeviation.toFixed(
              2
            )
          ),

        coefficientOfVariation:
          Number(
            coefficientOfVariation.toFixed(
              2
            )
          ),
      });
    }
  );

  // ==========================================================
  // 7. CATEGORY IMBALANCE
  // ==========================================================

  analyticalCategoricalColumns.forEach(
    (column) => {
      const counts =
        getCategoryCounts(
          sampledRows,
          column
        );

      const entries =
        Object.entries(
          counts
        );

      if (
        entries.length < 3 ||
        entries.length > 20
      ) {
        return;
      }

      entries.sort(
        (a, b) =>
          b[1] - a[1]
      );

      const largest =
        entries[0][1];

      const smallest =
        entries[
          entries.length - 1
        ][1];

      if (
        smallest <= 0
      ) {
        return;
      }

      const imbalanceRatio =
        largest /
        smallest;

      if (
        imbalanceRatio < 5
      ) {
        return;
      }

      patterns.push({
        type:
          "imbalance",

        strength:
          Math.min(
            1,
            imbalanceRatio /
              10
          ),

        score:
          calculateBusinessScore(
            Math.min(
              100,
              imbalanceRatio *
                10
            ),
            "imbalance"
          ),

        title: `${column} has uneven segment distribution`,

        description: `The largest segment in ${column} is approximately ${imbalanceRatio.toFixed(
          1
        )}× larger than the smallest segment.`,

        column,

        largestSegment:
          entries[0][0],

        smallestSegment:
          entries[
            entries.length -
              1
          ][0],

        imbalanceRatio:
          Number(
            imbalanceRatio.toFixed(
              1
            )
          ),
      });
    }
  );

  // ==========================================================
  // 8. HIGH CARDINALITY
  // ==========================================================

  analyticalCategoricalColumns.forEach(
    (column) => {
      const uniqueValues =
        new Set(
          sampledRows
            .map(
              (row) =>
                normalizeCategoryValue(
                  row[column]
                )
            )
            .filter(
              (value) =>
                value !== null
            )
        );

      const cardinality =
        uniqueValues.size;

      const threshold =
        Math.min(
          100,
          sampledRows.length *
            0.5
        );

      if (
        cardinality <=
        threshold
      ) {
        return;
      }

      patterns.push({
        type:
          "cardinality",

        strength: 0.6,

        score: 60,

        title: `${column} has very high cardinality`,

        description: `${column} contains ${cardinality.toLocaleString()} unique values, which may make direct categorical analysis less useful.`,

        column,

        uniqueValues:
          cardinality,
      });
    }
  );

  // ==========================================================
  // 9. NUMERIC SEGMENT PERFORMANCE
  // ==========================================================

  analyticalCategoricalColumns
    .filter(
      (column) =>
        !idColumns.includes(
          column
        )
    )
    .slice(
      0,
      10
    )
    .forEach(
      (categoryColumn) => {
        analyticalNumericColumns
          .slice(
            0,
            10
          )
          .forEach(
            (numericColumn) => {
              const groups =
                buildNumericGroups(
                  sampledRows,
                  categoryColumn,
                  numericColumn
                );

              const groupEntries =
                Object.entries(
                  groups
                )
                  .map(
                    ([
                      name,
                      values,
                    ]) => ({
                      name,
                      average:
                        values.reduce(
                          (
                            sum,
                            value
                          ) =>
                            sum +
                            value,
                          0
                        ) /
                        values.length,
                      count:
                        values.length,
                    })
                  )
                  .filter(
                    (group) =>
                      group.count >=
                      5
                  );

              if (
                groupEntries.length <
                2
              ) {
                return;
              }

              groupEntries.sort(
                (a, b) =>
                  b.average -
                  a.average
              );

              const best =
                groupEntries[0];

              const worst =
                groupEntries[
                  groupEntries.length -
                    1
                ];

              if (
                !Number.isFinite(
                  best.average
                ) ||
                !Number.isFinite(
                  worst.average
                ) ||
                best.average ===
                  0
              ) {
                return;
              }

              const difference =
                ((best.average -
                  worst.average) /
                  Math.abs(
                    best.average
                  )) *
                100;

              if (
                Math.abs(
                  difference
                ) <
                SEGMENT_DIFFERENCE_THRESHOLD
              ) {
                return;
              }

              patterns.push({
                type:
                  "segment",

                strength:
                  Math.min(
                    1,
                    Math.abs(
                      difference
                    ) / 100
                  ),

                score:
                  calculateBusinessScore(
                    Math.abs(
                      difference
                    ),
                    "segment"
                  ),

                title: `${best.name} leads ${numericColumn}`,

                description: `${best.name} has the highest average ${numericColumn} among the observed ${categoryColumn} segments, while ${worst.name} records the lowest.`,

                category:
                  categoryColumn,

                metric:
                  numericColumn,

                topSegment:
                  best.name,

                bottomSegment:
                  worst.name,

                topAverage:
                  Number(
                    best.average.toFixed(
                      2
                    )
                  ),

                bottomAverage:
                  Number(
                    worst.average.toFixed(
                      2
                    )
                  ),

                differencePercentage:
                  Number(
                    Math.abs(
                      difference
                    ).toFixed(
                      1
                    )
                  ),

                topSampleSize:
                  best.count,

                bottomSampleSize:
                  worst.count,
              });
            }
          );
      }
    );

  // ==========================================================
  // 10. OUTCOME / TARGET SEGMENT ANALYSIS
  // ==========================================================
  //
  // Example:
  //
  // "Month-to-month customers show a 2.3× higher
  // churn rate than annual-contract customers."
  //
  // This is one of the most valuable business insights.
  // ==========================================================

  const outcomeCandidates =
    getOutcomeCandidates(
      columns,
      categoricalColumns,
      binaryColumns
    );

  outcomeCandidates.forEach(
    (outcomeColumn) => {
      analyticalCategoricalColumns
        .filter(
          (column) =>
            column !==
            outcomeColumn
        )
        .slice(
          0,
          8
        )
        .forEach(
          (segmentColumn) => {
            const outcomeValues =
              getBinaryOutcomeValues(
                sampledRows,
                outcomeColumn
              );

            if (
              !outcomeValues
            ) {
              return;
            }

            const groups =
              {};

            sampledRows.forEach(
              (row) => {
                const segment =
                  normalizeCategoryValue(
                    row[
                      segmentColumn
                    ]
                  );

                const outcome =
                  normalizeCategoryValue(
                    row[
                      outcomeColumn
                    ]
                  );

                if (
                  segment ===
                    null ||
                  outcome ===
                    null
                ) {
                  return;
                }

                if (
                  !groups[
                    segment
                  ]
                ) {
                  groups[
                    segment
                  ] = {
                    positive: 0,
                    total: 0,
                  };
                }

                groups[
                  segment
                ].total++;

                if (
                  isPositiveOutcome(
                    outcome,
                    outcomeValues
                  )
                ) {
                  groups[
                    segment
                  ].positive++;
                }
              }
            );

            const segmentRates =
              Object.entries(
                groups
              )
                .map(
                  ([
                    name,
                    stats,
                  ]) => ({
                    name,
                    rate:
                      stats.total >
                      0
                        ? (stats.positive /
                            stats.total) *
                          100
                        : 0,
                    count:
                      stats.total,
                  })
                )
                .filter(
                  (segment) =>
                    segment.count >=
                    10
                );

            if (
              segmentRates.length <
              2
            ) {
              return;
            }

            segmentRates.sort(
              (a, b) =>
                b.rate -
                a.rate
            );

            const highest =
              segmentRates[0];

            const lowest =
              segmentRates[
                segmentRates.length -
                  1
              ];

            const difference =
              highest.rate -
              lowest.rate;

            if (
              difference <
              10
            ) {
              return;
            }

            patterns.push({
              type:
                "outcome_segment",

              strength:
                Math.min(
                  1,
                  difference /
                    50
                ),

              score:
                calculateBusinessScore(
                  difference *
                    2,
                  "outcome_segment"
                ),

              title: `${highest.name} has the highest ${outcomeColumn} rate`,

              description: `${highest.name} records a ${highest.rate.toFixed(
                1
              )}% ${outcomeColumn} rate versus ${lowest.rate.toFixed(
                1
              )}% for ${lowest.name}, a difference of ${difference.toFixed(
                1
              )} percentage points.`,

              outcome:
                outcomeColumn,

              segment:
                segmentColumn,

              topSegment:
                highest.name,

              bottomSegment:
                lowest.name,

              topRate:
                Number(
                  highest.rate.toFixed(
                    1
                  )
                ),

              bottomRate:
                Number(
                  lowest.rate.toFixed(
                    1
                  )
                ),

              differencePercentagePoints:
                Number(
                  difference.toFixed(
                    1
                  )
                ),

              topSampleSize:
                highest.count,

              bottomSampleSize:
                lowest.count,
            });
          }
        );
    }
  );

  // ==========================================================
  // 11. DATA QUALITY
  // ==========================================================

  if (
    Number(
      analysis.missingValues || 0
    ) > 0
  ) {
    const missingPercentage =
      Number(
        analysis.missingPercentage ||
          0
      );

    patterns.push({
      type:
        "data_quality",

      strength:
        Math.min(
          1,
          Math.max(
            0.4,
            missingPercentage /
              100
          )
        ),

      score:
        calculateBusinessScore(
          missingPercentage,
          "data_quality"
        ),

      title:
        "Missing values require attention",

      description: `NEXUS detected ${Number(
        analysis.missingValues
      ).toLocaleString()} missing values across the dataset${
        missingPercentage
          ? ` (${missingPercentage.toFixed(
              1
            )}% of all cells)`
          : ""
      }.`,

      missingValues:
        Number(
          analysis.missingValues
        ),

      missingPercentage:
        Number(
          missingPercentage.toFixed(
            1
          )
        ),
    });
  }

  // ==========================================================
  // 12. DUPLICATE DATA QUALITY
  // ==========================================================

  if (
    Number(
      analysis.duplicateRows || 0
    ) > 0
  ) {
    const duplicatePercentage =
      Number(
        analysis.duplicatePercentage ||
          0
      );

    patterns.push({
      type:
        "duplicate_data",

      strength:
        Math.min(
          1,
          Math.max(
            0.4,
            duplicatePercentage /
              100
          )
        ),

      score:
        calculateBusinessScore(
          duplicatePercentage,
          "duplicate_data"
        ),

      title:
        "Duplicate records detected",

      description: `NEXUS identified ${Number(
        analysis.duplicateRows
      ).toLocaleString()} duplicate records, representing approximately ${duplicatePercentage.toFixed(
        1
      )}% of the dataset.`,

      duplicateRows:
        Number(
          analysis.duplicateRows
        ),

      duplicatePercentage:
        Number(
          duplicatePercentage.toFixed(
            1
          )
        ),
    });
  }

  // ==========================================================
  // FINAL RANKING
  // ==========================================================

  patterns.sort(
    (a, b) =>
      Number(
        b.score || 0
      ) -
      Number(
        a.score || 0
      )
  );

  // ==========================================================
  // REMOVE DUPLICATES
  // ==========================================================

  const uniquePatterns = [];

  const seen =
    new Set();

  patterns.forEach(
    (pattern) => {
      const key = [
        pattern.type,
        pattern.column || "",
        pattern.category ||
          "",
        pattern.metric ||
          "",
        pattern.outcome ||
          "",
        pattern.segment ||
          "",
        ...(pattern.columns ||
          []),
        pattern.title ||
          "",
      ].join("|");

      if (
        seen.has(key)
      ) {
        return;
      }

      seen.add(key);

      uniquePatterns.push(
        pattern
      );
    }
  );

  // ==========================================================
  // FINAL OUTPUT
  // ==========================================================

  return uniquePatterns
    .slice(0, 12)
    .map(
      (
        pattern,
        index
      ) => ({
        ...pattern,

        rank:
          index + 1,
      })
    );
}

// ============================================================
// BUSINESS SCORING
// ============================================================

function calculateBusinessScore(
  rawScore,
  type
) {
  const base =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          rawScore || 0
        )
      )
    );

  const multipliers = {
    outcome_segment: 1.3,
    segment: 1.2,
    correlation: 1.1,
    trend: 1.05,
    concentration: 0.95,
    outlier: 0.9,
    variability: 0.85,
    imbalance: 0.85,
    data_quality: 0.9,
    duplicate_data: 0.9,
  };

  const multiplier =
    multipliers[type] ||
    1;

  return Math.min(
    100,
    Math.round(
      base *
        multiplier
    )
  );
}

// ============================================================
// TARGET STRENGTH
// ============================================================

function targetStrength(
  column,
  keyword,
  cardinality
) {
  const strongKeywords = [
    "churn",
    "revenue",
    "profit",
    "conversion",
    "default",
    "attrition",
    "outcome",
    "target",
    "sales",
  ];

  if (
    strongKeywords.includes(
      keyword
    )
  ) {
    return 0.9;
  }

  if (
    cardinality === 2
  ) {
    return 0.85;
  }

  return 0.7;
}

// ============================================================
// TARGET SCORE
// ============================================================

function calculateTargetScore(
  column,
  keyword,
  cardinality
) {
  if (
    [
      "churn",
      "revenue",
      "profit",
      "conversion",
      "default",
      "attrition",
      "outcome",
      "target",
    ].includes(
      keyword
    )
  ) {
    return 92;
  }

  if (
    cardinality === 2
  ) {
    return 85;
  }

  return 72;
}

// ============================================================
// CORRELATION LABEL
// ============================================================

function getCorrelationLabel(
  value
) {
  if (
    value >= 0.9
  ) {
    return "Very strong";
  }

  if (
    value >= 0.8
  ) {
    return "Strong";
  }

  return "Moderate";
}

// ============================================================
// DATE COLUMN SELECTION
// ============================================================

function selectBestDateColumn(
  dateColumns
) {
  if (
    !Array.isArray(
      dateColumns
    ) ||
    dateColumns.length === 0
  ) {
    return null;
  }

  const preferredKeywords = [
    "date",
    "timestamp",
    "time",
    "created",
    "updated",
    "transaction",
    "purchase",
    "order",
  ];

  const preferred =
    dateColumns.find(
      (column) => {
        const name =
          normalizeColumnName(
            column
          );

        return preferredKeywords.some(
          (keyword) =>
            name.includes(
              keyword
            )
        );
      }
    );

  return (
    preferred ||
    dateColumns[0]
  );
}

// ============================================================
// TIME TREND
// ============================================================

function calculateTimeTrend(
  points
) {
  if (
    !points ||
    points.length < 10
  ) {
    return null;
  }

  const first =
    points[0].value;

  const last =
    points[
      points.length - 1
    ].value;

  const changePercentage =
    first !== 0
      ? ((last - first) /
          Math.abs(first)) *
        100
      : 0;

  const n =
    points.length;

  const meanX =
    (n - 1) / 2;

  const meanY =
    points.reduce(
      (
        sum,
        point
      ) =>
        sum +
        point.value,
      0
    ) / n;

  let numerator = 0;

  let denominator = 0;

  for (
    let i = 0;
    i < n;
    i++
  ) {
    const dx =
      i - meanX;

    const dy =
      points[i].value -
      meanY;

    numerator +=
      dx * dy;

    denominator +=
      dx * dx;
  }

  const slope =
    denominator !== 0
      ? numerator /
        denominator
      : 0;

  // R²-like measure
  let ssTotal = 0;

  let ssResidual = 0;

  for (
    let i = 0;
    i < n;
    i++
  ) {
    const predicted =
      meanY +
      slope *
        (i - meanX);

    ssTotal +=
      (points[i].value -
        meanY) **
      2;

    ssResidual +=
      (points[i].value -
        predicted) **
      2;
  }

  const rSquared =
    ssTotal !== 0
      ? Math.max(
          0,
          1 -
            ssResidual /
              ssTotal
        )
      : 0;

  return {
    slope,

    changePercentage,

    rSquared,
  };
}

// ============================================================
// NUMERIC GROUP BUILDER
// ============================================================

function buildNumericGroups(
  rows,
  categoryColumn,
  numericColumn
) {
  const groups = {};

  rows.forEach(
    (row) => {
      const category =
        normalizeCategoryValue(
          row[
            categoryColumn
          ]
        );

      const value =
        toNumber(
          row[
            numericColumn
          ]
        );

      if (
        category === null ||
        !Number.isFinite(
          value
        )
      ) {
        return;
      }

      if (
        !groups[
          category
        ]
      ) {
        groups[
          category
        ] = [];
      }

      groups[
        category
      ].push(value);
    }
  );

  return groups;
}

// ============================================================
// CATEGORY COUNTS
// ============================================================

function getCategoryCounts(
  rows,
  column
) {
  const counts = {};

  rows.forEach(
    (row) => {
      const value =
        normalizeCategoryValue(
          row[column]
        );

      if (
        value === null
      ) {
        return;
      }

      counts[value] =
        (counts[value] ||
          0) + 1;
    }
  );

  return counts;
}

// ============================================================
// OUTCOME CANDIDATES
// ============================================================

function getOutcomeCandidates(
  columns,
  categoricalColumns,
  binaryColumns
) {
  const keywords = [
    "churn",
    "attrition",
    "default",
    "conversion",
    "outcome",
    "target",
    "response",
    "retention",
    "status",
    "risk",
    "claim",
  ];

  const candidates =
    [];

  columns.forEach(
    (column) => {
      const normalized =
        normalizeColumnName(
          column
        );

      const matches =
        keywords.some(
          (keyword) =>
            normalized.includes(
              keyword
            )
        );

      if (
        matches &&
        (
          categoricalColumns.includes(
            column
          ) ||
          binaryColumns.includes(
            column
          )
        )
      ) {
        candidates.push(
          column
        );
      }
    }
  );

  return [
    ...new Set(
      candidates
    ),
  ].slice(
    0,
    5
  );
}

// ============================================================
// BINARY OUTCOME DETECTION
// ============================================================

function getBinaryOutcomeValues(
  rows,
  column
) {
  const values = [
    ...new Set(
      rows
        .map(
          (row) =>
            normalizeCategoryValue(
              row[column]
            )
        )
        .filter(
          (value) =>
            value !== null
        )
    ),
  ];

  if (
    values.length !== 2
  ) {
    return null;
  }

  return values;
}

// ============================================================
// POSITIVE OUTCOME DETECTION
// ============================================================

function isPositiveOutcome(
  value,
  possibleValues
) {
  const normalized =
    String(
      value
    )
      .trim()
      .toLowerCase();

  const positiveKeywords = [
    "yes",
    "true",
    "1",
    "churn",
    "churned",
    "default",
    "converted",
    "positive",
    "success",
    "lost",
    "active",
  ];

  const directMatch =
    positiveKeywords.includes(
      normalized
    );

  if (
    directMatch
  ) {
    return true;
  }

  // For generic binary labels, use the second
  // value consistently instead of pretending
  // we know which label is positive.
  return (
    possibleValues.length ===
      2 &&
    normalized ===
      String(
        possibleValues[1]
      )
        .trim()
        .toLowerCase()
  );
}

// ============================================================
// COLUMN NAME NORMALIZATION
// ============================================================

function normalizeColumnName(
  column
) {
  return String(
    column
  )
    .toLowerCase()
    .replace(
      /[_-]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

// ============================================================
// MISSING VALUE
// ============================================================

function isMissing(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  if (
    typeof value ===
    "string"
  ) {
    const normalized =
      value
        .trim()
        .toLowerCase();

    return [
      "",
      "null",
      "undefined",
      "n/a",
      "na",
      "nan",
    ].includes(
      normalized
    );
  }

  return false;
}

// ============================================================
// NUMBER NORMALIZATION
// ============================================================

function toNumber(
  value
) {
  if (
    typeof value ===
    "number"
  ) {
    return Number.isFinite(
      value
    )
      ? value
      : NaN;
  }

  if (
    typeof value !==
    "string"
  ) {
    return NaN;
  }

  const cleaned =
    value
      .replace(/,/g, "")
      .replace(/%/g, "")
      .trim();

  if (
    !cleaned
  ) {
    return NaN;
  }

  const number =
    Number(
      cleaned
    );

  return Number.isFinite(
    number
  )
    ? number
    : NaN;
}

// ============================================================
// CATEGORY NORMALIZATION
// ============================================================

function normalizeCategoryValue(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalized =
    String(
      value
    ).trim();

  return normalized
    ? normalized
    : null;
}

// ============================================================
// DATE PARSING
// ============================================================

function parseDate(
  value
) {
  if (
    value instanceof Date
  ) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  if (
    !trimmed
  ) {
    return null;
  }

  // Avoid interpreting plain numeric values
  // as timestamps.
  if (
    /^[0-9]+$/.test(
      trimmed
    )
  ) {
    return null;
  }

  const timestamp =
    Date.parse(
      trimmed
    );

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return null;
  }

  return new Date(
    timestamp
  );
}

// ============================================================
// RANDOM / DETERMINISTIC SAMPLE
// ============================================================

function sampleRows(
  rows,
  size
) {
  if (
    rows.length <= size
  ) {
    return rows;
  }

  const result =
    [];

  const step =
    rows.length /
    size;

  for (
    let i = 0;
    i < size;
    i++
  ) {
    result.push(
      rows[
        Math.floor(
          i * step
        )
      ]
    );
  }

  return result;
}

// ============================================================
// CORRELATION
// ============================================================

function calculateCorrelation(
  x,
  y
) {
  const n =
    x.length;

  if (
    n < 2
  ) {
    return 0;
  }

  const meanX =
    x.reduce(
      (
        sum,
        value
      ) =>
        sum +
        value,
      0
    ) / n;

  const meanY =
    y.reduce(
      (
        sum,
        value
      ) =>
        sum +
        value,
      0
    ) / n;

  let numerator = 0;

  let denominatorX = 0;

  let denominatorY = 0;

  for (
    let i = 0;
    i < n;
    i++
  ) {
    const dx =
      x[i] -
      meanX;

    const dy =
      y[i] -
      meanY;

    numerator +=
      dx * dy;

    denominatorX +=
      dx ** 2;

    denominatorY +=
      dy ** 2;
  }

  const denominator =
    Math.sqrt(
      denominatorX *
        denominatorY
    );

  if (
    denominator ===
    0
  ) {
    return 0;
  }

  return (
    numerator /
    denominator
  );
}

// ============================================================
// STATISTICS
// ============================================================

function calculateStatistics(
  values
) {
  const sorted =
    [
      ...values,
    ].sort(
      (a, b) =>
        a - b
    );

  const n =
    sorted.length;

  const mean =
    sorted.reduce(
      (
        sum,
        value
      ) =>
        sum +
        value,
      0
    ) / n;

  const variance =
    sorted.reduce(
      (
        sum,
        value
      ) =>
        sum +
        (
          value -
          mean
        ) **
          2,
      0
    ) / n;

  const standardDeviation =
    Math.sqrt(
      variance
    );

  const q1 =
    percentile(
      sorted,
      25
    );

  const q3 =
    percentile(
      sorted,
      75
    );

  const iqr =
    q3 - q1;

  const lowerBound =
    q1 -
    1.5 *
      iqr;

  const upperBound =
    q3 +
    1.5 *
      iqr;

  const outlierCount =
    sorted.filter(
      (value) =>
        value <
          lowerBound ||
        value >
          upperBound
    ).length;

  return {
    mean,

    standardDeviation,

    q1,

    q3,

    lowerBound,

    upperBound,

    outlierCount,
  };
}

// ============================================================
// PERCENTILE
// ============================================================

function percentile(
  sorted,
  percentage
) {
  if (
    sorted.length ===
    0
  ) {
    return 0;
  }

  const index =
    (percentage /
      100) *
    (
      sorted.length -
      1
    );

  const lower =
    Math.floor(
      index
    );

  const upper =
    Math.ceil(
      index
    );

  if (
    lower ===
    upper
  ) {
    return sorted[
      lower
    ];
  }

  const weight =
    index -
    lower;

  return (
    sorted[
      lower
    ] *
      (1 -
        weight) +
    sorted[
      upper
    ] *
      weight
  );
}