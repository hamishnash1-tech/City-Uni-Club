UPDATE events
SET slug = CONCAT(
  COALESCE(TO_CHAR(event_date, 'YYYY-MM-DD'), 'tba'),
  '-',
  LOWER(REGEXP_REPLACE(
    ARRAY_TO_STRING(
      (SELECT ARRAY_AGG(w) FROM (
        SELECT UNNEST(regexp_split_to_array(TRIM(title), '\s+')) AS w LIMIT 4
      ) t),
      ' '
    ),
    '[^a-zA-Z0-9]+', '-', 'g'
  )),
  '-',
  short_id::text
);
