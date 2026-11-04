-- Cute Icles schema. Portable SQL: runs on MySQL 8 and on H2 (MODE=MySQL) for tests.
-- Money is DECIMAL. Instants are DATETIME(6) and always hold UTC.

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(20) NOT NULL DEFAULT '',
  password_hash VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT uq_users_email UNIQUE (email)
);

-- One row per signed-in browser session. The JWT carries this id (jti); logout revokes the row.
CREATE TABLE auth_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  revoked_at DATETIME(6) NULL,
  user_agent VARCHAR(255) NULL,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_sessions_user ON auth_sessions (user_id);

-- Only a SHA-256 hash of the token is stored; the token itself exists only in the email/link.
CREATE TABLE password_reset_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  used_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL,
  CONSTRAINT uq_reset_token UNIQUE (token_hash),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(170) NOT NULL,
  description VARCHAR(2000) NOT NULL DEFAULT '',
  category VARCHAR(80) NOT NULL DEFAULT '',
  price DECIMAL(10,2) NULL,
  duration_min INT NOT NULL,
  image_url VARCHAR(500) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT uq_services_slug UNIQUE (slug)
);

-- Single row (id = 1): studio profile and the configurable business rules.
CREATE TABLE studio_settings (
  id BIGINT PRIMARY KEY,
  studio_name VARCHAR(150) NOT NULL,
  tagline VARCHAR(200) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL DEFAULT '',
  email VARCHAR(190) NOT NULL DEFAULT '',
  address VARCHAR(500) NOT NULL DEFAULT '',
  map_url VARCHAR(500) NOT NULL DEFAULT '',
  service_area VARCHAR(300) NOT NULL DEFAULT '',
  instagram VARCHAR(300) NOT NULL DEFAULT '',
  facebook VARCHAR(300) NOT NULL DEFAULT '',
  whatsapp VARCHAR(300) NOT NULL DEFAULT '',
  hours_note VARCHAR(300) NOT NULL DEFAULT '',
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  slot_interval_min INT NOT NULL DEFAULT 30,
  buffer_min INT NOT NULL DEFAULT 0,
  cancel_hours_before INT NOT NULL DEFAULT 24,
  min_notice_hours INT NOT NULL DEFAULT 12,
  max_days_ahead INT NOT NULL DEFAULT 60,
  chairs INT NOT NULL DEFAULT 1,
  booking_policy_text VARCHAR(1000) NOT NULL DEFAULT '',
  delivery_charge DECIMAL(10,2) NULL,
  free_above DECIMAL(10,2) NULL,
  min_order_value DECIMAL(10,2) NULL,
  delivery_text VARCHAR(1000) NOT NULL DEFAULT '',
  hero_title VARCHAR(300) NOT NULL DEFAULT '',
  hero_text VARCHAR(600) NOT NULL DEFAULT '',
  about_title VARCHAR(300) NOT NULL DEFAULT '',
  notify_booking_email BOOLEAN NOT NULL DEFAULT TRUE,
  notify_order_email BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at DATETIME(6) NOT NULL
);

CREATE TABLE about_paragraphs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  position INT NOT NULL,
  body VARCHAR(2000) NOT NULL
);

-- day_of_week follows the frontend: 0 = Sunday ... 6 = Saturday.
CREATE TABLE working_hours (
  day_of_week INT PRIMARY KEY,
  is_open BOOLEAN NOT NULL DEFAULT FALSE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

CREATE TABLE studio_breaks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(100) NOT NULL DEFAULT '',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

CREATE TABLE blocked_dates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(100) NOT NULL DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

CREATE TABLE appointments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  service_name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NULL,
  duration_min INT NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(190) NOT NULL DEFAULT '',
  customer_phone VARCHAR(30) NOT NULL,
  notes VARCHAR(2000) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL,
  admin_note VARCHAR(2000) NOT NULL DEFAULT '',
  cancellation_reason VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_appt_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_appt_service FOREIGN KEY (service_id) REFERENCES services (id)
);
CREATE INDEX idx_appt_date_status ON appointments (appointment_date, status);
CREATE INDEX idx_appt_user ON appointments (user_id);
CREATE INDEX idx_appt_service ON appointments (service_id);

CREATE TABLE appointment_status_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  appointment_id BIGINT NOT NULL,
  from_status VARCHAR(20) NULL,
  to_status VARCHAR(20) NOT NULL,
  note VARCHAR(2000) NOT NULL DEFAULT '',
  changed_by BIGINT NULL,
  changed_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_ash_appt FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
  CONSTRAINT fk_ash_user FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE SET NULL
);
CREATE INDEX idx_ash_appt ON appointment_status_history (appointment_id);

CREATE TABLE gallery_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  CONSTRAINT uq_gallery_category UNIQUE (name)
);

CREATE TABLE gallery_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(1000) NOT NULL DEFAULT '',
  category VARCHAR(80) NOT NULL DEFAULT '',
  image_path VARCHAR(500) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
CREATE INDEX idx_gallery_pub_order ON gallery_items (published, display_order);

