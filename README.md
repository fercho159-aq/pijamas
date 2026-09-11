# Rossy Lady · E‑commerce

Tienda en línea para **Rossy Lady**, marca mexicana de pijamas y camisones fabricada en México
desde 2019. Catálogo de 34 modelos y 184 variantes de color, en 6 secciones.

Precios, colores y tallas salen de la lista de la clienta. Las fotos todavía no: hay 77 de
184 variantes fotografiadas, y las demás se muestran como muestra de color hasta que lleguen.

**Next.js 16 · React 19 · TypeScript · Vercel · Neon.** Funciona sin base de datos: si no hay
`DATABASE_URL`, la tienda lee `data/catalogo.json` y el panel no guarda.

---

## Arrancar

```bash
npm install
npm run dev
```

En http://localhost:3000. No hace falta configurar nada para verlo funcionando.

---

## Estructura

```
app/
  page.tsx                  inicio
  [categoria]/page.tsx      las 6 secciones · ofertas
  producto/[slug]/page.tsx  ficha, con datos estructurados para Google
  carrito/page.tsx
  pedido/page.tsx           datos de envío y cierre por WhatsApp
  guia-de-tallas/page.tsx   medidas en centímetros
  globals.css               sistema de diseño completo
components/
  CarritoProvider.tsx       estado del carrito, persistido en localStorage
  FichaCliente.tsx          color, talla, escasez y botón de compra
  CarritoCliente.tsx        cantidades y barra de envío gratis
  PedidoCliente.tsx         formulario, validación y mensaje de WhatsApp
  Encabezado.tsx · Pie.tsx · TarjetaProducto.tsx · BotonWhatsApp.tsx
lib/
  datos.ts                  Neon, base local o respaldo JSON, misma interfaz
  db.ts · panel.ts · fotos.ts   conexión, editor de modelos y fotos (Vercel Blob)
  formato.ts · whatsapp.ts · tipos.ts
data/catalogo.json          respaldo: 34 productos, 184 variantes, paleta de 17 colores
db/                         schema.sql e importar.mjs: la base se arma sola
docs/especificacion.html    la especificación completa, 18 secciones
public/productos/           77 fotos normalizadas a 3:4
```

---

## Base de datos y panel

Tres modos, según las variables de entorno (`lib/db.ts`):

| Modo | Cuándo | Qué pasa |
|---|---|---|
| Neon | hay `DATABASE_URL` | datos reales; el panel guarda |
| Base de pruebas | `npm run dev` sin `DATABASE_URL` | Postgres local en `.pglite/`; el panel guarda en tu computadora |
| Demostración | producción sin `DATABASE_URL` | lee `data/catalogo.json`; el panel no guarda |

Para producción, en Vercel:

1. **Storage → Neon** (crear base). Agrega `DATABASE_URL`.
2. **Storage → Blob** (crear store). Agrega `BLOB_READ_WRITE_TOKEN`, para las fotos.
3. **Settings → Environment Variables:** `ADMIN_CLAVE`, la contraseña del panel.
4. Redeploy.

La primera conexión crea las tablas e importa el catálogo, una sola vez: no hay que correr SQL.
Después manda el panel (`/admin`): crear, duplicar, editar y borrar modelos; precio y oferta con
fecha de fin; tallas; colores con una foto cada uno; piezas; portada; publicado y destacado.
Las fotos se reducen en el navegador y el servidor las recorta a 3:4 antes de guardarlas.

### Dos piezas que vale la pena conocer

**`precio_vigente(productos)`** — el precio que se muestra y el que se cobra salen de la misma
función. Por eso la cuenta regresiva de una oferta no puede desincronizarse del cobro.

**`resenas.pedido_id` es `NOT NULL`** — hace imposible insertar una reseña sin una compra real,
incluso desde el panel. La honestidad de la prueba social es una restricción de base de datos,
no una política.

---

## Cómo funciona la conversión

Todo lo que empuja la venta está amarrado a un dato real, nunca inventado:

| Mecanismo | De dónde sale |
|---|---|
| «Últimas N piezas» | `stock` de la variante, solo si es ≤ 5 |
| «Agotado» | `stock = 0`; apaga el botón y ofrece avisar |
| «Te faltan $X para envío gratis» | carrito contra `envioGratisDesde` |
| Precio de oferta y ahorro | `precioOferta` con su fecha de fin |

Hoy no hay ninguna oferta activa: las que había eran propuestas mías y se retiraron al cargar
los precios reales.

El botón flotante de WhatsApp cambia el mensaje según el contexto: en la ficha lleva modelo,
color y talla ya escritos; en el resto del sitio, un saludo general.

---

## Pendiente

- **Pedidos en el panel** — hoy se cierran por WhatsApp; falta guardarlos y darles seguimiento.
- **Mercado Pago** — Checkout Pro detrás de un interruptor en `config`.
- **Reseñas** — solicitud automática a los 3 días de entregado.

### Datos que solo tiene el cliente

Existencias reales · número de WhatsApp del negocio · costos y zonas de envío ·
razón social, RFC y domicilio fiscal · política de cambios · credenciales de Mercado Pago.

> ⚠️ **La composición de fibra es obligación legal.**
> La NOM‑004‑SCFI exige que el porcentaje declarado coincida con la tela real y con la etiqueta
> cosida. Los valores actuales son marcadores de posición: reemplazarlos con la ficha técnica del
> proveedor **antes** de publicar.

Precios, tallas y nombres de color ya son los de la clienta, tomados de su lista. Falta que
confirme **si los precios son de mayoreo o de venta al público**: $129 por un camisón de algodón
queda muy abajo del mercado mexicano al menudeo.

El umbral de envío gratis ($699) y el costo de envío ($99) siguen siendo marcadores míos:
se calibraron contra precios que ya no son los vigentes.

---

## Sobre las imágenes

`public/productos/` contiene las 85 fotos de producto, normalizadas a 3:4 y optimizadas. Son
activos de la tienda y de todas formas serán públicos al abrir.

Las fichas PDF originales del catálogo y el archivo del logotipo **no** se versionan: son
material interno de trabajo. Están excluidos en `.gitignore`.
