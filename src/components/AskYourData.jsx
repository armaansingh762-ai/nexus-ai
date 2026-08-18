import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowUpRight,
  Database,
  Sparkles,
  Send,
  Brain,
} from "lucide-react";

function AskYourData({ data }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isThinking, setIsThinking] =
    useState(false);

  if (!data || data.length === 0) {
    return null;
  }

  const columns = Object.keys(data[0] || {});

  // ==========================================
  // NUMERIC COLUMN DETECTION
  // ==========================================

  const getNumericColumns = () => {
    return columns.filter((column) => {
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

      const numericValues =
        values.filter(
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
    });
  };

  const numericColumns =
    getNumericColumns();

  // ==========================================
  // FIND COLUMN
  // ==========================================

  const findColumn = (keywords) => {
    return columns.find((column) => {
      const lower =
        column.toLowerCase();

      return keywords.some(
        (keyword) =>
          lower.includes(keyword)
      );
    });
  };

  // ==========================================
  // ASK ENGINE
  // ==========================================

  const answerQuestion = () => {
    if (!question.trim() || isThinking) {
      return;
    }

    setIsThinking(true);
    setAnswer("");

    setTimeout(() => {
      const q =
        question.toLowerCase();

      // ======================================
      // TOTAL
      // ======================================

      if (
        q.includes("total") ||
        q.includes("sum")
      ) {
        const column =
          findColumn([
            "revenue",
            "sales",
            "amount",
            "profit",
            "income",
            "value",
            "total",
          ]);

        if (column) {
          const total =
            data.reduce(
              (sum, row) => {
                const value =
                  Number(
                    row[column]
                  );

                return !isNaN(value)
                  ? sum + value
                  : sum;
              },
              0
            );

          setAnswer(
            `The total ${column} across the dataset is ${total.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}.`
          );

          setIsThinking(false);
          return;
        }
      }

      // ======================================
      // AVERAGE
      // ======================================

      if (
        q.includes("average") ||
        q.includes("mean")
      ) {
        const column =
          findColumn([
            "revenue",
            "sales",
            "amount",
            "profit",
            "income",
            "price",
            "rating",
            "score",
          ]);

        if (column) {
          const values =
            data
              .map((row) =>
                Number(
                  row[column]
                )
              )
              .filter(
                (value) =>
                  !isNaN(value)
              );

          const average =
            values.reduce(
              (sum, value) =>
                sum + value,
              0
            ) /
            values.length;

          setAnswer(
            `The average ${column} is ${average.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}.`
          );

          setIsThinking(false);
          return;
        }
      }

      // ======================================
      // HIGHEST
      // ======================================

      if (
        q.includes("highest") ||
        q.includes("maximum") ||
        q.includes("largest")
      ) {
        const column =
          findColumn([
            "revenue",
            "sales",
            "amount",
            "profit",
            "income",
            "price",
            "value",
          ]);

        if (column) {
          const values =
            data
              .map((row) =>
                Number(
                  row[column]
                )
              )
              .filter(
                (value) =>
                  !isNaN(value)
              );

          const maximum =
            Math.max(...values);

          setAnswer(
            `The highest ${column} recorded is ${maximum.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}.`
          );

          setIsThinking(false);
          return;
        }
      }

      // ======================================
      // LOWEST
      // ======================================

      if (
        q.includes("lowest") ||
        q.includes("minimum") ||
        q.includes("smallest")
      ) {
        const column =
          findColumn([
            "revenue",
            "sales",
            "amount",
            "profit",
            "income",
            "price",
            "value",
          ]);

        if (column) {
          const values =
            data
              .map((row) =>
                Number(
                  row[column]
                )
              )
              .filter(
                (value) =>
                  !isNaN(value)
              );

          const minimum =
            Math.min(...values);

          setAnswer(
            `The lowest ${column} recorded is ${minimum.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}.`
          );

          setIsThinking(false);
          return;
        }
      }

      // ======================================
      // RECORD COUNT
      // ======================================

      if (
        q.includes("how many") ||
        q.includes(
          "number of records"
        ) ||
        q.includes(
          "number of rows"
        )
      ) {
        setAnswer(
          `Your dataset contains ${data.length.toLocaleString()} records across ${columns.length} variables.`
        );

        setIsThinking(false);
        return;
      }

      // ======================================
      // COLUMN QUESTION
      // ======================================

      if (
        q.includes("columns") ||
        q.includes("variables")
      ) {
        setAnswer(
          `NEXUS detected ${columns.length} variables: ${columns.join(
            ", "
          )}.`
        );

        setIsThinking(false);
        return;
      }

      // ======================================
      // NUMERIC QUESTION
      // ======================================

      if (
        q.includes("numeric") ||
        q.includes("number columns")
      ) {
        setAnswer(
          `NEXUS detected ${numericColumns.length} numeric variables: ${numericColumns.join(
            ", "
          )}.`
        );

        setIsThinking(false);
        return;
      }

      // ======================================
      // FALLBACK
      // ======================================

      setAnswer(
        `NEXUS could not confidently answer that question from the available dataset structure. Try asking about revenue, totals, averages, highest or lowest values, records, or variables.`
      );

      setIsThinking(false);
    }, 650);
  };

  // ==========================================
  // SUGGESTED QUESTIONS
  // ==========================================

  const suggestedQuestions = [
    "What is the total revenue?",
    "What is the average revenue?",
    "What is the highest revenue?",
    "How many records are there?",
  ];

  // ==========================================
  // UI
  // ==========================================

  return (
    <motion.section
      className="ask-section premium-ask-section"
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
        amount: 0.15,
      }}
      transition={{
        duration: 0.7,
      }}
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="ask-header premium-ask-header">
        <div>
          <div className="ask-eyebrow">
            <span className="eyebrow-line" />

            <span>
              NEXUS AI ANALYST
            </span>
          </div>

          <h2>
            Ask your data.
            <br />

            <span>
              Get answers.
            </span>
          </h2>

          <p>
            Ask questions about your dataset
            in natural language. NEXUS calculates
            the answer directly from your data.
          </p>
        </div>

        {/* DATASET STATUS */}

        <motion.div
          className="ask-status-badge"
          initial={{
            opacity: 0,
            scale: 0.92,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
            delay: 0.15,
          }}
        >
          <div className="ask-status-icon">
            <Database size={15} />
          </div>

          <div>
            <span>
              DATASET CONNECTED
            </span>

            <strong>
              {data.length.toLocaleString()}{" "}
              RECORDS
            </strong>
          </div>
        </motion.div>
      </div>

      {/* =====================================
          MAIN ASK CARD
      ===================================== */}

      <motion.div
        className="ask-card premium-ask-card"
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.985,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        transition={{
          duration: 0.65,
          delay: 0.1,
        }}
      >
        <div className="ask-card-glow" />

        {/* CARD TOP */}

        <div className="ask-card-top">
          <div className="ask-card-title">
            <div className="ask-brain-icon">
              <Brain size={18} />
            </div>

            <div>
              <span>
                NEXUS QUERY ENGINE
              </span>

              <strong>
                What would you like to
                understand?
              </strong>
            </div>
          </div>

          <div className="ask-engine-status">
            <span />
            READY
          </div>
        </div>

        {/* INPUT */}

        <div
          className={`ask-input-shell ${
            isThinking
              ? "ask-input-thinking"
              : ""
          }`}
        >
          <Sparkles
            className="ask-input-spark"
            size={18}
          />

          <input
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                answerQuestion();
              }
            }}
            placeholder="Ask something about your data..."
            disabled={isThinking}
          />

          <motion.button
            className="ask-submit-button"
            onClick={answerQuestion}
            disabled={
              isThinking ||
              !question.trim()
            }
            whileHover={
              !isThinking &&
              question.trim()
                ? {
                    y: -1,
                  }
                : {}
            }
            whileTap={
              !isThinking &&
              question.trim()
                ? {
                    scale: 0.97,
                  }
                : {}
            }
          >
            {isThinking ? (
              <span className="ask-button-loader" />
            ) : (
              <Send size={17} />
            )}
          </motion.button>
        </div>

        {/* SUGGESTIONS */}

        <div className="ask-suggestions-header">
          <span>
            TRY ASKING
          </span>

          <span>
            {suggestedQuestions.length}{" "}
            suggestions
          </span>
        </div>

        <div className="suggested-questions premium-suggestions">
          {suggestedQuestions.map(
            (suggestion, index) => (
              <motion.button
                key={suggestion}
                onClick={() =>
                  setQuestion(
                    suggestion
                  )
                }
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.3,
                  delay:
                    index * 0.05,
                }}
                whileHover={{
                  y: -2,
                }}
              >
                <span>
                  {suggestion}
                </span>

                <ArrowUpRight
                  size={14}
                />
              </motion.button>
            )
          )}
        </div>

        {/* THINKING */}

        <AnimatePresence>
          {isThinking && (
            <motion.div
              className="thinking-state premium-thinking-state"
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
            >
              <div className="thinking-orb">
                <Sparkles size={16} />
              </div>

              <div>
                <span>
                  NEXUS IS THINKING
                </span>

                <p>
                  Calculating an answer from
                  your dataset...
                </p>
              </div>

              <div className="thinking-dots">
                <span />
                <span />
                <span />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ANSWER */}

        <AnimatePresence>
          {answer &&
            !isThinking && (
              <motion.div
                className="answer-card premium-answer-card"
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  duration: 0.45,
                }}
              >
                <div className="answer-card-top">
                  <div className="answer-title">
                    <div className="answer-icon">
                      <Sparkles
                        size={16}
                      />
                    </div>

                    <div>
                      <span>
                        NEXUS ANSWER
                      </span>

                      <strong>
                        Intelligence
                        generated
                      </strong>
                    </div>
                  </div>

                  <span className="answer-status">
                    VERIFIED
                  </span>
                </div>

                <p>
                  {answer}
                </p>

                <div className="answer-footer">
                  <span>
                    Calculated from{" "}
                    {data.length.toLocaleString()}{" "}
                    records
                  </span>

                  <span>
                    NEXUS QUERY ENGINE
                  </span>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </motion.div>

      {/* =====================================
          FOOTER
      ===================================== */}

      <div className="ask-footer">
        <div>
          <span className="ask-footer-dot" />

          <span>
            NEXUS query engine ready
          </span>
        </div>

        <span>
          Answers calculated from your
          uploaded dataset
        </span>
      </div>
    </motion.section>
  );
}

export default AskYourData;