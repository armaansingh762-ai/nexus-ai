import { FileText, Database } from "lucide-react";
import { motion } from "framer-motion";

function DatasetSwitcher({
  datasets,
  activeDatasetIndex,
  onSelectDataset,
}) {
  if (!datasets || datasets.length === 0) {
    return null;
  }

  return (
    <motion.section
      className="dataset-switcher"
      initial={{
        opacity: 0,
        y: 25,
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
        duration: 0.6,
      }}
    >
      <div className="dataset-switcher-header">
        <div>
          <span className="section-eyebrow">
            DATA WORKSPACE
          </span>

          <h2>
            Explore your datasets.
          </h2>

          <p>
            Select a dataset to explore its
            individual analytics and insights.
          </p>
        </div>

        <div className="dataset-count">
          <Database size={17} />

          <span>
            {datasets.length}{" "}
            {datasets.length === 1
              ? "dataset"
              : "datasets"}
          </span>
        </div>
      </div>

      <div className="dataset-switcher-grid">
        {datasets.map((item, index) => {
          const isActive =
            index === activeDatasetIndex;

          return (
            <motion.button
              key={`${item.fileName}-${index}`}
              className={`dataset-tab ${
                isActive
                  ? "dataset-tab-active"
                  : ""
              }`}
              onClick={() =>
                onSelectDataset(index)
              }
              whileHover={{
                y: -4,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              <div className="dataset-tab-top">
                <div className="dataset-file-icon">
                  <FileText size={20} />
                </div>

                <span
                  className={`dataset-tab-status ${
                    isActive
                      ? "active"
                      : ""
                  }`}
                >
                  {isActive
                    ? "ACTIVE"
                    : "EXPLORE"}
                </span>
              </div>

              <div className="dataset-tab-info">
                <strong>
                  {item.fileName}
                </strong>

                <span>
                  {(
                    item.fileSize /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </span>
              </div>

              <div className="dataset-tab-meta">
                <span>
                  {item.rowCount?.toLocaleString() ||
                    0}{" "}
                  records
                </span>

                <span>
                  {item.columnCount || 0}{" "}
                  variables
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}

export default DatasetSwitcher;