import pool from '../src/config/database.js';

const shouldApply = process.argv.includes('--apply');

const DATE_TEXT = 'CAST(ConcertDate AS CHAR)';

const PARSED_DATE_SQL = `
  CASE
    WHEN ${DATE_TEXT} REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN STR_TO_DATE(${DATE_TEXT}, '%Y-%m-%d')
    WHEN ${DATE_TEXT} REGEXP '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN STR_TO_DATE(${DATE_TEXT}, '%m/%e/%Y')
    WHEN ${DATE_TEXT} REGEXP '^[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}$' THEN STR_TO_DATE(${DATE_TEXT}, '%m-%e-%Y')
    WHEN ${DATE_TEXT} REGEXP '^[0-9]{4}/[0-9]{1,2}/[0-9]{1,2}$' THEN STR_TO_DATE(${DATE_TEXT}, '%Y/%c/%e')
    ELSE NULL
  END
`;

const CONVERTIBLE_WHERE_SQL = `
  (
    ${DATE_TEXT} REGEXP '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
    OR ${DATE_TEXT} REGEXP '^[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}$'
    OR ${DATE_TEXT} REGEXP '^[0-9]{4}/[0-9]{1,2}/[0-9]{1,2}$'
  )
  AND ${PARSED_DATE_SQL} IS NOT NULL
`;

async function querySingleNumber(sql) {
  const [rows] = await pool.query(sql);
  return Number(rows[0].count || 0);
}

async function showStats(label) {
  const [statsRows] = await pool.query(`
    SELECT
      COUNT(*) AS totalRows,
      SUM(CASE WHEN ConcertDate >= CURDATE() THEN 1 ELSE 0 END) AS upcomingRows,
      SUM(CASE WHEN ConcertDate IS NULL THEN 1 ELSE 0 END) AS nullDates,
      SUM(CASE WHEN ${DATE_TEXT} = '0000-00-00' THEN 1 ELSE 0 END) AS zeroDates,
      SUM(CASE WHEN ${DATE_TEXT} REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN 1 ELSE 0 END) AS isoDates,
      SUM(CASE WHEN ${DATE_TEXT} REGEXP '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN 1 ELSE 0 END) AS slashDates,
      SUM(CASE WHEN ${DATE_TEXT} REGEXP '^[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}$' THEN 1 ELSE 0 END) AS dashDates,
      SUM(CASE WHEN ${DATE_TEXT} REGEXP '^[0-9]{4}/[0-9]{1,2}/[0-9]{1,2}$' THEN 1 ELSE 0 END) AS yearSlashDates
    FROM Concerts
  `);

  console.log(`\n=== ${label} ===`);
  console.table(statsRows);

  const convertibleCount = await querySingleNumber(`
    SELECT COUNT(*) AS count
    FROM Concerts
    WHERE ${CONVERTIBLE_WHERE_SQL}
  `);

  console.log(`Convertible non-ISO date rows: ${convertibleCount}`);
}

async function showPreview() {
  const [previewRows] = await pool.query(`
    SELECT
      ConcertNumber,
      ConcertName,
      ${DATE_TEXT} AS currentDate,
      DATE_FORMAT(${PARSED_DATE_SQL}, '%Y-%m-%d') AS normalizedDate
    FROM Concerts
    WHERE ${CONVERTIBLE_WHERE_SQL}
    ORDER BY ConcertNumber DESC
    LIMIT 20
  `);

  if (!previewRows.length) {
    console.log('No convertible date rows found.');
    return;
  }

  console.log('\nSample rows that will be normalized:');
  console.table(previewRows);
}

async function fixConcertDates() {
  try {
    console.log(shouldApply ? 'Running in APPLY mode' : 'Running in DRY-RUN mode');

    await showStats('Before');
    await showPreview();

    if (!shouldApply) {
      console.log('\nNo changes made. Re-run with --apply to update rows.');
      return;
    }

    const [result] = await pool.query(`
      UPDATE Concerts
      SET ConcertDate = ${PARSED_DATE_SQL}
      WHERE ${CONVERTIBLE_WHERE_SQL}
    `);

    console.log(`\nUpdated rows: ${result.affectedRows}`);
    await showStats('After');
  } catch (error) {
    console.error('Error fixing concert dates:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

fixConcertDates();
