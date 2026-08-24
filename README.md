# Rossy Lady · E‑commerce

Tienda en línea para **Rossy Lady**, marca mexicana de pijamas y camisones fabricada en México
desde 2019. Catálogo de 26 modelos y 85 variantes de color, para dama, caballero y camisones.

**Next.js 16 · React 19 · TypeScript · Vercel.** Funciona sin base de datos: si no hay
credenciales de Supabase, lee el catálogo de `data/catalogo.json`.

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
  [categoria]/page.tsx      dama · camisones · caballero · ofertas
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
  datos.ts                  Supabase o respaldo local, misma interfaz
  formato.ts · whatsapp.ts · tipos.ts
data/catalogo.json          respaldo: 26 productos, 85 variantes
db/                         schema.sql y seed.sql para Supabase
docs/especificacion.html    la especificación completa, 18 secciones
public/productos/           85 fotos normalizadas a 3:4
```

---

## Conectar Supabase

Mientras no existan las variables de entorno, `lib/datos.ts` usa `data/catalogo.json` y el pie
muestra un aviso de «vista de demostración». Para pasar a datos reales:

1. Crear el proyecto en Supabase.
2. Correr `db/schema.sql` y luego `db/seed.sql` en el editor SQL.
3. Definir las variables de `.env.example` en local y en Vercel.

Las mismas funciones (`getProductos`, `getProducto`, …) empiezan a consultar Postgres. No hay
que tocar ningún componente.

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

El botón flotante de WhatsApp cambia el mensaje según el contexto: en la ficha lleva modelo,
color y talla ya escritos; en el resto del sitio, un saludo general.

---

## Pendiente

- **Panel de administración** — alta y edición de productos, precios, ofertas, destacados,
  existencias y pedidos. Requiere Supabase.
- **Mercado Pago** — Checkout Pro detrás de un interruptor en `config`.
- **Reseñas** — solicitud automática a los 3 días de entregado.

### Datos que solo tiene el cliente

Existencias reales · número de WhatsApp del negocio · costos y zonas de envío ·
razón social, RFC y domicilio fiscal · política de cambios · credenciales de Mercado Pago.

> ⚠️ **La composición de fibra es obligación legal.**
> La NOM‑004‑SCFI exige que el porcentaje declarado coincida con la tela real y con la etiqueta
> cosida. Los valores actuales son marcadores de posición: reemplazarlos con la ficha técnica del
> proveedor **antes** de publicar.

Precios, tallas, nombres de color y descripciones son **propuestas** calibradas contra el mercado
mexicano (Coppel, Andrea, Suburbia). Confirmarlos antes de abrir.

---

## Sobre las imágenes

`public/productos/` contiene las 85 fotos de producto, normalizadas a 3:4 y optimizadas. Son
activos de la tienda y de todas formas serán públicos al abrir.

Las fichas PDF originales del catálogo y el archivo del logotipo **no** se versionan: son
material interno de trabajo. Están excluidos en `.gitignore`.
