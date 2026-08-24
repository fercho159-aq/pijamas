-- ═══════════════════════════════════════════════════════════════
-- Rossy Lady · schema.sql
-- Postgres / Supabase. Ejecutar antes de seed.sql.
-- ═══════════════════════════════════════════════════════════════

begin;

-- ── Catálogo ────────────────────────────────────────────────────

create table if not exists categorias (
  id     uuid primary key default gen_random_uuid(),
  slug   text unique not null,
  nombre text not null,
  orden  int  default 0,
  activa boolean default true
);

create table if not exists productos (
  id               uuid primary key default gen_random_uuid(),
  numero_modelo    int unique,
  nombre           text not null,
  slug             text unique not null,
  categoria_id     uuid references categorias(id),
  descripcion      text,
  composicion      text,                      -- NOM-004-SCFI
  cuidados         text,
  precio_lista     numeric(10,2) not null check (precio_lista > 0),
  precio_oferta    numeric(10,2) check (precio_oferta > 0),
  oferta_inicia    timestamptz,
  oferta_termina   timestamptz,
  destacado        boolean default false,
  orden_destacado  int,
  activo           boolean default true,
  meta_titulo      text,
  meta_descripcion text,
  creado_en        timestamptz default now(),
  actualizado_en   timestamptz default now(),
  constraint oferta_menor_que_lista
    check (precio_oferta is null or precio_oferta < precio_lista),
  constraint oferta_con_fin
    check (precio_oferta is null or oferta_termina is not null)
);

create table if not exists variantes (
  id           uuid primary key default gen_random_uuid(),
  producto_id  uuid references productos(id) on delete cascade,
  color_nombre text not null,
  color_hex    text not null check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  sku          text unique,
  stock        int not null default 0 check (stock >= 0),
  orden        int default 0,
  activa       boolean default true
);

create table if not exists variante_imagenes (
  id          uuid primary key default gen_random_uuid(),
  variante_id uuid references variantes(id) on delete cascade,
  url         text not null,
  alt         text,
  ancho       int,
  alto        int,
  orden       int default 0
);

create table if not exists tallas (
  codigo text primary key,
  orden  int
);

create table if not exists variante_tallas (
  variante_id  uuid references variantes(id) on delete cascade,
  talla_codigo text references tallas(codigo),
  disponible   boolean default true,
  primary key (variante_id, talla_codigo)
);

-- ── Pedidos ─────────────────────────────────────────────────────

create table if not exists pedidos (
  id               uuid primary key default gen_random_uuid(),
  folio            text unique not null,
  canal            text not null check (canal in ('whatsapp','mercadopago')),
  estado           text not null default 'nuevo'
                   check (estado in ('nuevo','confirmado','pagado',
                                     'enviado','entregado','cancelado')),
  cliente_nombre   text,
  cliente_telefono text,
  cliente_email    text,
  envio_calle text, envio_colonia text, envio_ciudad text,
  envio_estado text, envio_cp text, envio_referencias text,
  subtotal         numeric(10,2),
  envio            numeric(10,2),
  total            numeric(10,2),
  mp_payment_id    text unique,          -- idempotencia del webhook
  mp_estado        text,
  guia_paqueteria  text,
  notas            text,
  creado_en        timestamptz default now(),
  entregado_en     timestamptz
);

create table if not exists pedido_items (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid references pedidos(id) on delete cascade,
  variante_id     uuid references variantes(id),
  talla_codigo    text,
  cantidad        int not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null,
  nombre_snapshot text
);

-- ── Confianza ───────────────────────────────────────────────────

create table if not exists resenas (
  id           uuid primary key default gen_random_uuid(),
  producto_id  uuid references productos(id) on delete cascade,
  pedido_id    uuid references pedidos(id) not null,   -- sin compra no hay reseña
  nombre       text not null,
  ciudad       text,
  calificacion int check (calificacion between 1 and 5),
  texto        text,
  foto_url     text,
  estatura_cm  int,          -- "mide 1.60, pidió M"
  talla_pedida text,
  aprobada     boolean default false,
  creada_en    timestamptz default now(),
  unique (pedido_id, producto_id)        -- una reseña por producto por pedido
);

