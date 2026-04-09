ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_menu_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_menu_check
  CHECK (menu IN ('breakfast', 'lunch', 'beverages', 'canapes'));

INSERT INTO menu_items (menu, name, sort_order) VALUES
  ('canapes', 'Rare Roast Beef mini-Yorkshire puddings horseradish cream', 1),
  ('canapes', 'Smoked Salmon blinis crème fraîche', 2),
  ('canapes', 'Goats Cheese & red onion marmalade tartlets', 3),
  ('canapes', 'Bruschetta with a tomato & basil salsa', 4),
  ('canapes', 'Chicken liver pâté on toasted brioche', 5),
  ('canapes', 'Mushroom & tarragon vol-au-vents', 6),
  ('canapes', 'Prawn cocktail spoons', 7),
  ('canapes', 'Cheese & chive gougères', 8),
  ('canapes', 'Mini smoked duck pancakes with hoisin sauce', 9),
  ('canapes', 'Crostini with tapenade & sun-dried tomatoes', 10),
  ('canapes', 'Pigs in blankets with mustard dip', 11),
  ('canapes', 'Caprese skewers with fresh basil', 12),
  ('canapes', 'Smoked mackerel pâté on rye crispbreads', 13)
ON CONFLICT DO NOTHING;
