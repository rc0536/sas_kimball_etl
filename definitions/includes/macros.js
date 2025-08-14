// Returns DATE; falls back to '1900-01-01' if parse fails.
// Adjust format list if your date values vary (YYYY-MM-DD vs YYYYMMDD).
module.exports.safe_date = (col) => `
COALESCE(
  SAFE.PARSE_DATE('%Y-%m-%d', ${col}),
  SAFE.PARSE_DATE('%Y%m%d', ${col}),
  DATE '1900-01-01'
)
`;

// Trims to 15 chars (like LEFT(...,15)), removes commas, casts to NUMERIC(13,2).
module.exports.dec15 = (col) => `
SAFE.CAST(REGEXP_REPLACE(SUBSTR(${col}, 1, 15), r',', '') AS NUMERIC)
`;

// Shorthand: safe int
module.exports.safe_int = (col) => `COALESCE(SAFE.CAST(${col} AS INT64), 0)`;

// Shorthand: safe string length
module.exports.safe_str = (col, len) => `CAST(${col} AS STRING)`; // BigQuery STRING has no fixed LEN, keep as STRING

// 1-char strings
module.exports.str1 = (col) => `CAST(${col} AS STRING)`;

// 2-char strings etc. (kept as STRING in BQ, sizing handled in semantic layer, not DB)
module.exports.str = (col) => `CAST(${col} AS STRING)`;
