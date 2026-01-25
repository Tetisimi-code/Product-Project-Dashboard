-- Create table if it doesn't exist (safe)
create table if not exists public.product_catalog (
  product_id text primary key,
  product_name text not null,
  product_description text,
  manual_url text not null,
  display_order integer not null
);

-- Seed / upsert products
with cfg as (
  select 'https://cdjrrnbihbkzmmaccslj.supabase.co/storage/v1/object/public/product-manuals' as base_url
)
insert into public.product_catalog (
  product_id,
  product_name,
  product_description,
  manual_url,
  display_order
)
select
  v.product_id,
  v.product_name,
  v.product_description,
  cfg.base_url || '/' || v.filename,
  v.display_order
from
  cfg,
  (values
    ('frequency_and_rocof', 'Frequency and ROCOF', 'Visualize frequency and ROCOF', 'frequency-and-rocof-manual.docx', 1),
    ('spot_inertia_event_analysis', 'Event analysis', 'Spot inertia with event analysis', 'event-analysis-manual.docx', 2),
    ('oscillations', 'Oscillations', 'Oscillation Events', 'oscillations-manual.docx', 3),
    ('measurement', 'Measurement', 'Cloud-based file management', 'measurement-manual.docx', 4),
    ('inertia_monitoring', 'Monitoring', 'Inertia monitoring', 'monitoring-manual.docx', 5),
    ('passive_system_strength', 'Passive System Strength', 'Passive events', 'passive-system-strength-manual.docx', 6),
    ('active_system_strength', 'Active System Strength', 'Active Events', 'active-system-strength-manual.docx', 7),
    ('voltage', 'Voltage', 'Displays system voltage', 'voltage-manual.docx', 8),
    ('instantaneous_flicker_and_voltage', 'Instantaneous Flicker and Voltage', 'Instantaneous Flicker and Voltage', 'instantaneous-flicker-and-voltage-manual.docx', 9)
  ) as v(product_id, product_name, product_description, filename, display_order)
on conflict (product_id)
do update set
  product_name = excluded.product_name,
  product_description = excluded.product_description,
  manual_url = excluded.manual_url,
  display_order = excluded.display_order;
