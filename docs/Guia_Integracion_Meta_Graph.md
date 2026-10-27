# Guía Oficial: Extracción Profunda (RapidAPI + Deep Scraper) y Meta Graph API

En **CampaignIQ**, el sistema **jamás mezcla ni genera datos simulados**. Todas las extracciones se realizan 100% en vivo y las credenciales se almacenan cifradas con `HMAC-SHA256` + cipher de flujo e indexadas mediante un **Blind Index** (`client_id_hash`) en PostgreSQL desde la interfaz web (`/settings`), sin necesidad de tocar archivos `.env`.

---

## Opción 1 (Más Rápida — 30 segundos sin crear Apps de Meta): RapidAPI + Deep Scraper (Instagram, TikTok y Twitter / X)

Con este modo podés extraer publicaciones y métricas con máxima profundidad de **cualquier perfil público de Instagram, TikTok o Twitter / X** solo ingresando el `@usuario`:

### A. Extracción Directa sin API Key (TikTok y Twitter / X)
1. Ingresá a `http://localhost:3000/settings`.
2. Seleccioná la pestaña **TikTok (Deep Scraper)** o **Twitter / X (Scraper)**.
3. Escribí el `@usuario` (ej. `tiktok` o `nasa`) en **"Usuario / Handle a Scrapear (@username)"**.
4. Hacé clic en **"Guardar en Bóveda PostgreSQL"** y luego en **"Extraer Publicaciones y Métricas Ahora"**.
5. El motor usa conectores públicos profundos (*TikWM Engine / Universal Rehydration* para TikTok y *Twitter Syndication Timeline* para X) para traer vistas, likes, comentarios, compartidos, guardados/favoritos y seguidores sin pedirte API Key.

### B. Extracción Profunda con `X-RapidAPI-Key` (Instagram, TikTok y Twitter / X)
Instagram bloquea agresivamente las IPs sin sesión después de unas pocas consultas. Con una **`X-RapidAPI-Key`** gratuita (que una vez guardada en la bóveda se comparte automáticamente entre **Instagram, TikTok y Twitter/X**), el scraper extrae toda la profundidad disponible:
* **Instagram**: Likes (`like_count`), comentarios (`comment_count`), compartidos (`reshare_count` / `share_count`), reproducciones reales de Reels y videos (`play_count` / `video_view_count`), alcance (`reach`), impresiones, seguidores del perfil (`follower_count`), tipo de media (`reel`, `carousel`, `image`, `video`) y enlace original (`permalink`).
* **TikTok**: Reproducciones (`play_count`), likes (`digg_count`), comentarios (`comment_count`), compartidos (`share_count`), guardados en favoritos (`collect_count`) y seguidores (`follower_count`).
* **Twitter / X**: Likes (`favorite_count`), respuestas (`reply_count`), retweets + citas (`retweet_count` + `quote_count`), guardados (`bookmark_count`), vistas (`views`) y seguidores (`followers_count`).

