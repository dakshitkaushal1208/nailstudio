-- Reference data every environment needs. Values are SAMPLE defaults: change them in Admin > Settings
-- and Admin > Availability. Contact details and policies are intentionally blank or generic.

INSERT INTO studio_settings (
  id, studio_name, tagline, booking_policy_text, delivery_text, hero_title, hero_text, about_title, updated_at
) VALUES (
  1, 'Cute Icles', 'Nail art & press-on sets',
  'Requests are held until the studio approves them. You can cancel a request, or an approved appointment, up to 24 hours beforehand.',
  'Delivery is arranged by hand. Once the studio confirms your order it will contact you about payment and the delivery charge for your address.',
  'Beautiful nails. Thoughtfully crafted.',
  'Appointments for hand-finished nail art, and ready-made press-on sets for the days you cannot be in the chair.',
  'A quiet room, a careful hand.',
  CURRENT_TIMESTAMP
);

INSERT INTO about_paragraphs (position, body) VALUES
  (1, 'Placeholder copy. Tell visitors how the studio works: how you approach shape and finish, what an appointment feels like, and what you want every set to do for the person wearing it.'),
  (2, 'Press-on sets are made in the same spirit as salon work, so a ready-to-wear set still feels considered. Replace this text in Admin > Settings.');

-- Sample opening hours (matches the frontend sample): Sunday and Monday closed.
INSERT INTO working_hours (day_of_week, is_open, start_time, end_time) VALUES
  (0, FALSE, '10:00:00', '19:00:00'),
  (1, FALSE, '10:00:00', '19:00:00'),
  (2, TRUE,  '10:00:00', '19:00:00'),
  (3, TRUE,  '10:00:00', '19:00:00'),
  (4, TRUE,  '10:00:00', '19:00:00'),
  (5, TRUE,  '10:00:00', '19:00:00'),
  (6, TRUE,  '10:00:00', '18:00:00');

INSERT INTO studio_breaks (label, start_time, end_time) VALUES ('Lunch', '13:30:00', '14:30:00');

INSERT INTO gallery_categories (name, position) VALUES
  ('French', 1), ('Minimal', 2), ('Floral', 3), ('Chrome', 4), ('Glam', 5), ('Press-on Sets', 6);
