// Schema as a string so it ships with the compiled app (no file-copy needed) and can
// be applied on startup. Idempotent: everything uses IF NOT EXISTS.
export const SCHEMA = `
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

create table if not exists wallets (
  user_id   uuid primary key references users(id) on delete cascade,
  deposit   numeric(14,2) not null default 0,
  winnings  numeric(14,2) not null default 0,
  currency  text not null default 'USD'
);

create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  type        text not null,
  amount      numeric(14,2) not null,
  note        text default '',
  created_at  timestamptz not null default now()
);
create index if not exists idx_tx_user on transactions(user_id, created_at desc);

create table if not exists payout_methods (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  vpa         text not null,
  name        text not null,
  verified    boolean not null default false,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  mode          int not null default 1,
  stake         numeric(14,2) not null,
  player_a      uuid not null references users(id),
  player_b      uuid references users(id),
  status        text not null default 'open',
  room_code     text,
  join_deadline timestamptz,
  winner_id     uuid references users(id),
  created_at    timestamptz not null default now(),
  settled_at    timestamptz
);
create index if not exists idx_match_status on matches(status, created_at desc);

-- number of seats a match needs filled before it goes live (2 for 1v1, 4 for 4-player)
alter table matches add column if not exists seats int not null default 2;

-- every player who staked into a match (source of truth for the pot and payouts)
create table if not exists match_players (
  match_id   uuid not null references matches(id) on delete cascade,
  user_id    uuid not null references users(id),
  stake      numeric(14,2) not null,
  joined_at  timestamptz not null default now(),
  primary key (match_id, user_id)
);
create index if not exists idx_match_players_match on match_players(match_id);

create table if not exists match_reports (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references matches(id) on delete cascade,
  user_id    uuid not null references users(id),
  result     text not null,
  proof_url  text,
  created_at timestamptz not null default now(),
  unique (match_id, user_id)
);

-- admin flag + approval status for deposits/withdrawals
alter table users add column if not exists is_admin boolean not null default false;
alter table transactions add column if not exists status text not null default 'completed';
create index if not exists idx_tx_status on transactions(status, created_at desc);

-- Expo push tokens, one row per device token (a user may have several devices).
create table if not exists push_tokens (
  token      text primary key,
  user_id    uuid not null references users(id) on delete cascade,
  platform   text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_push_user on push_tokens(user_id);

-- Support chat: a flat thread per user, sender is 'user' or 'support'.
create table if not exists support_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  sender     text not null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_support_user on support_messages(user_id, created_at);
`;
