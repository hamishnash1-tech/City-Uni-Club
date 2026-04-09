-- Add canapes to the menu type constraint
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_menu_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_menu_check
  CHECK (menu IN ('breakfast', 'lunch', 'beverages', 'canapes'));

-- Seed canapes items
INSERT INTO menu_items (menu, name, sort_order) VALUES
  ('canapes', 'Rare Roast Beef mini-Yorkshire puddings horseradish cream', 1),
  ('canapes', 'Truffled mushroom and brie de Meaux', 2),
  ('canapes', 'Soy glazed belly of pork served on Chinese spoons', 3),
  ('canapes', 'Spinach and goats cheese frittata', 4),
  ('canapes', 'Honey glazed cocktail sausages', 5),
  ('canapes', 'Smoked Salmon Blinis', 6),
  ('canapes', 'Bloody Mary Prawn cocktail croustades', 7),
  ('canapes', 'Goats cheese and spinach tartlets', 8),
  ('canapes', 'Chicken yakatori skewers', 9),
  ('canapes', 'Mini cod''s of fish and chips', 10),
  ('canapes', 'Rosary ash goats cheese tartlets', 11),
  ('canapes', 'Mini vegetable and meat spring rolls and samosas', 12),
  ('canapes', 'Chicken liver parfait on toasted rye bread', 13);
