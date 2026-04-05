# Deploy "El Presidente" en IONOS con Plesk

## Configuración Actual

- **VPS**: IONOS
- **Panel**: Plesk
- **Subdominio**: presidente.aythamitorrado.es

---

## Pasos de Deploy

### 1. Sube el código al servidor

**Opción A: Git (recomendado)**

```bash
# En tu servidor (via SSH)
cd /var/www
git clone https://github.com/tu-usuario/presidente-cardgame.git
cd presidente-cardgame
```

**Opción B: FTP/SFTP**

Sube la carpeta completa a `/var/www/presidente-cardgame/` usando FileZilla o el gestor de archivos de Plesk.

---

### 2. Instala las dependencias

```bash
cd /var/www/presidente-cardgame

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 3. Construye el frontend

```bash
cd /var/www/presidente-cardgame/frontend
npm run build
```

Esto generará la carpeta `dist/` con los archivos estáticos.

---

### 4. Configura Node.js en Plesk

1. Inicia sesión en **Plesk** (https://tu-servidor:8443)
2. Ve a **Sitios web y dominios**
3. Click en **presidente.aythamitorrado.es**
4. Click en **Configuración de Node.js**

Configura:
- **Directorio raíz del documento**: `httpsdocs` (o crea una carpeta `public`)
- **Modo de aplicación**: `production`
- **Variable de entorno NODE_ENV**: `production`

5. Click en **Activar soporte Node.js**

---

### 5. Configura el proxy para Socket.io

Plesk permite configurar proxys. En **Configuración de Apache & Nginx**:

**En "Directivas Nginx adicionales":**

```nginx
location /socket.io/ {
    proxy_pass http://127.0.0.1:7080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

*Nota: El puerto 7080 es el proxy interno de Plesk para Node.js. Ajusta según tu configuración.*

---

### 6. Configura el firewall en IONOS

En el panel de IONOS VPS:

1. Ve a **Redes > Firewall**
2. Abre los puertos:
   - **22** (SSH)
   - **80** (HTTP)
   - **443** (HTTPS)
   - **8081** (Backend del juego)

---

### 7. Instala SSL (Let's Encrypt)

1. En Plesk, ve a **Sitios web y dominios > presidente.aythamitorrado.es**
2. Click en **SSL/TLS Certificates**
3. Click en **Lets Encrypt**
4. Selecciona el dominio y email
5. Click en **Obtener**
6. **Importante**: Activa "Redireccionar HTTP a HTTPS"

---

### 8. Inicia el backend con PM2

```bash
# Instala PM2 globalmente
npm install -g pm2

# Inicia el backend
cd /var/www/presidente-cardgame/backend
pm2 start index.js --name presidente-backend

# Configura inicio automático
pm2 startup
pm2 save
```

---

## Verificación

| Check | Cómo verificar |
|-------|----------------|
| Frontend carga | https://presidente.aythamitorrado.es |
| Backend corriendo | `pm2 status` |
| Logs backend | `pm2 logs presidente-backend` |
| Socket.io funciona | Abre la consola del navegador, debería conectar sin errores |

---

## Comandos rápidos

```bash
# Ver estado del backend
pm2 status

# Reiniciar backend tras cambios
pm2 restart presidente-backend

# Ver logs en tiempo real
pm2 logs presidente-backend

# Ver logs solo últimos errores
pm2 logs presidente-backend --err
```

---

## Actualización (Deploy de cambios)

```bash
cd /var/www/presidente-cardgame

# Pull últimos cambios
git pull

# Reinstalar dependencias (si hay cambios en package.json)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Reconstruir frontend
cd frontend
npm run build
cd ..

# Reiniciar backend
pm2 restart presidente-backend
```

---

## Solución de problemas

### Socket.io no conecta
1. Verifica que el backend está corriendo: `pm2 status`
2. Revisa los logs: `pm2 logs presidente-backend`
3. Comprueba que el proxy Nginx está configurado correctamente (paso 5)

### Error "Node.js no está disponible"
1. En Plesk, verifica que **Soporte Node.js** está activado para el dominio
2. Confirma que la ruta de la aplicación apunta a la carpeta correcta

### SSL no funciona
1. En Plesk, ve a **SSL/TLS > Ajustes de Hosting**
2. Asegúrate de tener un certificado válido instalado
3. Verifica que "Redireccionar HTTP a HTTPS" está activo
