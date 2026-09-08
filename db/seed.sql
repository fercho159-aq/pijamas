-- ═══════════════════════════════════════════════════════════════
-- Rossy Lady · seed.sql
-- GENERADO desde data/catalogo.json. No editar a mano: los dos
-- archivos tienen que decir lo mismo.
--
-- ORIGEN: «ROSSY LADY LISTA DE PRECIOS.xlsx» de la clienta.
-- PRECIOS: son los suyos. Falta que confirme si son de mayoreo o
--          de venta al público.
-- STOCK:   sembrado en 0. Capturar existencias reales en el panel.
-- FOTOS:   solo las variantes que ya tienen foto insertan en
--          variante_imagenes. Las demás se ven como muestra de color.
-- ═══════════════════════════════════════════════════════════════

begin;

-- ── Tallas ──────────────────────────────────────────────────────
insert into tallas (codigo, orden) values
  ('CH', 0),
  ('M', 1),
  ('G', 2),
  ('XG', 3),
  ('XX', 4),
  ('XXX', 5)
on conflict (codigo) do nothing;

-- ── Categorías ──────────────────────────────────────────────────
insert into categorias (slug, nombre, orden) values
  ('pijamas-cortas', 'Pijamas cortas', 1),
  ('camisones', 'Camisones', 2),
  ('batas', 'Batas', 3),
  ('pijamas-largas', 'Pijamas largas', 4),
  ('casa-y-calle', 'Casa y calle', 5),
  ('caballero', 'Caballero', 6)
on conflict (slug) do nothing;

-- ── Configuración ───────────────────────────────────────────────
-- Marcadores de posición: el envío y el WhatsApp los define la clienta.
insert into config (clave, valor) values
  ('whatsapp_numero',    '"52XXXXXXXXXX"'::jsonb),
  ('envio_gratis_desde', '699'::jsonb),
  ('costo_envio_base',   '99'::jsonb),
  ('hora_corte_envio',   '"16:00"'::jsonb),
  ('mercadopago_activo', 'false'::jsonb),
  ('banner_anuncio',     '"Envío gratis en pedidos desde $699"'::jsonb)
on conflict (clave) do update set valor = excluded.valor;