#### ¿Cómo sacar tu `X-RapidAPI-Key` gratis en 30 segundos?
1. Entrá a [https://rapidapi.com/hub](https://rapidapi.com/hub) e iniciá sesión con tu cuenta de Google o GitHub.
2. Buscá y suscribite al plan **Basic ($0.00 / mes)** de cualquiera de estos scrapers:
   - **Instagram**: `Instagram Scraper API2` (`instagram-scraper-api2.p.rapidapi.com`) o `Instagram Scraper 2025` (`instagram-scraper-20251.p.rapidapi.com`).
   - **TikTok**: `TikTok Scraper7` (`tiktok-scraper7.p.rapidapi.com`).
   - **Twitter / X**: `Twitter API45` (`twitter-api45.p.rapidapi.com`).
3. Copiá el código **`X-RapidAPI-Key`** que te muestra RapidAPI en los headers de ejemplo.
4. En `http://localhost:3000/settings`, seleccioná **Instagram (RapidAPI + Scraper)**, poné el `@usuario` a analizar, pegá tu **`X-RapidAPI-Key`** y hacé clic en **"Guardar en Bóveda PostgreSQL"**.
5. Hacé clic en **"Extraer Publicaciones y Métricas Ahora"** (o usá el botón **"Deep Sync API"** dentro del detalle de cualquier campaña).

---

## Opción 2: Conexión Oficial a Meta Graph API v21.0 (Instagram Business & Facebook)

Si preferís conectar una cuenta propia de Instagram Business / Creator mediante el token oficial de Meta:

### Método A (En 1 minuto usando Meta Graph API Explorer)

Este es el método que utilizarán la mayoría de los usuarios y evaluadores porque **no requiere configurar redirecciones OAuth ni esperar revisión de Meta**:

1. **Requisito de cuenta en Meta**:
   - Tu cuenta de Instagram debe ser de tipo **Profesional (Business o Creator)** y estar vinculada a una **Página de Facebook** (requisito obligatorio de Meta para habilitar la Graph API).
2. **Abrir el Graph API Explorer**:
   - Ingresa a [https://developers.facebook.com/tools/explorer/](https://developers.facebook.com/tools/explorer/).
3. **Seleccionar App y Permisos**:
   - En el panel derecho, bajo **Meta App**, selecciona tu aplicación (si no tienes una, haz clic en *My Apps* &rarr; *Create App* &rarr; *Business*).
   - En **User or Page**, deja seleccionado **User Token**.
   - En **Permissions (Permisos)**, agrega los siguientes 4 permisos:
     - `instagram_basic`
     - `instagram_manage_insights`
     - `pages_show_list`
     - `pages_read_engagement`
4. **Generar el Access Token**:
   - Haz clic en el botón azul **Generate Access Token**.
   - Se abrirá la ventana de Facebook preguntando qué Página de Facebook y qué cuenta de Instagram deseas autorizar. Selecciónalas y acepta.
5. **Guardar en la Bóveda de CampaignIQ y Sincronizar en Vivo**:
   - Copia el código generado (`EAA...`).
   - Abre CampaignIQ en `http://localhost:3000/settings`.
   - Pégalo en el primer campo **"Access Token Directo (Método A - Graph API Explorer)"** y haz clic en **"Guardar en Bóveda Segura"**.
   - El backend consultará `graph.facebook.com/v21.0/me/accounts` en tiempo real y completará automáticamente tu `@usuario` y tu `Instagram Business ID`.
   - Finalmente, haz clic en **"Sincronizar Publicaciones en Vivo Ahora"**.

---

## Método B (Flujo OAuth 2.0 Completo con `Client ID` y `Client Secret`)

Si prefieres que el usuario inicie sesión directamente desde el botón **"Iniciar Sesión con Meta (OAuth 2.0)"**:

1. En [https://developers.facebook.com/apps](https://developers.facebook.com/apps), entra a tu App &rarr; **Configuración de la app &gt; Básica**.
2. Copia el **Identificador de la app (`Client ID`)** y la **Clave secreta de la app (`Client Secret`)**.
3. En el menú lateral de Meta, agrega el producto **Inicio de sesión con Facebook para empresas** y en **Configuración &gt; URI de redireccionamiento de OAuth válidos** pega:
   ```text
   http://localhost:8000/integrations/meta_graph/oauth/callback
   ```
4. En `http://localhost:3000/settings`, pega tu `Client ID` y `Client Secret` y toca **Guardar en Bóveda Segura**.
5. Haz clic en **Iniciar Sesión con Meta (OAuth 2.0)**. Al autorizar en Facebook, el backend canjeará el código por un **Token de Larga Duración (60 días)**, lo guardará cifrado en PostgreSQL y descubrirá tu cuenta automáticamente.

---

## ¿Qué datos reales extrae el sincronizador en vivo?

Al ejecutar **Sincronizar Publicaciones en Vivo Ahora** (`POST /integrations/meta_graph/sync`):
1. Consulta `GET https://graph.facebook.com/v21.0/{ig_user_id}/media?fields=id,caption,media_type,permalink,timestamp,like_count,comments_count` (o `/{page_id}/posts` si es una Página de Facebook).
2. Por cada publicación consulta `GET https://graph.facebook.com/v21.0/{media_id}/insights?metric=reach,impressions,shares`.
3. Ejecuta el motor **VADER NLP** sobre el texto real de cada post y calcula `engagement_rate` y `engagement_score`.
4. Realiza **Upsert por `external_id`** (`meta_ig_{id}`): si vuelves a sincronizar más tarde, actualiza los likes, comentarios, compartidos, alcance e impresiones reales sin duplicar ninguna publicación.
