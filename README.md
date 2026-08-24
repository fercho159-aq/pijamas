# Rossy Lady · E‑commerce

Tienda en línea para **Rossy Lady**, marca mexicana de pijamas y camisones fabricada en México
desde 2019. Catálogo de 26 modelos y 85 variantes de color, para dama, caballero y camisones.

> **Estado:** fase de definición terminada. Modelo de datos cerrado y sembrado.
> Falta levantar la aplicación (F1).

---

## Decisiones de arquitectura

| Área | Decisión |
|---|---|
| Framework | Next.js 15 · App Router |
| Base de datos | Supabase (Postgres + Auth + Storage) |
| Hosting | Vercel |
| Checkout | WhatsApp al lanzar · Mercado Pago detrás de un interruptor |
| Inventario | Color como variante con stock · talla como disponibilidad |
| Enfoque | Mobile‑first |

---

## Estructura

```
rossy-lady/
├── db/
│   ├── schema.sql    10 tablas, RLS, índices, folio automático, precio_vigente()
│   └── seed.sql      26 productos · 85 variantes · 425 filas de talla
└── docs/
    └── especificacion.html    Especificación completa (18 secciones)
```

Abre `rossy-lady/docs/especificacion.html` en el navegador para la especificación completa:
sistema de diseño, modelo de datos, catálogo con precios, tallas, motor de copy, mecanismos de
urgencia, prueba social, flujo de WhatsApp y fases de entrega.

---

## Levantar la base de datos

En el editor SQL de Supabase, **en este orden**:

```sql
-- 1
\i rossy-lady/db/schema.sql
-- 2
\i rossy-lady/db/seed.sql
```

O pegando el contenido de cada archivo directamente en el editor.

`seed.sql` es idempotente en tallas, categorías y configuración, pero **no** en productos:
volver a correrlo con la base ya sembrada falla por `numero_modelo` duplicado. Es intencional,
para no duplicar catálogo por accidente.

### Dos piezas que vale la pena conocer

**`precio_vigente(productos)`** — el precio que se muestra y el que se cobra salen de la misma
función. Por eso la cuenta regresiva de una oferta no puede desincronizarse del cobro.

**`resenas.pedido_id` es `NOT NULL`** — hace imposible insertar una reseña sin una compra real,
incluso desde el panel de administración. La honestidad de la prueba social es una restricción de
base de datos, no una política.

---

## Antes de publicar

Los siguientes valores están **sembrados como propuesta** y deben confirmarse con el cliente:

- **Precios** — calibrados contra Coppel, Andrea y Suburbia. Rango $259 – $499 MXN.
- **Tallas** — CH a 2XG con medidas en centímetros.
- **Nombres de color** — derivados de las fotos reales del catálogo.
- **Descripciones** — borradores escritos por modelo.

> ⚠️ **La composición de fibra es obligación legal.**
> La NOM‑004‑SCFI exige que el porcentaje declarado coincida con la tela real y con la etiqueta
> cosida en la prenda. Los valores actuales son marcadores de posición para poder programar.
> Reemplazarlos con la ficha técnica del proveedor **antes** de publicar.

### Datos que aún no existen

Stock por variante · número de WhatsApp del negocio · costos y zonas de envío ·
razón social, RFC y domicilio fiscal · política de cambios y devoluciones ·
credenciales de Mercado Pago.

---

## Nota sobre el material de origen

Las fichas PDF del catálogo, las fotografías de producto y el logo vectorial **no se versionan**:
este repositorio es público y ese material es comercial del cliente. Están excluidos en
`.gitignore` y viven solo en la máquina local.
