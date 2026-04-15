UPDATE members
SET last_name = TRIM(SUBSTRING(last_name FROM LENGTH(first_name) + 2))
WHERE first_name IS NOT NULL
  AND first_name != ''
  AND last_name LIKE (first_name || ' %');