CREATE TABLE gallery_item_tags (
  gallery_item_id BIGINT NOT NULL,
  tag VARCHAR(40) NOT NULL,
  PRIMARY KEY (gallery_item_id, tag),
  CONSTRAINT fk_gtag_item FOREIGN KEY (gallery_item_id) REFERENCES gallery_items (id) ON DELETE CASCADE
);

CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  description VARCHAR(4000) NOT NULL DEFAULT '',
  category VARCHAR(80) NOT NULL DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2) NULL,
  sku VARCHAR(60) NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT uq_products_slug UNIQUE (slug)
);
CREATE INDEX idx_products_active ON products (active, category);

CREATE TABLE product_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  url VARCHAR(500) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_pimg_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
CREATE INDEX idx_pimg_product ON product_images (product_id);

CREATE TABLE product_details (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  body VARCHAR(300) NOT NULL,
  CONSTRAINT fk_pdet_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
CREATE INDEX idx_pdet_product ON product_details (product_id);

CREATE TABLE product_options (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  name VARCHAR(60) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_popt_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
CREATE INDEX idx_popt_product ON product_options (product_id);

CREATE TABLE product_option_values (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  option_id BIGINT NOT NULL,
  option_value VARCHAR(80) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_poptv_option FOREIGN KEY (option_id) REFERENCES product_options (id) ON DELETE CASCADE
);
CREATE INDEX idx_poptv_option ON product_option_values (option_id);

CREATE TABLE product_variants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  sku VARCHAR(60) NOT NULL DEFAULT '',
  stock INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL,
  CONSTRAINT ck_variant_stock CHECK (stock >= 0),
  CONSTRAINT fk_pvar_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
CREATE INDEX idx_pvar_product ON product_variants (product_id);

CREATE TABLE variant_selections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  variant_id BIGINT NOT NULL,
  option_name VARCHAR(60) NOT NULL,
  option_value VARCHAR(80) NOT NULL,
  CONSTRAINT fk_vsel_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
);
CREATE INDEX idx_vsel_variant ON variant_selections (variant_id);

CREATE TABLE inventory_adjustments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  variant_id BIGINT NOT NULL,
  delta INT NOT NULL,
  reason VARCHAR(200) NOT NULL DEFAULT '',
  admin_id BIGINT NULL,
  created_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_invadj_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
  CONSTRAINT fk_invadj_admin FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE carts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT uq_cart_user UNIQUE (user_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT NOT NULL,
  variant_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  CONSTRAINT uq_cart_variant UNIQUE (cart_id, variant_id),
  CONSTRAINT fk_citem_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
  CONSTRAINT fk_citem_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NULL,
  user_id BIGINT NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(190) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  ship_name VARCHAR(120) NOT NULL,
  ship_phone VARCHAR(30) NOT NULL,
  ship_street VARCHAR(300) NOT NULL,
  ship_locality VARCHAR(150) NOT NULL,
  ship_city VARCHAR(100) NOT NULL,
  ship_state VARCHAR(100) NOT NULL,
  ship_pin VARCHAR(10) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  delivery_fee DECIMAL(12,2) NULL,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  tracking_carrier VARCHAR(100) NOT NULL DEFAULT '',
  tracking_number VARCHAR(100) NOT NULL DEFAULT '',
  admin_note VARCHAR(2000) NOT NULL DEFAULT '',
  idem_key VARCHAR(80) NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT uq_orders_number UNIQUE (order_number),
  CONSTRAINT uq_orders_idem UNIQUE (user_id, idem_key),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
);
CREATE INDEX idx_orders_user ON orders (user_id, created_at);
CREATE INDEX idx_orders_status ON orders (status);

CREATE TABLE order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  variant_id BIGINT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  sku VARCHAR(60) NOT NULL DEFAULT '',
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT fk_oitem_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_oitem_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT fk_oitem_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id)
);
CREATE INDEX idx_oitem_order ON order_items (order_id);
CREATE INDEX idx_oitem_variant ON order_items (variant_id);

CREATE TABLE order_item_options (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_item_id BIGINT NOT NULL,
  option_name VARCHAR(60) NOT NULL,
  option_value VARCHAR(80) NOT NULL,
  CONSTRAINT fk_oiopt_item FOREIGN KEY (order_item_id) REFERENCES order_items (id) ON DELETE CASCADE
);

CREATE TABLE order_status_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL,
  changed_by BIGINT NULL,
  changed_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_osh_user FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE SET NULL
);
CREATE INDEX idx_osh_order ON order_status_history (order_id);

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  method VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  provider_reference VARCHAR(100) NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);
CREATE INDEX idx_pay_order ON payments (order_id);

CREATE TABLE activity_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  body VARCHAR(300) NOT NULL,
  created_at DATETIME(6) NOT NULL
);
CREATE INDEX idx_activity_created ON activity_log (created_at);

-- Delivery record only. Never contains message bodies, tokens or passwords.
CREATE TABLE notification_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(40) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  recipient_user_id BIGINT NULL,
  status VARCHAR(20) NOT NULL,
  detail VARCHAR(200) NULL,
  created_at DATETIME(6) NOT NULL
);
