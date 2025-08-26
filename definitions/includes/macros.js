// Returns DATE; falls back to '1900-01-01' if parse fails.
// Adjust format list if your date values vary (YYYY-MM-DD vs YYYYMMDD).
// Parse a date column that might be INT64 or STRING. Falls back to 1900-01-01.
module.exports.safe_date = (col) => `
COALESCE(
  SAFE.PARSE_DATE('%Y-%m-%d', SAFE_CAST(${col} AS STRING)),
  SAFE.PARSE_DATE('%Y%m%d',   SAFE_CAST(${col} AS STRING)),
  SAFE.PARSE_DATE('%m/%d/%Y', SAFE_CAST(${col} AS STRING)),
  SAFE.PARSE_DATE('%Y/%m/%d', SAFE_CAST(${col} AS STRING)),
  DATE '1900-01-01'
)`;

// Robust parser for SAS-ish datetime strings -> DATETIME.
// Handles:
//  - "YYYY-MM-DD HH:MM[:SS[.fff]]"
//  - "YYYY-MM-DD" (midnight)
//  - "MM:SS[.fff]"  e.g. "45:08.3"  (minutes:seconds)
//  - "HH:MM[:SS[.fff]]" time-only
//  - "", "0", "NULL" -> 1900-01-01 00:00:00
module.exports.safe_sas_datetime = (col) => `
(
  CASE
    WHEN TRIM(SAFE_CAST(${col} AS STRING)) IS NULL
      OR TRIM(SAFE_CAST(${col} AS STRING)) IN ('', '0', 'NULL')
      THEN DATETIME '1900-01-01 00:00:00'

    -- Date + time
    WHEN REGEXP_CONTAINS(TRIM(SAFE_CAST(${col} AS STRING)),
         r'^\\d{4}-\\d{2}-\\d{2}\\s+\\d{1,2}:\\d{2}(:\\d{2}(\\.\\d+)?)?$')
      THEN SAFE.PARSE_DATETIME('%Y-%m-%d %H:%M:%E*S', TRIM(SAFE_CAST(${col} AS STRING)))

    -- Date only
    WHEN REGEXP_CONTAINS(TRIM(SAFE_CAST(${col} AS STRING)),
         r'^\\d{4}-\\d{2}-\\d{2}$')
      THEN DATETIME(SAFE.PARSE_DATE('%Y-%m-%d', TRIM(SAFE_CAST(${col} AS STRING))), TIME '00:00:00')

    -- *** MM:SS[.fff] FIRST (e.g., "45:08.3") ***
    WHEN REGEXP_CONTAINS(TRIM(SAFE_CAST(${col} AS STRING)),
         r'^\\d{1,2}:\\d{2}(\\.\\d+)?$')
      THEN DATETIME(
             DATE '1900-01-01',
             COALESCE(
               SAFE.PARSE_TIME('%H:%M:%E*S', CONCAT('00:', TRIM(SAFE_CAST(${col} AS STRING)))),
               TIME '00:00:00'
             )
           )

    -- HH:MM[:SS[.fff]] time-only
    WHEN REGEXP_CONTAINS(TRIM(SAFE_CAST(${col} AS STRING)),
         r'^\\d{1,2}:\\d{2}(:\\d{2}(\\.\\d+)?)?$')
      THEN DATETIME(
             DATE '1900-01-01',
             COALESCE(
               SAFE.PARSE_TIME('%H:%M:%E*S', TRIM(SAFE_CAST(${col} AS STRING))),
               SAFE.PARSE_TIME('%H:%M',       TRIM(SAFE_CAST(${col} AS STRING))),
               TIME '00:00:00'
             )
           )

    ELSE DATETIME '1900-01-01 00:00:00'
  END
)`;
// Trim to 15 chars, strip commas, cast to NUMERIC. NULL if not parsable.
module.exports.dec15 = (col) => `
SAFE_CAST(REGEXP_REPLACE(SUBSTR(SAFE_CAST(${col} AS STRING), 1, 15), r',', '') AS NUMERIC)`;

// Safe INT64 with default 0
module.exports.safe_int = (col) => `COALESCE(SAFE_CAST(${col} AS INT64), 0)`;



// Strings (BigQuery doesn't enforce VARCHAR length)
module.exports.str  = (col) => `SAFE_CAST(${col} AS STRING)`;
module.exports.str1 = (col) => `SAFE_CAST(${col} AS STRING)`;
