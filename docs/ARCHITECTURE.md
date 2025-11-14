# 🏗️ Arquitectura del Sistema - Price Tracking

Este documento describe la arquitectura técnica del sistema de seguimiento de precios.

## 📊 Visión General

El sistema sigue una arquitectura **API-First** con separación clara entre backend y frontend, preparada para escalabilidad y futuras integraciones móviles.

```
┌─────────────────┐
│   Usuarios      │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Frontend│ (React + TypeScript + Tailwind)
    │ (Vite)  │
    └────┬────┘
         │ HTTP/REST
    ┌────▼────┐
    │ Backend │ (NestJS + TypeScript)
    │   API   │
    └────┬────┘
         │
    ┌────▼────┬─────────┬──────────┐
    │         │         │          │
┌───▼───┐ ┌──▼──┐  ┌──▼───┐  ┌───▼────┐
│Postgres│ │Redis│  │Scraper│  │NodeMailer│
└────────┘ └─────┘  └──────┘  └────────┘
```

## 🎯 Capas de la Arquitectura

### 1. Capa de Presentación (Frontend)

**Tecnologías:**
- React 18
- TypeScript
- Tailwind CSS
- Vite (build tool)
- Zustand (state management)
- React Router (routing)
- Axios (HTTP client)
- Recharts (visualización de datos)

**Estructura:**
```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── auth/        # Componentes de autenticación
│   │   ├── common/      # Componentes comunes (Layout, Navbar)
│   │   ├── dashboard/   # Componentes del dashboard
│   │   └── products/    # Componentes de productos
│   ├── pages/           # Páginas de la aplicación
│   ├── services/        # Servicios de API
│   ├── store/           # Estado global (Zustand)
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilidades
│   └── hooks/           # Custom React hooks
```

**Responsabilidades:**
- Interfaz de usuario responsiva
- Gestión de estado de la aplicación
- Comunicación con la API REST
- Validación de formularios client-side
- Visualización de datos (gráficas, tablas)

### 2. Capa de Aplicación (Backend API)

**Tecnologías:**
- NestJS (framework)
- TypeScript
- JWT (autenticación)
- bcrypt (hashing de passwords)
- Passport (estrategias de auth)
- Swagger/OpenAPI (documentación)

**Estructura de Módulos:**

```
backend/src/
├── auth/                # Autenticación y autorización
│   ├── dto/             # Data Transfer Objects
│   ├── strategies/      # JWT, Local strategies
│   └── guards/          # Auth guards
├── users/               # Gestión de usuarios
├── products/            # CRUD de productos
├── prices/              # Historial de precios y tracking
├── subscriptions/       # Sistema de suscripciones
├── scraping/            # Web scraping
├── notifications/       # Sistema de notificaciones
├── jobs/                # Jobs y tareas programadas
└── common/              # Módulos compartidos
    ├── guards/          # Guards comunes
    ├── decorators/      # Decorators personalizados
    ├── filters/         # Exception filters
    ├── interceptors/    # HTTP interceptors
    └── prisma/          # Cliente Prisma
```

**Principios:**
- **Modularidad**: Cada módulo es independiente
- **Dependency Injection**: NestJS IoC container
- **Separation of Concerns**: Controller → Service → Repository
- **DTO Pattern**: Validación y transformación de datos

### 3. Capa de Datos

**Base de Datos Principal: PostgreSQL**

```
Modelo de Datos Relacional:

┌─────────┐       ┌──────────────┐
│  User   │──────<│Subscription  │
└────┬────┘       └──────────────┘
     │
     │1:N
     │
┌────▼────────┐   ┌──────────┐
│  Tracking   │──>│ Product  │
└─────────────┘   └────┬─────┘
                       │
     ┌─────────────────┤
     │                 │
┌────▼────┐      ┌────▼────┐
│  Price  │      │ Category│
└─────────┘      └─────────┘
```

**Entidades Principales:**

1. **User** (Usuarios)
   - Información personal
   - Credenciales
   - Relación 1:1 con Subscription

2. **Subscription** (Suscripciones)
   - Plan (FREE/PREMIUM)
   - Estado
   - Límites de uso

3. **Product** (Productos)
   - Información del producto
   - Categoría
   - Imágenes y especificaciones

4. **Price** (Precios)
   - Precio histórico
   - Tienda
   - Timestamp del scraping

5. **ProductTracking** (Seguimiento)
   - Relación User-Product
   - Estadísticas de precio

6. **PriceAlert** (Alertas)
   - Condiciones de alerta
   - Estado de activación

**Caché: Redis**

Usos de Redis:
- Bull/BullMQ queues para jobs
- Caché de sesiones (futuro)
- Rate limiting
- Caché de precios recientes

### 4. Capa de Jobs y Background Tasks

**Tecnologías:**
- Bull/BullMQ
- @nestjs/schedule (Cron jobs)
- Redis (queue backend)

**Jobs Programados:**

| Job | Frecuencia | Descripción |
|-----|-----------|-------------|
| `price-updates` | Cada 6 horas | Actualiza precios de todos los productos |
| `check-alerts` | Cada 30 min | Verifica alertas de precio |
| `cleanup-old-prices` | Diario (2 AM) | Limpia precios antiguos (solo FREE users) |
| `send-notifications` | On-demand | Envía notificaciones por email |

