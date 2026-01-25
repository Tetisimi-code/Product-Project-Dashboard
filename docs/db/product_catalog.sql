-- Product catalog table with single manual URL per product

create table if not exists product_catalog (
  product_id text primary key,
  product_name text not null,
  product_description text,
  manual_url text not null,
  display_order integer not null default 0
);
