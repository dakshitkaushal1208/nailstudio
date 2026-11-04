-- DEV SEED. Sample services and demo products copied from the frontend's sample data.
-- Loaded only when the "dev" profile (or tests) includes classpath:db/seed. Not shipped in production.
-- None of this is the real studio's catalogue: replace it in Admin.

INSERT INTO services (name, slug, description, category, price, duration_min, image_url, active, display_order, created_at, updated_at)
VALUES ('Gel Manicure', 'gel-manicure', 'Careful prep, cuticle care and a long-wearing gel colour in a finish of your choice.', 'Gel polish', 1200, 60, '/images/sample/s-gel.svg', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO services (name, slug, description, category, price, duration_min, image_url, active, display_order, created_at, updated_at)
VALUES ('Nail Extensions', 'nail-extensions', 'Sculpted length and shape, built around your natural nail. Colour included.', 'Extensions', 2800, 120, '/images/sample/s-extensions.svg', TRUE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO services (name, slug, description, category, price, duration_min, image_url, active, display_order, created_at, updated_at)
VALUES ('French Manicure', 'french-manicure', 'The classic, drawn by hand: from a fine, barely-there line to a deeper tip.', 'French', 1500, 75, '/images/sample/s-french.svg', TRUE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO services (name, slug, description, category, price, duration_min, image_url, active, display_order, created_at, updated_at)
VALUES ('Nail Art, Bespoke', 'nail-art-bespoke', 'Florals, chrome, pearls and fine-line work. Bring a reference and we will plan it together.', 'Nail art', 3500, 150, '/images/sample/s-art.svg', TRUE, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO services (name, slug, description, category, price, duration_min, image_url, active, display_order, created_at, updated_at)
VALUES ('Soak-off & Removal', 'soak-off-removal', 'A gentle removal of gel or extensions, followed by a short nail-health treatment.', 'Removal', 500, 30, '/images/sample/s-removal.svg', TRUE, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- Soft French
INSERT INTO products (name, slug, description, category, price, sku, featured, active, created_at, updated_at)
VALUES ('Soft French', 'soft-french', 'A sheer milky base with a slim white edge, sized to wear with everything. Each set includes ten nails in your size, nail glue, adhesive tabs, a mini file and a prep pad.', 'French', 1450, 'SET-01', TRUE, TRUE, TIMESTAMPADD(DAY, -4, CURRENT_TIMESTAMP), TIMESTAMPADD(DAY, -4, CURRENT_TIMESTAMP));
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), '/images/sample/p01-a.svg', 0);
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), '/images/sample/p01-b.svg', 1);
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), 0, 'Ten nails per set');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), 1, 'Reusable with care');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), 2, 'Hand-finished, not machine-printed');
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), 'Shape', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND name = 'Shape'), 'Almond', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND name = 'Shape'), 'Coffin', 1);
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), 'Size', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND name = 'Size'), 'XS', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND name = 'Size'), 'S', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND name = 'Size'), 'M', 2);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND name = 'Size'), 'L', 3);
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), '01-01', 6, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-01'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-01'), 'Size', 'XS');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), '01-02', 6, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-02'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-02'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), '01-03', 6, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-03'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-03'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), '01-04', 2, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-04'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-04'), 'Size', 'L');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), '01-05', 0, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-05'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-05'), 'Size', 'XS');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), '01-06', 6, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-06'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-06'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), '01-07', 6, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-07'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-07'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'soft-french'), '01-08', 2, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-08'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'soft-french') AND sku = '01-08'), 'Size', 'L');

-- Quiet Nude
INSERT INTO products (name, slug, description, category, price, sku, featured, active, created_at, updated_at)
VALUES ('Quiet Nude', 'quiet-nude', 'One even rose-beige wash on a soft oval. The set to keep in a drawer for the days that need nothing else.', 'Minimal', 1250, 'SET-02', TRUE, TRUE, TIMESTAMPADD(DAY, -12, CURRENT_TIMESTAMP), TIMESTAMPADD(DAY, -12, CURRENT_TIMESTAMP));
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), '/images/sample/p02-a.svg', 0);
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), '/images/sample/p02-b.svg', 1);
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), 0, 'Ten nails per set');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), 1, 'Soft satin finish');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), 2, 'Prep kit included');
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), 'Size', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND name = 'Size'), 'XS', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND name = 'Size'), 'S', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND name = 'Size'), 'M', 2);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND name = 'Size'), 'L', 3);
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), 'Shape', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND name = 'Shape'), 'Oval', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND name = 'Shape'), 'Square', 1);
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), '02-01', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-01'), 'Size', 'XS');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-01'), 'Shape', 'Oval');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), '02-02', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-02'), 'Size', 'XS');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-02'), 'Shape', 'Square');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), '02-03', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-03'), 'Size', 'S');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-03'), 'Shape', 'Oval');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), '02-04', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-04'), 'Size', 'S');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-04'), 'Shape', 'Square');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), '02-05', 8, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-05'), 'Size', 'M');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-05'), 'Shape', 'Oval');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), '02-06', 8, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-06'), 'Size', 'M');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-06'), 'Shape', 'Square');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), '02-07', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-07'), 'Size', 'L');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-07'), 'Shape', 'Oval');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'quiet-nude'), '02-08', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-08'), 'Size', 'L');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'quiet-nude') AND sku = '02-08'), 'Shape', 'Square');

