-- Remove Easter roast news item
DELETE FROM club_news WHERE title ILIKE '%easter%';

-- Fix gin news item
UPDATE club_news
SET title   = '1895 CUC London Dry Gin',
    content = 'The City University Club is proud to serve our IWSC-winning 1895 CUC London Dry Gin, available exclusively with lunch bookings.'
WHERE title ILIKE '%gin%';

-- Remove New Candidates Evening / New Member Candidates Meeting events
DELETE FROM events WHERE title ILIKE '%candidate%';
