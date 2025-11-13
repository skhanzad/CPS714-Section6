
create table if not exists users (
    id uuid primary key default gen_random_uuid()
);

create table if not exists events (
    id uuid primary key default gen_random_uuid()
);

create table rewards_profile (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users (id),
    earned_credits integer not null default 0,
    current_credits integer not null default 0
);

create table credit_transactions (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references rewards_profile (id),
    -- credits received from event/RSVP record
    event_id uuid references events (id),
    -- amount of points received
    amount integer not null,
    received_at timestamp not null default now ()
);

create table rewards (
    id uuid primary key default gen_random_uuid(),
    item text not null,
    description text,
    image_url text,
    quantity integer not null check (quantity >= 0),
    default_cost integer not null check (default_cost >= 0),
    discount_cost integer check (discount_cost >= 0),
    listed_at timestamp not null default now ()
);

create table redeemed_rewards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users (id),
    reward_id uuid not null references rewards (id),
    total_cost integer not null check (total_cost >= 0),
    redeemed_at timestamp not null default now ()
);

