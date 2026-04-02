-- Menu items table — replaces hardcoded menu in the website
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu TEXT NOT NULL CHECK (menu IN ('breakfast', 'lunch', 'beverages')),
  category TEXT,
  section TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  formats TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_menu_items_menu ON menu_items(menu);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);

-- RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menu_items_read"
ON menu_items FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "menu_items_admin_all"
ON menu_items FOR ALL
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Storage bucket for menu photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-photos', 'menu-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "menu_photos_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-photos');

CREATE POLICY "menu_photos_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-photos'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "menu_photos_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-photos'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Seed current menu data

-- Breakfast
INSERT INTO menu_items (menu, category, name, description, price, sort_order) VALUES
  ('breakfast', NULL, 'Full English Breakfast', 'Egg, Bacon, Sausages, Tomatoes, Mushrooms, Black Pudding and Hash Browns (Beans optional)', '£24.50', 1),
  ('breakfast', NULL, 'Continental Breakfast', NULL, '£14.50', 2),
  ('breakfast', NULL, 'Vegetarian Breakfast', 'Pre-order required', '£18.50', 3),
  ('breakfast', NULL, 'Smoked Salmon & Scrambled Eggs', NULL, '£18.50', 4),
  ('breakfast', NULL, 'Bacon or Sausage Sandwich', NULL, '£8.50', 5);

-- Lunch starters
INSERT INTO menu_items (menu, category, name, sort_order) VALUES
  ('lunch', 'Starters', 'Homemade Soup of the Day', 1),
  ('lunch', 'Starters', 'CUC Prawn Cocktail', 2),
  ('lunch', 'Starters', 'Devilled Kidneys, With Toasted Sourdough', 3),
  ('lunch', 'Starters', 'Goats Cheese, Tomato and Spinach Tart, Dressed Salad', 4),
  ('lunch', 'Starters', 'Smoked Salmon Plate, Capers, Shallots, Lemon Oil, Brown Bread and Butter', 5);

-- Lunch mains
INSERT INTO menu_items (menu, category, name, sort_order) VALUES
  ('lunch', 'Mains', 'Oven Roasted Breast of Free-Range Chicken, Colcannon Potatoes, Braised Carrots, Bourguignon Sauce', 1),
  ('lunch', 'Mains', 'Pan Fried Fillet of Sea Bream, Herb Butter, New Potatoes, Carrot Puree, Braised Fennel, Watercress and Pernod Cream Sauce', 2),
  ('lunch', 'Mains', '"CUC" Confit Belly of Pork, Bacon and Apple Mash, Buttered Sweetheart Cabbage, Seasonal Vegetables, Crackling, Apple Sauce and Cider Jus', 3),
  ('lunch', 'Mains', 'Roast Rump and Braised Lamb Shoulder Rissole, Tomato and Basil Fondue, Herb Broad Beans and Peas, Red Currant Jus', 4),
  ('lunch', 'Mains', 'Whole Dover Sole "on or off the bone", Spinach, Parsley Steamed New Potatoes, Tomato and Caper Butter Sauce', 5),
  ('lunch', 'Mains', 'Homemade Pasta, Wilted Spinach, Porcini Cream, Freshly Grated Parmesan Truffle Oil', 6);

-- Lunch puddings
INSERT INTO menu_items (menu, category, name, sort_order) VALUES
  ('lunch', 'Puddings', '"CUC" Sticky Toffee Pudding, Vanilla Custard', 1),
  ('lunch', 'Puddings', 'Chocolate Fondant, Vanilla Ice Cream and Chocolate Sauce', 2),
  ('lunch', 'Puddings', 'Selection of Cheeses, Celery, Grapes and Crackers', 3),
  ('lunch', 'Puddings', 'Selection of Ice Cream and Sorbets', 4);

-- Beverages
INSERT INTO menu_items (menu, section, name, formats, sort_order) VALUES
  ('beverages', 'Dessert Wine', 'Sauterne – Château Les Mingets 2019', 'Bottle · Glass', 1),
  ('beverages', 'Dessert Wine', 'Alison Botrytis Riesling 2020', 'Half Bottle', 2),
  ('beverages', 'Port', 'Quinta Da Roenda – Croft 2004', 'Glass', 3),
  ('beverages', 'Port', 'Fonseca Reserve Bin 27', 'Glass', 4);
