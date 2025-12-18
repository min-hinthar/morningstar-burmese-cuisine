-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enum definitions
do $$
begin
    if not exists (select 1 from pg_type where typname = 'customization_type') then
        create type customization_type as enum ('DEFAULT', 'NO_PORK', 'BEEF_GOAT', 'VEGETARIAN');
    end if;
    if not exists (select 1 from pg_type where typname = 'subscription_status') then
        create type subscription_status as enum ('active', 'paused', 'canceled', 'pending');
    end if;
    if not exists (select 1 from pg_type where typname = 'order_status') then
        create type order_status as enum ('pending', 'confirmed', 'delivered', 'canceled');
    end if;
    if not exists (select 1 from pg_type where typname = 'payment_status') then
        create type payment_status as enum ('requires_action', 'succeeded', 'failed', 'refunded');
    end if;
end $$;

create table if not exists users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    name text not null,
    phone text,
    created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists addresses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    street text not null,
    city text not null,
    state text not null,
    zip text not null,
    is_default boolean default false,
    created_at timestamp with time zone default timezone('utc', now()),
    updated_at timestamp with time zone default timezone('utc', now())
);

create unique index if not exists addresses_default_unique on addresses (user_id)
    where is_default = true;

create table if not exists subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    status subscription_status not null default 'pending',
    customization_type customization_type not null default 'DEFAULT',
    stripe_subscription_id text,
    start_date date,
    next_delivery_date date,
    delivered_weeks_count integer not null default 0,
    min_commitment_weeks integer not null default 4,
    created_at timestamp with time zone default timezone('utc', now()),
    updated_at timestamp with time zone default timezone('utc', now())
);

create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    subscription_id uuid references subscriptions(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    customization_type customization_type not null,
    delivery_date date not null,
    status order_status not null default 'pending',
    total_price numeric(10,2) default 0,
    created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    name text not null,
    qty integer not null default 1,
    unit_price numeric(10,2) not null default 0,
    is_addon boolean default false
);

create table if not exists payments (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    stripe_payment_intent_id text,
    stripe_invoice_id text,
    status payment_status,
    amount numeric(10,2),
    captured_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists cutoff_windows (
    id uuid primary key default gen_random_uuid(),
    order_deadline_at timestamp with time zone not null,
    delivery_day text not null default 'Sunday',
    timezone text not null default 'America/Los_Angeles'
);

insert into cutoff_windows (order_deadline_at, delivery_day, timezone)
values (timezone('America/Los_Angeles', date_trunc('week', now()) + interval '5 days' + interval '15 hours'), 'Sunday', 'America/Los_Angeles')
on conflict do nothing;
