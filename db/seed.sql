-- ═══════════════════════════════════════════════════════════════
-- Rossy Lady · seed.sql
-- Catálogo completo: 26 modelos, 85 variantes de color.
--
-- PRECIOS: referencia de mercado (Coppel / Andrea / Suburbia / Ilusión).
--          El cliente DEBE confirmarlos antes de publicar.
-- COMPOSICIÓN: propuesta. Es obligación legal (NOM-004-SCFI) que
--          coincida con la tela real. CONFIRMAR ANTES DE LANZAR.
-- COLORES: nombrados a partir de las fotos reales del catálogo.
-- STOCK: sembrado en 0. Capturar existencias reales en el admin.
-- ═══════════════════════════════════════════════════════════════

begin;

-- ── Tallas ──────────────────────────────────────────────────────
insert into tallas (codigo, orden) values
  ('CH', 0),
  ('M', 1),
  ('G', 2),
  ('XG', 3),
  ('2XG', 4)
on conflict (codigo) do nothing;

-- ── Categorías ──────────────────────────────────────────────────
insert into categorias (slug, nombre, orden) values
  ('dama',      'Pijamas para dama', 1),
  ('camisones', 'Camisones',         2),
  ('caballero', 'Pijamas para caballero', 3)
on conflict (slug) do nothing;

-- ── Configuración ───────────────────────────────────────────────
insert into config (clave, valor) values
  ('whatsapp_numero',    '"52XXXXXXXXXX"'::jsonb),
  ('envio_gratis_desde', '699'::jsonb),
  ('costo_envio_base',   '99'::jsonb),
  ('hora_corte_envio',   '"16:00"'::jsonb),
  ('mercadopago_activo', 'false'::jsonb),
  ('banner_anuncio',     '"Envío gratis en pedidos desde $699"'::jsonb)
on conflict (clave) do update set valor = excluded.valor;