-- Garden Party
INSERT INTO products (name, slug, description, category, price, sku, featured, active, created_at, updated_at)
VALUES ('Garden Party', 'garden-party', 'Tiny hand-painted blossoms with gold centres on an ivory ground. Slightly more finish work per nail, which shows.', 'Floral', 1850, 'SET-03', TRUE, TRUE, TIMESTAMPADD(DAY, -2, CURRENT_TIMESTAMP), TIMESTAMPADD(DAY, -2, CURRENT_TIMESTAMP));
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'garden-party'), '/images/sample/p03-a.svg', 0);
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'garden-party'), '/images/sample/p03-b.svg', 1);
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'garden-party'), 0, 'Ten nails per set');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'garden-party'), 1, 'Hand-painted detail');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'garden-party'), 2, 'Prep kit included');
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'garden-party'), 'Shape', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'garden-party') AND name = 'Shape'), 'Almond', 0);
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'garden-party'), 'Size', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'garden-party') AND name = 'Size'), 'S', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'garden-party') AND name = 'Size'), 'M', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'garden-party') AND name = 'Size'), 'L', 2);
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'garden-party'), '03-01', 1, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'garden-party') AND sku = '03-01'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'garden-party') AND sku = '03-01'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'garden-party'), '03-02', 3, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'garden-party') AND sku = '03-02'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'garden-party') AND sku = '03-02'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'garden-party'), '03-03', 3, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'garden-party') AND sku = '03-03'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'garden-party') AND sku = '03-03'), 'Size', 'L');

-- Liquid Gold
INSERT INTO products (name, slug, description, category, price, sku, featured, active, created_at, updated_at)
VALUES ('Liquid Gold', 'liquid-gold', 'A warm gold chrome over a sheer base. It moves from champagne to amber as the light changes.', 'Chrome', 1950, 'SET-04', TRUE, TRUE, TIMESTAMPADD(DAY, -20, CURRENT_TIMESTAMP), TIMESTAMPADD(DAY, -20, CURRENT_TIMESTAMP));
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), '/images/sample/p04-a.svg', 0);
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), '/images/sample/p04-b.svg', 1);
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), 0, 'Ten nails per set');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), 1, 'Mirror-chrome finish');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), 2, 'Prep kit included');
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), 'Shape', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND name = 'Shape'), 'Almond', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND name = 'Shape'), 'Coffin', 1);
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), 'Length', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND name = 'Length'), 'Short', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND name = 'Length'), 'Long', 1);
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), 'Size', 2);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND name = 'Size'), 'S', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND name = 'Size'), 'M', 1);
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), '04-01', 3, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-01'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-01'), 'Length', 'Short');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-01'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), '04-02', 3, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-02'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-02'), 'Length', 'Short');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-02'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), '04-03', 3, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-03'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-03'), 'Length', 'Long');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-03'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), '04-04', 3, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-04'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-04'), 'Length', 'Long');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-04'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), '04-05', 3, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-05'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-05'), 'Length', 'Short');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-05'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), '04-06', 3, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-06'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-06'), 'Length', 'Short');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-06'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), '04-07', 0, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-07'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-07'), 'Length', 'Long');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-07'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'liquid-gold'), '04-08', 0, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-08'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-08'), 'Length', 'Long');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'liquid-gold') AND sku = '04-08'), 'Size', 'M');

-- Cocoa Square
INSERT INTO products (name, slug, description, category, price, sku, featured, active, created_at, updated_at)
VALUES ('Cocoa Square', 'cocoa-square', 'Short, squared and milk-chocolate brown: practical enough for every day and still unmistakably considered.', 'Minimal', 1350, 'SET-05', FALSE, TRUE, TIMESTAMPADD(DAY, -30, CURRENT_TIMESTAMP), TIMESTAMPADD(DAY, -30, CURRENT_TIMESTAMP));
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), '/images/sample/p05-a.svg', 0);
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), '/images/sample/p05-b.svg', 1);
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), 0, 'Ten nails per set');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), 1, 'High-gloss finish');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), 2, 'Prep kit included');
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), 'Shape', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND name = 'Shape'), 'Square', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND name = 'Shape'), 'Coffin', 1);
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), 'Size', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND name = 'Size'), 'S', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND name = 'Size'), 'M', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND name = 'Size'), 'L', 2);
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), '05-01', 5, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-01'), 'Shape', 'Square');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-01'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), '05-02', 5, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-02'), 'Shape', 'Square');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-02'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), '05-03', 5, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-03'), 'Shape', 'Square');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-03'), 'Size', 'L');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), '05-04', 5, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-04'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-04'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), '05-05', 5, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-05'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-05'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'cocoa-square'), '05-06', 5, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-06'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'cocoa-square') AND sku = '05-06'), 'Size', 'L');