create table if not exists config (
  clave text primary key,
  valor jsonb
);

-- ── Índices ─────────────────────────────────────────────────────

create index if not exists ix_prod_cat      on productos(categoria_id) where activo;
create index if not exists ix_prod_destac   on productos(orden_destacado) where destacado and activo;
create index if not exists ix_prod_oferta   on productos(oferta_termina) where precio_oferta is not null;
create index if not exists ix_var_prod      on variantes(producto_id) where activa;
create index if not exists ix_img_var       on variante_imagenes(variante_id, orden);
create index if not exists ix_ped_estado    on pedidos(estado, creado_en desc);
create index if not exists ix_item_ped      on pedido_items(pedido_id);
create index if not exists ix_resena_prod   on resenas(producto_id) where aprobada;

-- ── Folio incremental: RL-00001 ─────────────────────────────────

create sequence if not exists folio_seq start 1;

create or replace function set_folio() returns trigger
language plpgsql as $$
begin
  if new.folio is null or new.folio = '' then
    new.folio := 'RL-' || lpad(nextval('folio_seq')::text, 5, '0');
  end if;
  return new;
end $$;

drop trigger if exists tg_folio on pedidos;
create trigger tg_folio before insert on pedidos
  for each row execute function set_folio();

-- ── actualizado_en automático ───────────────────────────────────

create or replace function touch() returns trigger
language plpgsql as $$
begin new.actualizado_en := now(); return new; end $$;

drop trigger if exists tg_touch on productos;
create trigger tg_touch before update on productos
  for each row execute function touch();

-- ── Precio vigente: una sola fuente de verdad ───────────────────
-- El contador de oferta y el precio que se cobra leen ESTA función.
-- Por eso el contador no puede mentir.

create or replace function precio_vigente(p productos) returns numeric
language sql stable as $$
  select case
    when p.precio_oferta is not null
     and (p.oferta_inicia  is null or p.oferta_inicia  <= now())
     and (p.oferta_termina is null or p.oferta_termina >  now())
    then p.precio_oferta
    else p.precio_lista
  end
$$;

-- ── RLS ─────────────────────────────────────────────────────────
-- Catálogo: lectura pública de lo activo. Escritura solo autenticado.
-- Pedidos y reseñas: nada de lectura pública.

alter table categorias        enable row level security;
alter table productos         enable row level security;
alter table variantes         enable row level security;
alter table variante_imagenes enable row level security;
alter table tallas            enable row level security;
alter table variante_tallas   enable row level security;
alter table pedidos           enable row level security;
alter table pedido_items      enable row level security;
alter table resenas           enable row level security;
alter table config            enable row level security;

-- lectura pública del catálogo
create policy p_cat_read  on categorias        for select using (activa);
create policy p_prod_read on productos         for select using (activo);
create policy p_var_read  on variantes         for select using (activa);
create policy p_img_read  on variante_imagenes for select using (true);
create policy p_tal_read  on tallas            for select using (true);
create policy p_vt_read   on variante_tallas   for select using (true);
create policy p_cfg_read  on config            for select using (true);

-- reseñas: solo las aprobadas
create policy p_res_read on resenas for select using (aprobada);

-- escritura: solo sesión autenticada (el admin)
create policy p_cat_w  on categorias        for all to authenticated using (true) with check (true);
create policy p_prod_w on productos         for all to authenticated using (true) with check (true);
create policy p_var_w  on variantes         for all to authenticated using (true) with check (true);
create policy p_img_w  on variante_imagenes for all to authenticated using (true) with check (true);
create policy p_tal_w  on tallas            for all to authenticated using (true) with check (true);
create policy p_vt_w   on variante_tallas   for all to authenticated using (true) with check (true);
create policy p_cfg_w  on config            for all to authenticated using (true) with check (true);
create policy p_res_w  on resenas           for all to authenticated using (true) with check (true);
create policy p_ped_w  on pedidos           for all to authenticated using (true) with check (true);
create policy p_item_w on pedido_items      for all to authenticated using (true) with check (true);

-- Los pedidos del público se crean desde el servidor con la service role
-- key, que ignora RLS. Nunca desde el navegador.

commit;
