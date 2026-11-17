-- Ludora schema. Run against the DIRECT Supabase connection (not the pooler):
--   npm run migrate   (uses DATABASE_URL)
-- Safe to re-run: everything uses IF NOT EXISTS.

create extension if not exists "pgcrypto";

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text unique not null,
  email         text,
  password_hash text not null,
  rating        int not null default 1820,
  referral_code text unique not null,
  referred_by   uuid references users(id),
  created_at    timestamptz not null default now()
);

-- one wallet row per user; money lives here and only the backend writes it
create table if not exists wallets (
  user_id   uuid primary key references users(id) on delete cascade,
  deposit   numeric(14,2) not null default 0,
  winnings  numeric(14,2) not null default 0,
  currency  text not null default 'USD'
);

create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  type        text not null,          -- deposit | withdraw | win | stake | referral | refund
  amount      numeric(14,2) not null, -- positive credit, negative debit
  note        text default '',
  created_at  timestamptz not null default now()
);
create index if not exists idx_tx_user on transactions(user_id, created_at desc);

create table if not exists payout_methods (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  vpa         text not null,
  name        text not null,          -- verified account-holder name
  verified    boolean not null default false,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  mode          int not null default 1,     -- 1 = 1v1 duel, 2 = 4-player royale
  stake         numeric(14,2) not null,
  player_a      uuid not null references users(id),
  player_b      uuid references users(id),
  status        text not null default 'open', -- open | waiting | live | settled | cancelled
  room_code     text,
  join_deadline timestamptz,
  winner_id     uuid references users(id),
  created_at    timestamptz not null default now(),
  settled_at    timestamptz
);
create index if not exists idx_match_status on matches(status, created_at desc);

-- each player's reported result for a match (used to verify before payout)
create table if not exists match_reports (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references matches(id) on delete cascade,
  user_id    uuid not null references users(id),
  result     text not null,          -- win | lose
  proof_url  text,
  created_at timestamptz not null default now(),
  unique (match_id, user_id)
);
