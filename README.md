# Sistema de Inteligencia de Campañas de Marketing en Redes Sociales
### Grupo 12 — Trabajo Práctico Integrador

---

## Descripción

**Campaign IQ** es una plataforma web que centraliza el análisis de campañas de marketing en redes sociales. Permite a los usuarios conectar sus cuentas de Instagram y YouTube para obtener métricas de rendimiento, analizar el sentimiento de comentarios, detectar palabras clave relevantes y recibir recomendaciones automáticas generadas por inteligencia artificial para optimizar sus estrategias de contenido.

El sistema diferencia entre contenido orgánico y campañas pagas, permitiendo comparar el rendimiento de ambas estrategias dentro de un mismo panel. Los datos procesados se exportan a Power BI para la generación de reportes ejecutivos con evolución temporal y comparativas entre plataformas.

---

## Modelo de Dominio

<!-- Insertar imagen del diagrama aquí -->
> 📌 *Imagen del modelo de dominio — subir diagrama*

### Entidades principales

| Entidad | Descripción |
|---|---|
| Usuario | Persona registrada en el sistema que gestiona sus campañas |
| Plataforma | Red social integrada (Instagram, TikTok) |
| Cuenta Social | Cuenta de red social conectada por un usuario vía OAuth |
| Campaña | Agrupación de publicaciones con un objetivo y período definido |
| Publicación | Post individual traído desde la API de la red social |
| Métrica | Indicadores de rendimiento de una publicación (likes, vistas, engagement) |
| Comentario | Texto individual de un comentario con su análisis de sentimiento |
| Keyword | Palabra clave extraída de comentarios con su frecuencia y engagement |
| Recomendación | Sugerencia generada automáticamente por el sistema para una campaña |
| Historial de Métricas | Snapshot diario del estado general de una cuenta social |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Backend | FastAPI (Python) | Framework moderno, asíncrono, con documentación automática via Swagger |
| Base de datos | PostgreSQL + SQLAlchemy | Motor relacional robusto con ORM para gestión eficiente de datos |
| Frontend | React + Recharts | Librería estándar para dashboards interactivos con gráficos en tiempo real |
| Reportes | Power BI Desktop | Generación de reportes ejecutivos conectado al endpoint de exportación |
| Análisis de sentimiento | VADER (vaderSentiment) | Modelo pre-entrenado optimizado para textos cortos de redes sociales |
| Procesamiento de texto | NLTK | Extracción de keywords y eliminación de stopwords en español e inglés |
| Análisis estadístico | Pandas | Cálculo de métricas agregadas, horarios óptimos y clasificación de posts |
| IA generativa | Gemini API (Google) | Redacción de recomendaciones en lenguaje natural (tier gratuito) |
| Autenticación social | OAuth 2.0 | Estándar de la industria para conexión segura de cuentas de terceros |

---

## Narrativa

Una agencia de marketing digital o un creador de contenido independiente necesita evaluar el rendimiento de sus campañas en distintas redes sociales sin tener que revisar manualmente cada plataforma por separado. El proceso manual es lento, propenso a errores y no permite detectar patrones a lo largo del tiempo.

**Campaign Performance Intelligence System** resuelve este problema centralizando toda la información en un único panel. El usuario crea una campaña, define su período y asocia sus cuentas de Instagram y YouTube. El sistema trae automáticamente todas las publicaciones del período, calcula métricas de engagement, analiza cada comentario para determinar si el sentimiento de la audiencia es positivo, neutro o negativo, y detecta qué palabras aparecen con más frecuencia en las interacciones.

Con esos datos, el sistema genera recomendaciones concretas y accionables: en qué horarios publicar, qué tipo de contenido genera más interacción, qué días de la semana tienen mejor rendimiento. Estas recomendaciones se presentan en lenguaje natural para que cualquier usuario pueda interpretarlas sin conocimientos técnicos.

Finalmente, toda la información procesada se exporta a Power BI donde el usuario puede explorar dashboards con evolución temporal, comparativas entre plataformas y análisis de sentimiento visual para presentar resultados a clientes o superiores.

---

## Reglas de Cálculo

### Engagement Rate por publicación
Mide el nivel de interacción relativo al alcance de cada publicación.

```
engagement_rate = (likes + comentarios + compartidos) / alcance * 100
```

### Score de publicación
Clasifica cada publicación en función de su engagement rate relativo al resto de la campaña.

```
si engagement_rate >= percentil_66 → "buena"
si engagement_rate >= percentil_33 → "normal"
si engagement_rate <  percentil_33 → "mala"
```

### Score de sentimiento
Basado en el compound score de VADER, que varía entre -1 y 1.

```
si compound >= 0.05  → "positivo"
si compound <= -0.05 → "negativo"
si entre -0.05 y 0.05 → "neutro"
```

### Score de salud de campaña
Indicador global que combina engagement y sentimiento para evaluar el estado general de una campaña.

```
score_salud = (engagement_rate_promedio * 0.6) + (porcentaje_positivos * 0.4)
```
El resultado se normaliza en una escala de 0 a 100.

### Horario óptimo de publicación
Determina la franja horaria con mayor engagement histórico.

```
engagement_por_hora = promedio(engagement_rate) agrupado por hora_del_dia
horario_optimo = hora con mayor engagement_por_hora
```

### Crecimiento de seguidores
Mide la variación de seguidores durante el período de la campaña.

```
crecimiento = ((seguidores_fin - seguidores_inicio) / seguidores_inicio) * 100
```

---

## 🔌 APIs Utilizadas

### Meta Graph API — Instagram
- **Endpoint base:** `https://graph.facebook.com/v19.0`
- **Autenticación:** OAuth 2.0 con tokens de larga duración (60 días)
- **Permisos requeridos:**
  - `instagram_business_basic` — información básica de la cuenta y seguidores
  - `instagram_manage_insights` — métricas de alcance, impresiones y engagement por publicación
  - `instagram_manage_comments` — lectura de comentarios para análisis de sentimiento
  - `ads_read` — métricas de campañas publicitarias pagas
- **Datos obtenidos:** publicaciones, likes, comentarios, alcance, impresiones, seguidores, métricas de anuncios

### YouTube Data API v3 — Google
- **Endpoint base:** `https://www.googleapis.com/youtube/v3`
- **Autenticación:** API Key para datos públicos / OAuth 2.0 para datos de canal propio
- **Permisos requeridos:**
  - `youtube.readonly` — acceso de solo lectura a datos del canal
- **Quota gratuita:** 10.000 unidades diarias (suficiente para uso académico)
- **Datos obtenidos:** videos, vistas, likes, comentarios (texto y autor), suscriptores, duración, impresiones, métricas de canal

### Gemini API — Google AI Studio
- **Uso:** generación de recomendaciones en lenguaje natural a partir de métricas calculadas
- **Modelo:** gemini-1.5-flash (tier gratuito)
- **Tier gratuito:** 1500 requests/día — suficiente para uso académico

---

## 👥 Integrantes

| Nombre | Legajo |
|---|---|
| Luhmann Emiliano | 53224 |
| Lezcano Diego | 53215 |
| | |

---

*Trabajo Práctico Integrador — Soporte — 2026*