**Arquitectura de Jobs:**

```
┌───────────────┐
│   Scheduler   │ (NestJS @Cron)
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Bull Queue   │ (Redis)
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Processor    │ (Worker)
└───────────────┘
```

### 5. Capa de Scraping

**Tecnología:**
- Playwright (browser automation)
- Chromium headless

**Arquitectura:**

```
┌──────────────┐
│ ScrapingJob  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Playwright  │
│   Browser    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Store Website│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Extract Price │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Save to DB   │
└──────────────┘
```

**Características:**
- User-Agent realista
- Delays entre requests
- Retry logic con backoff exponencial
- Manejo de errores y logging
- Selectores configurables por tienda

### 6. Sistema de Notificaciones

**Canales:**
1. **Email** (NodeMailer)
   - Alertas de precio
   - Verificación de cuenta
   - Recuperación de contraseña

2. **Push Notifications** (Futuro)
   - Webhooks preparados
   - FCM integration (pendiente)

**Flow de Notificaciones:**

```
┌─────────────┐
│ Price Change│
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Check Alerts │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Create Notif  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Queue Email  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Send Email  │
└──────────────┘
```

## 🔐 Seguridad

### Autenticación y Autorización

**JWT Strategy:**
```
User Login
    ↓
Validate Credentials
    ↓
Generate JWT Token (7 days)
Generate Refresh Token (30 days)
    ↓
Return Tokens
    ↓
Client stores in localStorage
    ↓
Every API call includes token
    ↓
JwtStrategy validates
    ↓
Load user from DB
    ↓
Attach user to request
```

**Niveles de Protección:**

1. **Public Routes** (@Public decorator)
   - No requieren autenticación
   - Ejemplos: Login, Register, Product listing

2. **Authenticated Routes** (default)
   - Requieren JWT válido
   - Ejemplos: Dashboard, Tracking

3. **Admin Routes** (@Roles('ADMIN'))
   - Requieren rol de administrador
   - Ejemplos: Create product, Manage users

### Validación de Datos

- **DTOs** con class-validator
- **Pipes** de transformación
- **Exception Filters** para errores

### Rate Limiting

```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,  // 1 minuto
  limit: 100,  // 100 requests
}])
```

## 📡 API Design

### RESTful Endpoints

**Convenciones:**
- Recursos en plural: `/api/products`
- IDs en path params: `/api/products/:id`
- Filtros en query params: `/api/products?brand=Apple`
- Acciones en verbos HTTP: GET, POST, PUT, DELETE

**Respuestas Estándar:**

```typescript
// Success
{
  "data": {...},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}

// Error
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Documentación API

- **Swagger UI**: `/api/docs`
- Decoradores @ApiOperation, @ApiResponse
- Ejemplos de request/response
- Autenticación JWT documentada

## 🚀 Escalabilidad

### Horizontal Scaling

**Backend:**
- Stateless design
- JWT para auth (no sesiones)
- Redis para shared state
- Load balancer compatible

**Jobs:**
- Múltiples workers de Bull
- Distribución automática de carga

**Database:**
- Connection pooling
- Read replicas (futuro)
- Índices optimizados

### Vertical Scaling

**Optimizaciones:**
- Lazy loading de relaciones
- Paginación en todas las listas
- Caché de queries frecuentes
- CDN para assets estáticos

## 📊 Monitoreo y Logging

### Logging

**Niveles:**
- `debug`: Desarrollo
- `info`: Operaciones normales
- `warn`: Situaciones no críticas
- `error`: Errores que requieren atención

**Logger:**
```typescript
@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  someMethod() {
    this.logger.log('Processing...');
    this.logger.error('Error occurred');
  }
}
```

### Métricas

**Actuales:**
- Health check endpoint
- Logs estructurados
- Error tracking

**Futuro:**
- Prometheus metrics
- Grafana dashboards
- Sentry error tracking
- APM (Application Performance Monitoring)

## 🔄 CI/CD Pipeline

### Development Workflow

```
Developer
    ↓
Git Commit & Push
    ↓
GitHub Actions (futuro)
    ↓
Run Tests
    ↓
Build
    ↓
Deploy to Staging
    ↓
Manual Approval
    ↓
Deploy to Production
```

### Environments

1. **Development** (local)
   - Hot reload
   - Debug logs
   - Test data

2. **Staging** (futuro)
   - Production-like
   - Test integration

3. **Production**
   - Optimized build
   - Error logs only
   - Real data

## 🎯 Mejoras Futuras

### Corto Plazo
- [ ] Caché de Redis más agresivo
- [ ] WebSockets para updates en tiempo real
- [ ] Tests E2E completos
- [ ] CI/CD pipeline automatizado

### Mediano Plazo
- [ ] App móvil (React Native)
- [ ] Push notifications
- [ ] Extensión de navegador
- [ ] GraphQL API (alternativa a REST)

### Largo Plazo
- [ ] Machine Learning para predicción de precios
- [ ] Microservicios architecture
- [ ] Multi-región deployment
- [ ] API pública para developers

---

**Diseñado y desarrollado con ❤️ para México** 🇲🇽