-- ── 102 ALEXA ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (102, 'Alexa', '102-alexa',
     (select id from categorias where slug = 'dama'),
     'Conjunto de manga corta con cuello en V y short con resorte suave. Estampado de florecitas en todo el cuerpo.',
     '60% algodón / 40% poliéster · 170 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     349, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Menta', '#C9E4D8', 'RL-102-MEN', 0),
    ('Cielo', '#BFD9EF', 'RL-102-CIE', 1),
    ('Mantequilla', '#F5E3A8', 'RL-102-MAN', 2),
    ('Rosa', '#F3C9D4', 'RL-102-ROS', 3)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 103 MARILYN ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (103, 'Marilyn', '103-marilyn',
     (select id from categorias where slug = 'dama'),
     'Blusa de tirantes ancho y capri a media pierna. Punto liso, fresco para noches templadas.',
     '60% algodón / 40% poliéster · 170 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     369, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Rosa', '#F3C9D4', 'RL-103-ROS', 0),
    ('Durazno', '#F7C6A3', 'RL-103-DUR', 1),
    ('Menta', '#C9E4D8', 'RL-103-MEN', 2),
    ('Cielo', '#BFD9EF', 'RL-103-CIE', 3),
    ('Mantequilla', '#F5E3A8', 'RL-103-MAN', 4)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 104 ANNET ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (104, 'Annet', '104-annet',
     (select id from categorias where slug = 'dama'),
     'Playera blanca de manga corta con vivo de color y capri a juego. El contraste no se despinta: es tela teñida, no estampado.',
     '60% algodón / 40% poliéster · 170 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     389, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Durazno', '#F7C6A3', 'RL-104-DUR', 0),
    ('Cielo', '#BFD9EF', 'RL-104-CIE', 1),
    ('Rosa', '#F3C9D4', 'RL-104-ROS', 2),
    ('Menta', '#C9E4D8', 'RL-104-MEN', 3),
    ('Verde agua', '#BCDCD2', 'RL-104-VER', 4)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 105 MICHELLE ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (105, 'Michelle', '105-michelle',
     (select id from categorias where slug = 'dama'),
     'Tirantes con pantalón largo de puño recto. El modelo más pedido para época de frío ligero.',
     '60% algodón / 40% poliéster · 170 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     399, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Rosa', '#F3C9D4', 'RL-105-ROS', 0),
    ('Cielo', '#BFD9EF', 'RL-105-CIE', 1),
    ('Menta', '#C9E4D8', 'RL-105-MEN', 2),
    ('Mantequilla', '#F5E3A8', 'RL-105-MAN', 3),
    ('Durazno', '#F7C6A3', 'RL-105-DUR', 4)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 107 VERO ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (107, 'Vero', '107-vero',
     (select id from categorias where slug = 'dama'),
     'Manga corta con cuello en V y pantalón largo holgado. Corte amplio, sin costuras que aprieten.',
     '60% algodón / 40% poliéster · 170 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     419, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Rosa', '#F3C9D4', 'RL-107-ROS', 0),
    ('Menta', '#C9E4D8', 'RL-107-MEN', 1),
    ('Mantequilla', '#F5E3A8', 'RL-107-MAN', 2),
    ('Durazno', '#F7C6A3', 'RL-107-DUR', 3)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 108 PATY ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (108, 'Paty', '108-paty',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con carita de perro estampada al frente. Largo a la rodilla, con abertura lateral.',
     '60% algodón / 40% poliéster · 165 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     259, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Mantequilla', '#F5E3A8', 'RL-108-MAN', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 109 DIANA ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (109, 'Diana', '109-diana',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con estampado menudo en todo el cuerpo. Corte holgado.',
     '60% algodón / 40% poliéster · 165 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     259, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Cielo', '#BFD9EF', 'RL-109-CIE', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 111 JAZMÍN ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (111, 'Jazmín', '111-jazmin',
     (select id from categorias where slug = 'camisones'),
     'Camisón abotonado con cuello camisero, dos bolsas y estampado menudo. Se abre por completo.',
     '60% algodón / 40% poliéster · 165 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     259, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Mantequilla', '#F5E3A8', 'RL-111-MAN', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 117 FRIDA ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (117, 'Frida', '117-frida',
     (select id from categorias where slug = 'dama'),
     'Manga corta y capri en color firme, con flor de lis bordada en pecho y pierna. Bordado real: no se cuartea ni se despinta.',
     '100% algodón · 180 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     459, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Morado', '#6B3FA0', 'RL-117-MOR', 0),
    ('Azul rey', '#1B4FA0', 'RL-117-AZU', 1),
    ('Fucsia', '#D6007F', 'RL-117-FUC', 2)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 120 HÉCTOR ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (120, 'Héctor', '120-hector',
     (select id from categorias where slug = 'caballero'),
     'Conjunto de caballero de manga larga con cuello redondo y pantalón largo. Punto grueso, para dormir con fresco.',
     '60% algodón / 40% poliéster · 180 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     469, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Azul rey', '#1B4FA0', 'RL-120-AZU', 0),
    ('Rojo', '#C8352C', 'RL-120-ROJ', 1),
    ('Amarillo', '#F5D547', 'RL-120-AMA', 2),
    ('Vino', '#7A2233', 'RL-120-VIN', 3),
    ('Azul', '#4A7FC1', 'RL-120-AZU', 4),
    ('Gris jaspe', '#B9B7B4', 'RL-120-GRI', 5),
    ('Verde jade', '#2E9E7B', 'RL-120-VER', 6),
    ('Negro', '#1C1C1C', 'RL-120-NEG', 7)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 124 ALONDRA ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (124, 'Alondra', '124-alondra',
     (select id from categorias where slug = 'dama'),
     'Camisa de botones con bolsa al pecho y pantalón largo. El clásico de dos piezas abotonado.',
     '60% algodón / 40% poliéster · 170 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     419, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Durazno', '#F7C6A3', 'RL-124-DUR', 0),
    ('Cielo', '#BFD9EF', 'RL-124-CIE', 1),
    ('Coral', '#F0A088', 'RL-124-COR', 2),
    ('Menta', '#C9E4D8', 'RL-124-MEN', 3),
    ('Mantequilla', '#F5E3A8', 'RL-124-MAN', 4)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 126 LINDA ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (126, 'Linda', '126-linda',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con carita de gato al frente. Largo a la rodilla.',
     '60% algodón / 40% poliéster · 165 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     259, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Rosa', '#F3C9D4', 'RL-126-ROS', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 127 DENISE ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (127, 'Denise', '127-denise',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con rana estampada al frente. Corte amplio.',
     '60% algodón / 40% poliéster · 165 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     259, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Menta', '#C9E4D8', 'RL-127-MEN', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 128 KATY ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (128, 'Katy', '128-katy',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con gatito estampado de cuerpo entero. Largo a la rodilla.',
     '60% algodón / 40% poliéster · 165 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     259, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Cielo', '#BFD9EF', 'RL-128-CIE', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 129 JACKIE ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (129, 'Jackie', '129-jackie',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con pollito estampado al frente. Corte holgado.',
     '60% algodón / 40% poliéster · 165 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     259, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Rosa', '#F3C9D4', 'RL-129-ROS', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 135 WILLY ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (135, 'Willy', '135-willy',
     (select id from categorias where slug = 'caballero'),
     'Playera de manga corta con ribete en cuello y mangas, y short con bolsas. Conjunto de caballero para calor.',
     '60% algodón / 40% poliéster · 175 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     389, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Rosa', '#F3C9D4', 'RL-135-ROS', 0),
    ('Cielo', '#BFD9EF', 'RL-135-CIE', 1),
    ('Mantequilla', '#F5E3A8', 'RL-135-MAN', 2),
    ('Aqua', '#A8DCD9', 'RL-135-AQU', 3)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 137 CINDY ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (137, 'Cindy', '137-cindy',
     (select id from categorias where slug = 'dama'),
     'Tirantes delgados y short suelto. La opción más fresca del catálogo.',
     '60% algodón / 40% poliéster · 170 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     329, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Mantequilla', '#F5E3A8', 'RL-137-MAN', 0),
    ('Hueso', '#F2EDE4', 'RL-137-HUE', 1),
    ('Rosa', '#F3C9D4', 'RL-137-ROS', 2),
    ('Cielo', '#BFD9EF', 'RL-137-CIE', 3),
    ('Durazno', '#F7C6A3', 'RL-137-DUR', 4)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 141 VIVIAN ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (141, 'Vivian', '141-vivian',
     (select id from categorias where slug = 'dama'),
     'Manga corta con pantalón largo de corte recto. Punto liso en tonos pastel.',
     '60% algodón / 40% poliéster · 170 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     419, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Menta', '#C9E4D8', 'RL-141-MEN', 0),
    ('Durazno', '#F7C6A3', 'RL-141-DUR', 1),
    ('Mantequilla', '#F5E3A8', 'RL-141-MAN', 2),
    ('Rosa', '#F3C9D4', 'RL-141-ROS', 3),
    ('Cielo', '#BFD9EF', 'RL-141-CIE', 4)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 142 PENNY ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (142, 'Penny', '142-penny',
     (select id from categorias where slug = 'dama'),
     'Tirantes con pantalón largo entallado al tobillo. Silueta larga y ligera.',
     '60% algodón / 40% poliéster · 170 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     399, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Durazno', '#F7C6A3', 'RL-142-DUR', 0),
    ('Menta', '#C9E4D8', 'RL-142-MEN', 1),
    ('Mantequilla', '#F5E3A8', 'RL-142-MAN', 2),
    ('Rosa', '#F3C9D4', 'RL-142-ROS', 3),
    ('Cielo', '#BFD9EF', 'RL-142-CIE', 4)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 143 MIKE ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (143, 'Mike', '143-mike',
     (select id from categorias where slug = 'caballero'),
     'Manga larga con botones al cuello, bolsa al pecho y pantalón de cuadros en franela de algodón. El más abrigador del catálogo.',
     '100% algodón, tejido franela · 160 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     499, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Azul', '#4A7FC1', 'RL-143-AZU', 0),
    ('Azul rey', '#1B4FA0', 'RL-143-AZU', 1),
    ('Camel', '#B07D4F', 'RL-143-CAM', 2),
    ('Gris topo', '#9A8F84', 'RL-143-GRI', 3),
    ('Azul marino', '#22314F', 'RL-143-AZU', 4),
    ('Negro', '#1C1C1C', 'RL-143-NEG', 5),
    ('Rojo', '#C8352C', 'RL-143-ROJ', 6),
    ('Vino', '#7A2233', 'RL-143-VIN', 7),
    ('Cielo', '#BFD9EF', 'RL-143-CIE', 8)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 157 SANDRA ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (157, 'Sandra', '157-sandra',
     (select id from categorias where slug = 'dama'),
     'Manga corta y capri con girasoles bordados en pecho y piernas. Colores firmes que aguantan lavada tras lavada.',
     '100% algodón · 180 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     459, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Verde bandera', '#0E7A4B', 'RL-157-VER', 0),
    ('Fucsia', '#D6007F', 'RL-157-FUC', 1),
    ('Morado', '#6B3FA0', 'RL-157-MOR', 2),
    ('Azul rey', '#1B4FA0', 'RL-157-AZU', 3)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 158 ELOÍSA ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (158, 'Eloísa', '158-eloisa',
     (select id from categorias where slug = 'dama'),
     'Manga corta y capri con margaritas bordadas. Bordado a hilo, no estampado.',
     '100% algodón · 180 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     459, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Morado', '#6B3FA0', 'RL-158-MOR', 0),
    ('Azul rey', '#1B4FA0', 'RL-158-AZU', 1),
    ('Fucsia', '#D6007F', 'RL-158-FUC', 2)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 160 GLORIA ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (160, 'Gloria', '160-gloria',
     (select id from categorias where slug = 'dama'),
     'Blusa blanca de tirantes con short de color y flores bordadas en ambas piezas.',
     '100% algodón · 180 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     359, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Azul marino', '#22314F', 'RL-160-AZU', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 161 MARA ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (161, 'Mara', '161-mara',
     (select id from categorias where slug = 'dama'),
     'Blusa blanca de tirantes con short naranja y girasoles bordados. Short con bolsas laterales.',
     '100% algodón · 180 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     359, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Naranja', '#F07A21', 'RL-161-NAR', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 162 SONIA ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (162, 'Sonia', '162-sonia',
     (select id from categorias where slug = 'dama'),
     'Blusa blanca de tirantes con short de color y flores bordadas. Short con bolsas.',
     '100% algodón · 180 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     359, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Morado', '#6B3FA0', 'RL-162-MOR', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

-- ── 163 NELLY ─────────────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion,
     composicion, cuidados, precio_lista, activo)
  values (163, 'Nelly', '163-nelly',
     (select id from categorias where slug = 'dama'),
     'Blusa blanca de tirantes con ribete de color, short a juego y flores bordadas.',
     '100% algodón · 180 g/m²',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     359, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, c.nombre, c.hex, c.sku, 0, c.orden from p, (values
    ('Rojo', '#C8352C', 'RL-163-ROJ', 0)
  ) as c(nombre, hex, sku, orden)
  returning id
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t;

commit;

-- ── Resumen ─────────────────────────────────────────────────────
-- Productos:  26
-- Variantes:  85
-- Tallas/var: 5  →  425 filas en variante_tallas
