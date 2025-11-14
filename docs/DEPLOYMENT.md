# 🚀 Guía de Despliegue - Price Tracking System

Esta guía te ayudará a desplegar el sistema completo de price tracking en producción.

## 📋 Requisitos Previos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 7.x
- Docker (opcional pero recomendado)

## 🏃 Despliegue Local (Desarrollo)

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd Kanan-
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Base de datos
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/price_tracking"

# JWT
JWT_SECRET=tu-secret-key-super-seguro
JWT_REFRESH_SECRET=tu-refresh-secret-key

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
```

### 3. Levantar servicios con Docker

```bash
npm run docker:up
```

Esto iniciará PostgreSQL y Redis automáticamente.

### 4. Instalar dependencias

```bash
npm run install:all
```

### 5. Ejecutar migraciones

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed  # Opcional: cargar datos de ejemplo
```

### 6. Iniciar el sistema

En una terminal:
```bash
npm run dev
```

O inicia backend y frontend por separado:

Terminal 1 (Backend):
```bash
cd backend
npm run start:dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Accede a:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 🌐 Despliegue en Producción

### Opción 1: Railway (Recomendado para Backend)

#### 1. Crear proyecto en Railway

1. Ve a [Railway](https://railway.app)
2. Crea un nuevo proyecto
3. Agrega PostgreSQL y Redis desde el marketplace

#### 2. Configurar variables de entorno

En el dashboard de Railway, agrega:

```env
NODE_ENV=production
DATABASE_URL=<postgresql-url-from-railway>
REDIS_HOST=<redis-host-from-railway>
REDIS_PORT=<redis-port-from-railway>
JWT_SECRET=<generate-random-secret>
JWT_REFRESH_SECRET=<generate-random-secret>
MAIL_HOST=smtp.gmail.com
MAIL_USER=<your-email>
MAIL_PASSWORD=<your-app-password>
APP_URL=<your-frontend-url>
```

#### 3. Deploy

```bash
cd backend
railway init
railway up
```

#### 4. Ejecutar migraciones

```bash
railway run npm run prisma:migrate:prod
```

### Opción 2: Render

#### Backend

1. Crea un nuevo **Web Service** en [Render](https://render.com)
2. Conecta tu repositorio Git
3. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build && npm run prisma:generate`
   - **Start Command**: `npm run start:prod`
4. Agrega PostgreSQL desde Render Dashboard
5. Agrega variables de entorno

#### Frontend en Vercel

1. Ve a [Vercel](https://vercel.com)
2. Importa tu repositorio
3. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Variables de entorno:
   ```env
   VITE_API_URL=https://tu-backend.render.com/api
   ```

### Opción 3: DigitalOcean App Platform

#### 1. Crear Apps

**Backend:**
- **Type**: Web Service
- **Source**: GitHub repo
- **Environment Variables**: Configurar todas las variables
- **Plan**: Professional ($12/mes)

**Frontend:**
- **Type**: Static Site
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`

**Database:**
- PostgreSQL Managed Database ($15/mes)

**Redis:**
- Redis Managed Database ($15/mes)

#### 2. Configurar dominios

- Backend: `api.tudominio.com`
- Frontend: `www.tudominio.com`

## 🔒 Seguridad en Producción

### 1. Variables de Entorno

Asegúrate de usar valores seguros para:

```env
# Genera secrets aleatorios
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Usa contraseñas fuertes
DB_PASSWORD=<password-fuerte>
REDIS_PASSWORD=<password-fuerte>
```

### 2. CORS

En `backend/src/main.ts`, configura CORS apropiadamente:

```typescript
app.enableCors({
  origin: ['https://tudominio.com', 'https://www.tudominio.com'],
  credentials: true,
});
```

### 3. Rate Limiting

El sistema ya incluye rate limiting configurado en `app.module.ts`.

### 4. SSL/TLS

Asegúrate de que tu backend usa HTTPS. La mayoría de plataformas lo hacen automáticamente.

## 📊 Monitoreo

### Logs

- **Railway**: Dashboard > Deployments > Logs
- **Render**: Dashboard > Logs
- **DigitalOcean**: App > Runtime Logs

### Health Check

El sistema incluye un endpoint de health:

```bash
curl https://api.tudominio.com/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔄 Actualizaciones

### Despliegue continuo

La mayoría de plataformas detectan cambios en Git automáticamente.

Para deployar manualmente:

```bash
git add .
git commit -m "Update: descripción"
git push origin main
```

### Migraciones de base de datos

Antes de deploy con cambios en schema:

```bash
# Desarrollo
npm run db:migrate

# Producción (Railway)
railway run npm run prisma:migrate:prod

# Producción (Render/DigitalOcean)
# Conecta a la base de datos y ejecuta
npm run prisma:migrate:prod
```

## 🧪 Testing antes de Producción

### Backend

```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend

```bash
cd frontend
npm run build  # Verifica que el build funcione
npm run preview  # Preview del build
```

## 📱 Configuración de Dominios Personalizados

### Vercel (Frontend)

1. Dashboard > Settings > Domains
2. Agrega tu dominio: `www.tudominio.com`
3. Configura DNS según instrucciones

### Railway/Render (Backend)

1. Dashboard > Settings > Custom Domain
2. Agrega: `api.tudominio.com`
3. Configura CNAME en tu DNS

## 🎯 Checklist de Producción

Antes de lanzar, verifica:

- [ ] Variables de entorno configuradas
- [ ] Secrets generados con valores aleatorios fuertes
- [ ] SSL/HTTPS habilitado
- [ ] CORS configurado correctamente
- [ ] Base de datos con backups automáticos
- [ ] Redis configurado y accesible
- [ ] Migraciones ejecutadas
- [ ] Seed de datos inicial (si aplica)
- [ ] Tests pasando
- [ ] Logs funcionando
- [ ] Health check respondiendo
- [ ] Email funcionando (enviar test)
- [ ] Dominio personalizado configurado
- [ ] Monitoreo activado

## 🆘 Troubleshooting

### Error: "Cannot connect to database"

1. Verifica `DATABASE_URL` en variables de entorno
2. Asegúrate de que PostgreSQL está corriendo
3. Verifica que las credenciales son correctas

### Error: "Redis connection failed"

1. Verifica `REDIS_HOST` y `REDIS_PORT`
2. Asegúrate de que Redis está corriendo
3. Verifica firewall/seguridad

### Error: "JWT token invalid"

1. Verifica que `JWT_SECRET` es el mismo en todas las instancias
2. Limpia cookies/localStorage en el navegador

### Build fallando

1. Verifica versión de Node.js (>= 18)
2. Limpia node_modules: `rm -rf node_modules && npm install`
3. Verifica logs de build

## 📞 Soporte

Para problemas o preguntas:

- GitHub Issues: [repository-url]/issues
- Email: support@pricetracking.com
- Documentación: Ver README.md principal

---

**¡Feliz Deployment!** 🎉