-- Rosette
INSERT INTO products (name, slug, description, category, price, sku, featured, active, created_at, updated_at)
VALUES ('Rosette', 'rosette', 'Gold flecks scattered across a dusty-rose base, with a set pearl on every accent nail. Made for evenings.', 'Glam', 2250, 'SET-06', FALSE, TRUE, TIMESTAMPADD(DAY, -8, CURRENT_TIMESTAMP), TIMESTAMPADD(DAY, -8, CURRENT_TIMESTAMP));
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), '/images/sample/p06-a.svg', 0);
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), '/images/sample/p06-b.svg', 1);
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), 0, 'Ten nails per set');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), 1, 'Set crystal accents');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), 2, 'Prep kit included');
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), 'Shape', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND name = 'Shape'), 'Coffin', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND name = 'Shape'), 'Almond', 1);
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), 'Size', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND name = 'Size'), 'XS', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND name = 'Size'), 'S', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND name = 'Size'), 'M', 2);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND name = 'Size'), 'L', 3);
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), '06-01', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-01'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-01'), 'Size', 'XS');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), '06-02', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-02'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-02'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), '06-03', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-03'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-03'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), '06-04', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-04'), 'Shape', 'Coffin');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-04'), 'Size', 'L');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), '06-05', 2, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-05'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-05'), 'Size', 'XS');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), '06-06', 2, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-06'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-06'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), '06-07', 2, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-07'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-07'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'rosette'), '06-08', 2, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-08'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'rosette') AND sku = '06-08'), 'Size', 'L');

-- Blush & Bloom
INSERT INTO products (name, slug, description, category, price, sku, featured, active, created_at, updated_at)
VALUES ('Blush & Bloom', 'blush-bloom', 'A soft French on one hand and florals on the accent nails of the other. A mixed set that wears like a whole look.', 'Floral', 1650, 'SET-07', FALSE, TRUE, TIMESTAMPADD(DAY, -45, CURRENT_TIMESTAMP), TIMESTAMPADD(DAY, -45, CURRENT_TIMESTAMP));
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'blush-bloom'), '/images/sample/p07-a.svg', 0);
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'blush-bloom'), '/images/sample/p07-b.svg', 1);
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'blush-bloom'), 0, 'Ten nails per set');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'blush-bloom'), 1, 'Mixed French and floral');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'blush-bloom'), 2, 'Prep kit included');
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'blush-bloom'), 'Size', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'blush-bloom') AND name = 'Size'), 'S', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'blush-bloom') AND name = 'Size'), 'M', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'blush-bloom') AND name = 'Size'), 'L', 2);
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'blush-bloom'), '07-01', 0, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'blush-bloom') AND sku = '07-01'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'blush-bloom'), '07-02', 5, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'blush-bloom') AND sku = '07-02'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'blush-bloom'), '07-03', 0, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'blush-bloom') AND sku = '07-03'), 'Size', 'L');

-- Champagne Mirror
INSERT INTO products (name, slug, description, category, price, sku, featured, active, created_at, updated_at)
VALUES ('Champagne Mirror', 'champagne-mirror', 'A pale champagne chrome with a polished, reflective finish. Quiet and bright at the same time.', 'Chrome', 1750, 'SET-08', FALSE, TRUE, TIMESTAMPADD(DAY, -60, CURRENT_TIMESTAMP), TIMESTAMPADD(DAY, -60, CURRENT_TIMESTAMP));
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), '/images/sample/p08-a.svg', 0);
INSERT INTO product_images (product_id, url, position) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), '/images/sample/p08-b.svg', 1);
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), 0, 'Ten nails per set');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), 1, 'Mirror-chrome finish');
INSERT INTO product_details (product_id, position, body) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), 2, 'Prep kit included');
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), 'Shape', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND name = 'Shape'), 'Almond', 0);
INSERT INTO product_options (product_id, name, position) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), 'Size', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND name = 'Size'), 'XS', 0);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND name = 'Size'), 'S', 1);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND name = 'Size'), 'M', 2);
INSERT INTO product_option_values (option_id, option_value, position) VALUES ((SELECT id FROM product_options WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND name = 'Size'), 'L', 3);
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), '08-01', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND sku = '08-01'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND sku = '08-01'), 'Size', 'XS');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), '08-02', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND sku = '08-02'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND sku = '08-02'), 'Size', 'S');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), '08-03', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND sku = '08-03'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND sku = '08-03'), 'Size', 'M');
INSERT INTO product_variants (product_id, sku, stock, active, created_at) VALUES ((SELECT id FROM products WHERE slug = 'champagne-mirror'), '08-04', 4, TRUE, CURRENT_TIMESTAMP);
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND sku = '08-04'), 'Shape', 'Almond');
INSERT INTO variant_selections (variant_id, option_name, option_value) VALUES ((SELECT id FROM product_variants WHERE product_id = (SELECT id FROM products WHERE slug = 'champagne-mirror') AND sku = '08-04'), 'Size', 'L');