-- ── 101 DANIELA ───────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (101, 'Daniela', '101-daniela',
     (select id from categorias where slug = 'pijamas-cortas'),
     'Conjunto de camiseta de tirantes y bermuda, en chifón de algodón con estampado en todo el cuerpo.',
     'Tirantes + bermuda',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     149, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-101-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-101-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-101-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-101-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-101-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 102 ALEXA ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (102, 'Alexa', '102-alexa',
     (select id from categorias where slug = 'pijamas-cortas'),
     'Conjunto de manga corta con cuello en V y short con resorte suave. Estampado de florecitas en todo el cuerpo.',
     'Manga corta + short',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     159, true, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-102-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-102-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-102-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-102-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-102-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-102-ROS', '/productos/102-rosa.jpg', 'Alexa, modelo 102, color Rosa'),
    ('RL-102-AGU', '/productos/102-menta.jpg', 'Alexa, modelo 102, color Agua'),
    ('RL-102-CIE', '/productos/102-cielo.jpg', 'Alexa, modelo 102, color Cielo'),
    ('RL-102-AMA', '/productos/102-mantequilla.jpg', 'Alexa, modelo 102, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 103 MARILYN ───────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (103, 'Marilyn', '103-marilyn',
     (select id from categorias where slug = 'pijamas-cortas'),
     'Blusa de tirantes ancho y capri a media pierna. Punto liso, fresco para noches templadas.',
     'Tirantes + capri',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     179, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-103-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-103-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-103-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-103-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-103-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-103-ROS', '/productos/103-rosa.jpg', 'Marilyn, modelo 103, color Rosa'),
    ('RL-103-COR', '/productos/103-durazno.jpg', 'Marilyn, modelo 103, color Coral'),
    ('RL-103-AGU', '/productos/103-menta.jpg', 'Marilyn, modelo 103, color Agua'),
    ('RL-103-CIE', '/productos/103-cielo.jpg', 'Marilyn, modelo 103, color Cielo'),
    ('RL-103-AMA', '/productos/103-mantequilla.jpg', 'Marilyn, modelo 103, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 104 ANNET ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (104, 'Annet', '104-annet',
     (select id from categorias where slug = 'pijamas-cortas'),
     'Playera blanca de manga corta con vivo de color y capri a juego. El contraste no se despinta: es tela teñida, no estampado.',
     'Manga corta + capri',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     189, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-104-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-104-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-104-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-104-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-104-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-104-ROS', '/productos/104-rosa.jpg', 'Annet, modelo 104, color Rosa'),
    ('RL-104-COR', '/productos/104-durazno.jpg', 'Annet, modelo 104, color Coral'),
    ('RL-104-AGU', '/productos/104-verde-agua.jpg', 'Annet, modelo 104, color Agua'),
    ('RL-104-CIE', '/productos/104-cielo.jpg', 'Annet, modelo 104, color Cielo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 105 MICHELLE ──────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (105, 'Michelle', '105-michelle',
     (select id from categorias where slug = 'pijamas-largas'),
     'Tirantes con pantalón largo de puño recto. El modelo más pedido para época de frío ligero.',
     'Tirantes + pantalón',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     169, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-105-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-105-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-105-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-105-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-105-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-105-ROS', '/productos/105-rosa.jpg', 'Michelle, modelo 105, color Rosa'),
    ('RL-105-COR', '/productos/105-durazno.jpg', 'Michelle, modelo 105, color Coral'),
    ('RL-105-AGU', '/productos/105-menta.jpg', 'Michelle, modelo 105, color Agua'),
    ('RL-105-CIE', '/productos/105-cielo.jpg', 'Michelle, modelo 105, color Cielo'),
    ('RL-105-AMA', '/productos/105-mantequilla.jpg', 'Michelle, modelo 105, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 107 VERO ──────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (107, 'Vero', '107-vero',
     (select id from categorias where slug = 'pijamas-largas'),
     'Manga corta con cuello en V y pantalón largo holgado. Corte amplio, sin costuras que aprieten.',
     'Manga corta + pantalón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     189, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-107-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-107-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-107-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-107-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-107-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-107-ROS', '/productos/107-rosa.jpg', 'Vero, modelo 107, color Rosa'),
    ('RL-107-COR', '/productos/107-durazno.jpg', 'Vero, modelo 107, color Coral'),
    ('RL-107-AGU', '/productos/107-menta.jpg', 'Vero, modelo 107, color Agua'),
    ('RL-107-AMA', '/productos/107-mantequilla.jpg', 'Vero, modelo 107, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 108 PATY ──────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (108, 'Paty', '108-paty',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con carita de perro estampada al frente. Largo a la rodilla, con abertura lateral.',
     'Camisón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     129, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-108-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-108-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-108-AGU', 0, 2),
    ('Amarillo', '#F5E3A8', 'RL-108-AMA', 0, 3),
    ('Fucsia', '#D6007F', 'RL-108-FUC', 0, 4),
    ('Gris', '#B9B7B4', 'RL-108-GRI', 0, 5),
    ('Plumbago', '#8A93A8', 'RL-108-PLU', 0, 6)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-108-AMA', '/productos/108-mantequilla.jpg', 'Paty, modelo 108, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX', 'XXX');

-- ── 109 DIANA ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (109, 'Diana', '109-diana',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con estampado menudo en todo el cuerpo. Corte holgado.',
     'Camisón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     259, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Cielo', '#BFD9EF', 'RL-109-CIE', 0, 0)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-109-CIE', '/productos/109-cielo.jpg', 'Diana, modelo 109, color Cielo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX', 'XXX');

-- ── 111 JAZMIN ────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (111, 'Jazmin', '111-jazmin',
     (select id from categorias where slug = 'batas'),
     'Camisón abotonado con cuello camisero, dos bolsas y estampado menudo. Se abre por completo.',
     'Bata manga corta',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     169, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Amarillo', '#F5E3A8', 'RL-111-AMA', 0, 0)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-111-AMA', '/productos/111-mantequilla.jpg', 'Jazmin, modelo 111, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 117 FRIDA ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (117, 'Frida', '117-frida',
     (select id from categorias where slug = 'casa-y-calle'),
     'Manga corta y capri en color firme, con flor de lis bordada en pecho y pierna. Bordado real: no se cuartea ni se despinta.',
     'Bordado + capri',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     239, true, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Morado', '#6B3FA0', 'RL-117-MOR', 0, 0),
    ('Fucsia', '#D6007F', 'RL-117-FUC', 0, 1),
    ('Jade', '#2E9E7B', 'RL-117-JAD', 0, 2),
    ('Naranja', '#F07A21', 'RL-117-NAR', 0, 3)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-117-MOR', '/productos/117-morado.jpg', 'Frida, modelo 117, color Morado'),
    ('RL-117-FUC', '/productos/117-fucsia.jpg', 'Frida, modelo 117, color Fucsia')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 120 HEC ───────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (120, 'Hec', '120-hec',
     (select id from categorias where slug = 'caballero'),
     'Conjunto de caballero de manga larga con cuello redondo y pantalón largo. Punto grueso, para dormir con fresco.',
     'Manga larga + pantalón',
     'Tela piqué 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     219, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rey', '#1B4FA0', 'RL-120-REY', 0, 0),
    ('Rojo', '#C8352C', 'RL-120-ROJ', 0, 1),
    ('Amarillo', '#F5E3A8', 'RL-120-AMA', 0, 2),
    ('Vino', '#7A2233', 'RL-120-VIN', 0, 3),
    ('Azul', '#4A7FC1', 'RL-120-AZU', 0, 4),
    ('Gris', '#B9B7B4', 'RL-120-GRI', 0, 5),
    ('Jade', '#2E9E7B', 'RL-120-JAD', 0, 6),
    ('Negro', '#1C1C1C', 'RL-120-NEG', 0, 7)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-120-REY', '/productos/120-azul-rey.jpg', 'Hec, modelo 120, color Rey'),
    ('RL-120-ROJ', '/productos/120-rojo.jpg', 'Hec, modelo 120, color Rojo'),
    ('RL-120-AMA', '/productos/120-amarillo.jpg', 'Hec, modelo 120, color Amarillo'),
    ('RL-120-VIN', '/productos/120-vino.jpg', 'Hec, modelo 120, color Vino'),
    ('RL-120-AZU', '/productos/120-azul.jpg', 'Hec, modelo 120, color Azul'),
    ('RL-120-GRI', '/productos/120-gris-jaspe.jpg', 'Hec, modelo 120, color Gris'),
    ('RL-120-JAD', '/productos/120-verde-jade.jpg', 'Hec, modelo 120, color Jade'),
    ('RL-120-NEG', '/productos/120-negro.jpg', 'Hec, modelo 120, color Negro')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G', 'XG');

-- ── 124 ALONDRA ───────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (124, 'Alondra', '124-alondra',
     (select id from categorias where slug = 'pijamas-largas'),
     'Camisa de botones con bolsa al pecho y pantalón largo. El clásico de dos piezas abotonado.',
     'Manga corta + pantalón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     189, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-124-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-124-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-124-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-124-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-124-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-124-COR', '/productos/124-durazno.jpg', 'Alondra, modelo 124, color Coral'),
    ('RL-124-AGU', '/productos/124-menta.jpg', 'Alondra, modelo 124, color Agua'),
    ('RL-124-CIE', '/productos/124-cielo.jpg', 'Alondra, modelo 124, color Cielo'),
    ('RL-124-AMA', '/productos/124-mantequilla.jpg', 'Alondra, modelo 124, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 126 LINDA ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (126, 'Linda', '126-linda',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con carita de gato al frente. Largo a la rodilla.',
     'Camisón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     129, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-126-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-126-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-126-AGU', 0, 2),
    ('Amarillo', '#F5E3A8', 'RL-126-AMA', 0, 3),
    ('Fucsia', '#D6007F', 'RL-126-FUC', 0, 4),
    ('Gris', '#B9B7B4', 'RL-126-GRI', 0, 5),
    ('Plumbago', '#8A93A8', 'RL-126-PLU', 0, 6)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-126-ROS', '/productos/126-rosa.jpg', 'Linda, modelo 126, color Rosa')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX', 'XXX');

-- ── 127 DENISE ────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (127, 'Denise', '127-denise',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con rana estampada al frente. Corte amplio.',
     'Camisón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     259, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Agua', '#BCDCD2', 'RL-127-AGU', 0, 0)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-127-AGU', '/productos/127-menta.jpg', 'Denise, modelo 127, color Agua')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX', 'XXX');

-- ── 128 KATY ──────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (128, 'Katy', '128-katy',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con gatito estampado de cuerpo entero. Largo a la rodilla.',
     'Camisón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     129, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-128-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-128-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-128-AGU', 0, 2),
    ('Amarillo', '#F5E3A8', 'RL-128-AMA', 0, 3),
    ('Fucsia', '#D6007F', 'RL-128-FUC', 0, 4),
    ('Gris', '#B9B7B4', 'RL-128-GRI', 0, 5),
    ('Plumbago', '#8A93A8', 'RL-128-PLU', 0, 6)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX', 'XXX');

-- ── 129 JAC ───────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (129, 'Jac', '129-jac',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta con pollito estampado al frente. Corte holgado.',
     'Camisón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     129, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-129-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-129-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-129-AGU', 0, 2),
    ('Amarillo', '#F5E3A8', 'RL-129-AMA', 0, 3),
    ('Fucsia', '#D6007F', 'RL-129-FUC', 0, 4),
    ('Gris', '#B9B7B4', 'RL-129-GRI', 0, 5),
    ('Plumbago', '#8A93A8', 'RL-129-PLU', 0, 6)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-129-ROS', '/productos/129-rosa.jpg', 'Jac, modelo 129, color Rosa')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX', 'XXX');

-- ── 135 WILLY ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (135, 'Willy', '135-willy',
     (select id from categorias where slug = 'caballero'),
     'Playera de manga corta con ribete en cuello y mangas, y short con bolsas. Conjunto de caballero para calor.',
     'Manga corta + short',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     195, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-135-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-135-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-135-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-135-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-135-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-135-ROS', '/productos/135-rosa.jpg', 'Willy, modelo 135, color Rosa'),
    ('RL-135-AGU', '/productos/135-aqua.jpg', 'Willy, modelo 135, color Agua'),
    ('RL-135-CIE', '/productos/135-cielo.jpg', 'Willy, modelo 135, color Cielo'),
    ('RL-135-AMA', '/productos/135-mantequilla.jpg', 'Willy, modelo 135, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G', 'XG');

-- ── 136 HARRY ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (136, 'Harry', '136-harry',
     (select id from categorias where slug = 'caballero'),
     'Playera de cuello en V manga corta con serigrafía «You are doing», y bermuda negra con jareta y bolsas.',
     'Manga corta + bermuda',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     195, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-136-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-136-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-136-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-136-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-136-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G', 'XG');

-- ── 137 CINDY ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (137, 'Cindy', '137-cindy',
     (select id from categorias where slug = 'pijamas-cortas'),
     'Tirantes delgados y short suelto. La opción más fresca del catálogo.',
     'Tirantes + short',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     149, true, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-137-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-137-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-137-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-137-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-137-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-137-ROS', '/productos/137-rosa.jpg', 'Cindy, modelo 137, color Rosa'),
    ('RL-137-COR', '/productos/137-durazno.jpg', 'Cindy, modelo 137, color Coral'),
    ('RL-137-CIE', '/productos/137-cielo.jpg', 'Cindy, modelo 137, color Cielo'),
    ('RL-137-AMA', '/productos/137-mantequilla.jpg', 'Cindy, modelo 137, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G', 'XG');

-- ── 141 VIVIAN ────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (141, 'Vivian', '141-vivian',
     (select id from categorias where slug = 'pijamas-largas'),
     'Manga corta con pantalón largo de corte recto. Punto liso en tonos pastel.',
     'Manga corta + pantalón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     169, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-141-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-141-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-141-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-141-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-141-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-141-ROS', '/productos/141-rosa.jpg', 'Vivian, modelo 141, color Rosa'),
    ('RL-141-COR', '/productos/141-durazno.jpg', 'Vivian, modelo 141, color Coral'),
    ('RL-141-AGU', '/productos/141-menta.jpg', 'Vivian, modelo 141, color Agua'),
    ('RL-141-CIE', '/productos/141-cielo.jpg', 'Vivian, modelo 141, color Cielo'),
    ('RL-141-AMA', '/productos/141-mantequilla.jpg', 'Vivian, modelo 141, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G', 'XG');

-- ── 142 PENNY ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (142, 'Penny', '142-penny',
     (select id from categorias where slug = 'pijamas-largas'),
     'Tirantes con pantalón largo entallado al tobillo. Silueta larga y ligera.',
     'Tirantes + pantalón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     179, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-142-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-142-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-142-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-142-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-142-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-142-ROS', '/productos/142-rosa.jpg', 'Penny, modelo 142, color Rosa'),
    ('RL-142-COR', '/productos/142-durazno.jpg', 'Penny, modelo 142, color Coral'),
    ('RL-142-AGU', '/productos/142-menta.jpg', 'Penny, modelo 142, color Agua'),
    ('RL-142-CIE', '/productos/142-cielo.jpg', 'Penny, modelo 142, color Cielo'),
    ('RL-142-AMA', '/productos/142-mantequilla.jpg', 'Penny, modelo 142, color Amarillo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G', 'XG');

-- ── 143 MIKE ──────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (143, 'Mike', '143-mike',
     (select id from categorias where slug = 'caballero'),
     'Manga larga con botones al cuello, bolsa al pecho y pantalón de cuadros en franela de algodón. El más abrigador del catálogo.',
     'Manga larga + franela',
     'Franela y chifón, 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     299, true, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Azul', '#4A7FC1', 'RL-143-AZU', 0, 0),
    ('Rey', '#1B4FA0', 'RL-143-REY', 0, 1),
    ('Camello', '#B07D4F', 'RL-143-CAM', 0, 2),
    ('Gris', '#B9B7B4', 'RL-143-GRI', 0, 3),
    ('Marino', '#22314F', 'RL-143-MAR', 0, 4),
    ('Negro', '#1C1C1C', 'RL-143-NEG', 0, 5),
    ('Rojo', '#C8352C', 'RL-143-ROJ', 0, 6),
    ('Vino', '#7A2233', 'RL-143-VIN', 0, 7),
    ('Cielo', '#BFD9EF', 'RL-143-CIE', 0, 8)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-143-AZU', '/productos/143-azul.jpg', 'Mike, modelo 143, color Azul'),
    ('RL-143-REY', '/productos/143-azul-rey.jpg', 'Mike, modelo 143, color Rey'),
    ('RL-143-CAM', '/productos/143-camel.jpg', 'Mike, modelo 143, color Camello'),
    ('RL-143-GRI', '/productos/143-gris-topo.jpg', 'Mike, modelo 143, color Gris'),
    ('RL-143-MAR', '/productos/143-azul-marino.jpg', 'Mike, modelo 143, color Marino'),
    ('RL-143-NEG', '/productos/143-negro.jpg', 'Mike, modelo 143, color Negro'),
    ('RL-143-ROJ', '/productos/143-rojo.jpg', 'Mike, modelo 143, color Rojo'),
    ('RL-143-VIN', '/productos/143-vino.jpg', 'Mike, modelo 143, color Vino'),
    ('RL-143-CIE', '/productos/143-cielo.jpg', 'Mike, modelo 143, color Cielo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G', 'XG');

-- ── 144 JESSICA ───────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (144, 'Jessica', '144-jessica',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta y cuello redondo, liso, con estampado serigrafiado al frente.',
     'Camisón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     129, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-144-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-144-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-144-AGU', 0, 2),
    ('Amarillo', '#F5E3A8', 'RL-144-AMA', 0, 3),
    ('Fucsia', '#D6007F', 'RL-144-FUC', 0, 4),
    ('Gris', '#B9B7B4', 'RL-144-GRI', 0, 5),
    ('Plumbago', '#8A93A8', 'RL-144-PLU', 0, 6)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX', 'XXX');

-- ── 145 ANAHI ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (145, 'Anahi', '145-anahi',
     (select id from categorias where slug = 'camisones'),
     'Camisón de manga corta y cuello redondo, en chifón de algodón con estampado en todo el cuerpo.',
     'Camisón',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     119, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-145-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-145-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-145-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-145-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-145-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 146 ISABELA ───────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (146, 'Isabela', '146-isabela',
     (select id from categorias where slug = 'pijamas-largas'),
     'Pantalón con jareta y bolsas, estampado en todo el cuerpo, con blusa blanca de manga larga y cuello en V bordada con una dama y una flor.',
     'Manga larga + pantalón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     229, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-146-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-146-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-146-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-146-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-146-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G', 'XG');

-- ── 147 AMAYA ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (147, 'Amaya', '147-amaya',
     (select id from categorias where slug = 'pijamas-largas'),
     'Pantalón con jareta y bolsas, estampado en todo el cuerpo, con blusa negra de manga larga y cuello redondo bordada con una luna.',
     'Manga larga + pantalón',
     '100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     229, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-147-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-147-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-147-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-147-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-147-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G', 'XG');

-- ── 157 SANDRA ────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (157, 'Sandra', '157-sandra',
     (select id from categorias where slug = 'casa-y-calle'),
     'Manga corta y capri con girasoles bordados en pecho y piernas. Colores firmes que aguantan lavada tras lavada.',
     'Bordado + capri',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     239, true, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Morado', '#6B3FA0', 'RL-157-MOR', 0, 0),
    ('Fucsia', '#D6007F', 'RL-157-FUC', 0, 1),
    ('Jade', '#2E9E7B', 'RL-157-JAD', 0, 2),
    ('Naranja', '#F07A21', 'RL-157-NAR', 0, 3)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-157-MOR', '/productos/157-morado.jpg', 'Sandra, modelo 157, color Morado'),
    ('RL-157-FUC', '/productos/157-fucsia.jpg', 'Sandra, modelo 157, color Fucsia'),
    ('RL-157-JAD', '/productos/157-verde-bandera.jpg', 'Sandra, modelo 157, color Jade')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 158 ELOISA ────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (158, 'Eloisa', '158-eloisa',
     (select id from categorias where slug = 'casa-y-calle'),
     'Manga corta y capri con margaritas bordadas. Bordado a hilo, no estampado.',
     'Bordado + capri',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     239, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Morado', '#6B3FA0', 'RL-158-MOR', 0, 0),
    ('Fucsia', '#D6007F', 'RL-158-FUC', 0, 1),
    ('Jade', '#2E9E7B', 'RL-158-JAD', 0, 2),
    ('Naranja', '#F07A21', 'RL-158-NAR', 0, 3)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-158-MOR', '/productos/158-morado.jpg', 'Eloisa, modelo 158, color Morado'),
    ('RL-158-FUC', '/productos/158-fucsia.jpg', 'Eloisa, modelo 158, color Fucsia')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX');

-- ── 160 GLORIA ────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (160, 'Gloria', '160-gloria',
     (select id from categorias where slug = 'pijamas-cortas'),
     'Blusa blanca de tirantes con short de color y flores bordadas en ambas piezas.',
     'Tirantes + short bordado',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     129, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Amarillo', '#F5E3A8', 'RL-160-AMA', 0, 0),
    ('Morado', '#6B3FA0', 'RL-160-MOR', 0, 1),
    ('Fucsia', '#D6007F', 'RL-160-FUC', 0, 2),
    ('Jade', '#2E9E7B', 'RL-160-JAD', 0, 3),
    ('Naranja', '#F07A21', 'RL-160-NAR', 0, 4),
    ('Rojo', '#C8352C', 'RL-160-ROJ', 0, 5),
    ('Rey', '#1B4FA0', 'RL-160-REY', 0, 6),
    ('Turquesa', '#2FB8B0', 'RL-160-TUR', 0, 7)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G');

-- ── 161 MARA ──────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (161, 'Mara', '161-mara',
     (select id from categorias where slug = 'pijamas-cortas'),
     'Blusa blanca de tirantes con short naranja y girasoles bordados. Short con bolsas laterales.',
     'Tirantes + short bordado',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     129, true, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Amarillo', '#F5E3A8', 'RL-161-AMA', 0, 0),
    ('Morado', '#6B3FA0', 'RL-161-MOR', 0, 1),
    ('Fucsia', '#D6007F', 'RL-161-FUC', 0, 2),
    ('Jade', '#2E9E7B', 'RL-161-JAD', 0, 3),
    ('Naranja', '#F07A21', 'RL-161-NAR', 0, 4),
    ('Rojo', '#C8352C', 'RL-161-ROJ', 0, 5),
    ('Rey', '#1B4FA0', 'RL-161-REY', 0, 6),
    ('Turquesa', '#2FB8B0', 'RL-161-TUR', 0, 7)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-161-NAR', '/productos/161-naranja.jpg', 'Mara, modelo 161, color Naranja')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G');

-- ── 162 SONIA ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (162, 'Sonia', '162-sonia',
     (select id from categorias where slug = 'pijamas-cortas'),
     'Blusa blanca de tirantes con short de color y flores bordadas. Short con bolsas.',
     'Tirantes + short bordado',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     129, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Amarillo', '#F5E3A8', 'RL-162-AMA', 0, 0),
    ('Morado', '#6B3FA0', 'RL-162-MOR', 0, 1),
    ('Fucsia', '#D6007F', 'RL-162-FUC', 0, 2),
    ('Jade', '#2E9E7B', 'RL-162-JAD', 0, 3),
    ('Naranja', '#F07A21', 'RL-162-NAR', 0, 4),
    ('Rojo', '#C8352C', 'RL-162-ROJ', 0, 5),
    ('Rey', '#1B4FA0', 'RL-162-REY', 0, 6),
    ('Turquesa', '#2FB8B0', 'RL-162-TUR', 0, 7)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-162-MOR', '/productos/162-morado.jpg', 'Sonia, modelo 162, color Morado')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G');

-- ── 163 NELLY ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (163, 'Nelly', '163-nelly',
     (select id from categorias where slug = 'pijamas-cortas'),
     'Blusa blanca de tirantes con ribete de color, short a juego y flores bordadas.',
     'Tirantes + short bordado',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     129, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Amarillo', '#F5E3A8', 'RL-163-AMA', 0, 0),
    ('Morado', '#6B3FA0', 'RL-163-MOR', 0, 1),
    ('Fucsia', '#D6007F', 'RL-163-FUC', 0, 2),
    ('Jade', '#2E9E7B', 'RL-163-JAD', 0, 3),
    ('Naranja', '#F07A21', 'RL-163-NAR', 0, 4),
    ('Rojo', '#C8352C', 'RL-163-ROJ', 0, 5),
    ('Rey', '#1B4FA0', 'RL-163-REY', 0, 6),
    ('Turquesa', '#2FB8B0', 'RL-163-TUR', 0, 7)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
), i as (
  insert into variante_imagenes (variante_id, url, alt, orden)
  select v.id, x.url, x.alt, 0 from v join (values
    ('RL-163-ROJ', '/productos/163-rojo.jpg', 'Nelly, modelo 163, color Rojo')
  ) as x(sku, url, alt) on x.sku = v.sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('CH', 'M', 'G');

-- ── 164 FARRAH ────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (164, 'Farrah', '164-farrah',
     (select id from categorias where slug = 'batas'),
     'Bata sin mangas de escote redondo, plisada en el busto, abierta con botones y con bolsas laterales. Chifón de algodón estampado.',
     'Bata sin mangas',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     169, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-164-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-164-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-164-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-164-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-164-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX', 'XXX');

-- ── 165 SOILA ─────────────────────────────
with p as (
  insert into productos
    (numero_modelo, nombre, slug, categoria_id, descripcion, tipo,
     composicion, cuidados, precio_lista, destacado, activo)
  values (165, 'Soila', '165-soila',
     (select id from categorias where slug = 'batas'),
     'Bata sin mangas de escote redondo, plisada en el busto y abierta con botones. Chifón de algodón con estampado en todo el cuerpo.',
     'Bata sin mangas',
     'Chifón 100% algodón',
     'Lavar a máquina en agua fría con colores similares. No usar cloro. Secar a la sombra. Planchar a temperatura baja del revés.',
     169, false, true)
  returning id
), v as (
  insert into variantes (producto_id, color_nombre, color_hex, sku, stock, orden)
  select p.id, x.* from p, (values
    ('Rosa', '#F3C9D4', 'RL-165-ROS', 0, 0),
    ('Coral', '#F0A088', 'RL-165-COR', 0, 1),
    ('Agua', '#BCDCD2', 'RL-165-AGU', 0, 2),
    ('Cielo', '#BFD9EF', 'RL-165-CIE', 0, 3),
    ('Amarillo', '#F5E3A8', 'RL-165-AMA', 0, 4)
  ) as x(color_nombre, color_hex, sku, stock, orden)
  returning id, sku
)
insert into variante_tallas (variante_id, talla_codigo, disponible)
select v.id, t.codigo, true from v, tallas t where t.codigo in ('M', 'G', 'XG', 'XX', 'XXX');

commit;

-- ── Resumen ─────────────────────────────────────────────────────
-- Productos:        34
-- Variantes:        184
-- Con foto:         77   (las otras 107 esperan fotos de la clienta)
-- variante_tallas:  751 filas
