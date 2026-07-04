create table if not exists guesses (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  day_index integer not null,
  date date not null,
  question_id integer not null,
  low double precision not null,
  high double precision not null,
  confidence double precision not null,
  score double precision not null,
  hit boolean not null,
  submitted_at timestamptz not null default now(),
  unique (device_id, day_index)
);

create index if not exists guesses_device_id_idx on guesses (device_id);
create index if not exists guesses_day_index_idx on guesses (day_index);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  device_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_type_idx on events (event_type);
create index if not exists events_created_at_idx on events (created_at);

alter table guesses enable row level security;
alter table events enable row level security;
