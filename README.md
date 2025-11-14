# 🏷️ Sistema de Seguimiento de Precios (Price Tracking System)

Sistema completo de seguimiento de precios para tiendas mexicanas con modelo de suscripción freemium, scraping automatizado y notificaciones inteligentes.

## 📋 Características Principales

### ✨ Para Usuarios
- 🔍 **Búsqueda inteligente** de productos en múltiples tiendas
- 📊 **Comparación de precios** en tiempo real
- 🔔 **Alertas personalizadas** cuando el precio baja
- 📈 **Historial de precios** con gráficas visuales
- 💳 **Modelo Freemium**: Plan gratuito + Plan Premium

### 🛠️ Tecnologías

#### Backend
- **NestJS** con TypeScript
- **Prisma ORM** con PostgreSQL
- **JWT + bcrypt** para autenticación
- **Bull/BullMQ** con Redis para jobs
- **Puppeteer/Playwright** para web scraping
- **NodeMailer** para notificaciones por email
- **Swagger/OpenAPI** para documentación de API

#### Frontend
- **React** con TypeScript
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Axios** para llamadas HTTP
- **Recharts** para gráficas de precios

#### Infraestructura
- **PostgreSQL** para base de datos
- **Redis** para colas y caché
- **Docker & Docker Compose** para desarrollo
- Arquitectura **API-First** preparada para app móvil

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.x
- Docker y Docker Compose
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd Kanan-
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Levantar servicios con Docker

```bash
npm run docker:up
```

Esto iniciará:
- PostgreSQL en puerto 5432
- Redis en puerto 6379
- PgAdmin en puerto 5050 (opcional)
- Redis Commander en puerto 8081 (opcional)

### 4. Instalar dependencias

```bash
npm run install:all
```

### 5. Ejecutar migraciones de base de datos

```bash
npm run db:migrate
```

### 6. (Opcional) Cargar datos de ejemplo

```bash
npm run db:seed
```

### 7. Iniciar el sistema en modo desarrollo

```bash
npm run dev
```

Esto iniciará:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3001/api/docs

## 📁 Estructura del Proyecto

```
Kanan-/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Módulo de autenticación
│   │   ├── users/          # Gestión de usuarios
│   │   ├── products/       # CRUD de productos
│   │   ├── prices/         # Historial de precios
│   │   ├── subscriptions/  # Sistema de suscripciones
│   │   ├── scraping/       # Web scraping
│   │   ├── notifications/  # Sistema de notificaciones
│   │   ├── jobs/           # Jobs y tareas programadas
│   │   └── common/         # Utilidades compartidas
│   ├── prisma/
│   │   └── schema.prisma   # Esquema de base de datos
│   └── test/               # Tests del backend
│
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── services/      # Servicios API
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilidades
│   └── public/            # Archivos estáticos
│
├── shared/                # Tipos compartidos TypeScript
│   └── types/
│
├── docs/                  # Documentación adicional
│
├── docker-compose.yml     # Servicios Docker
├── .env.example          # Variables de entorno ejemplo
└── README.md             # Este archivo
```

## 🔐 Planes de Suscripción

### 🆓 Plan Gratuito
- ✅ Trackear 1 producto
- ✅ Notificaciones por email
- ✅ Historial de 30 días
- ✅ Comparación básica de precios

### 💎 Plan Premium ($99 MXN/mes)
- ✅ Productos ilimitados
- ✅ Notificaciones instantáneas (email + push)
- ✅ Historial completo sin límites
- ✅ Alertas personalizadas de precio objetivo
- ✅ Estadísticas avanzadas
- ✅ Acceso prioritario a nuevas funcionalidades

## 🏪 Tiendas Soportadas (Inicial)

- Amazon México
- Mercado Libre
- Liverpool
- Walmart
- Coppel
- Elektra

*Más tiendas se agregan continuamente*

## 📚 API Documentation

Una vez iniciado el backend, la documentación completa de la API está disponible en:

**Swagger UI**: http://localhost:3001/api/docs

### Endpoints Principales

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/forgot-password` - Recuperar contraseña

#### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Detalle de producto
- `POST /api/products/search` - Búsqueda inteligente
- `GET /api/products/:id/prices` - Historial de precios

#### Tracking
- `POST /api/tracking` - Trackear producto
- `GET /api/tracking` - Mis productos trackeados
- `DELETE /api/tracking/:id` - Dejar de trackear
- `PUT /api/tracking/:id/alert` - Configurar alerta de precio

#### Suscripciones
- `GET /api/subscriptions/plans` - Planes disponibles
- `POST /api/subscriptions/subscribe` - Suscribirse a premium
- `DELETE /api/subscriptions/cancel` - Cancelar suscripción
- `GET /api/subscriptions/current` - Suscripción actual

## 🛠️ Scripts Disponibles

### Desarrollo
```bash
npm run dev              # Inicia backend + frontend
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend
```

### Producción
```bash
npm run build            # Build completo
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend
```

### Base de Datos
```bash
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Cargar datos de ejemplo
```

### Docker
```bash
npm run docker:up        # Levantar servicios
npm run docker:down      # Detener servicios
```

### Testing
```bash
npm run test             # Tests completos
npm run test:backend     # Tests backend
npm run test:frontend    # Tests frontend
```

### Linting
```bash
npm run lint             # Lint completo
npm run lint:backend     # Lint backend
npm run lint:frontend    # Lint frontend
```

## 🔧 Configuración de Scraping

El sistema utiliza Playwright para hacer scraping responsable:
- Delays entre requests para no sobrecargar servidores
- User-Agent realista
- Rotación de IPs (opcional con proxies)
- Respeto de robots.txt
- Caché de resultados

## 📧 Configuración de Email

### Gmail
1. Habilitar "Verificación en 2 pasos" en tu cuenta de Google
2. Generar "Contraseña de aplicación"
3. Configurar en `.env`:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-password-de-aplicacion
```

## 🚀 Despliegue

### Backend (Railway, Render, DigitalOcean)
1. Configurar variables de entorno
2. Conectar PostgreSQL y Redis
3. Ejecutar migraciones
4. Deploy

### Frontend (Vercel, Netlify)
1. Configurar `VITE_API_URL`
2. Build y deploy automático desde Git

Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para guías detalladas.

## 🧪 Testing

El proyecto incluye:
- **Unit tests** con Jest
- **Integration tests** para API
- **E2E tests** con Playwright (frontend)

```bash
npm run test
```

## 📊 Monitoreo y Logs

- Logs estructurados con Winston
- Métricas de performance
- Alertas de errores
- Dashboard de scraping jobs

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Sistema básico de tracking (v1.0)
- [ ] Integración de pagos con Stripe/MercadoPago
- [ ] Notificaciones push
- [ ] App móvil (React Native)
- [ ] Comparación de características de productos
- [ ] Sistema de recomendaciones con ML
- [ ] Extensión de navegador
- [ ] API pública para developers

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🐛 Reportar Bugs

Reporta bugs en [GitHub Issues](https://github.com/robertomx80/Kanan-/issues)

## 💬 Soporte

- 📧 Email: support@pricetracking.com
- 💬 Discord: [Unirse al servidor](https://discord.gg/pricetracking)
- 📖 Docs: [docs.pricetracking.com](https://docs.pricetracking.com)

---

**Hecho con ❤️ para la comunidad de compradores inteligentes en México** 🇲🇽
