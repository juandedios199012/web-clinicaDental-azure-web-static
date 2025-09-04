# 🚀 Guía de Despliegue - Azure Static Web Apps

## 📋 Preparación del Proyecto

### ✅ Estado Actual
- **Build de Producción**: ✅ Completado (`npm run build`)
- **Archivos de Configuración**: ✅ Creados
- **Pipeline CI/CD**: ✅ Configurado con credenciales
- **Optimizaciones**: ✅ Build optimizado (233KB JS, 20KB CSS)

### 📁 Archivos de Configuración Creados

#### **staticwebapp.config.json**
```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "globalHeaders": {
    "Cache-Control": "no-cache"
  }
}
```

#### **GitHub Actions Workflow**
- **Archivo**: `.github/workflows/azure-static-web-apps.yml`
- **Token**: `AZURE_STATIC_WEB_APPS_API_TOKEN_ZEALOUS_SMOKE_02CB8110F`
- **Output**: `dist/` (Vite build output)

## 🚀 Opciones de Despliegue

### **Opción 1: GitHub Actions (Recomendado)**

1. **Push al repositorio GitHub:**
```bash
git add .
git commit -m "🚀 Deploy: Frontend optimizado para Azure Static Web Apps"
git push origin main
```

2. **El pipeline se ejecutará automáticamente** y desplegará a Azure

### **Opción 2: Despliegue Manual con Azure CLI**

1. **Instalar Azure CLI** (si no lo tienes):
```bash
# macOS
brew install azure-cli

# Login
az login
```

2. **Ejecutar script de despliegue:**
```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

### **Opción 3: Despliegue Directo desde Portal Azure**

1. Ir a **Azure Portal** → **Static Web Apps**
2. Seleccionar tu recurso existente
3. **Deployment** → **Upload**
4. Subir la carpeta `dist/`

## 🌐 Después del Despliegue

### **Verificaciones Necesarias**

1. **✅ Sitio Web Carga**
   - URL: `https://zealous-smoke-02cb8110f.4.azurestaticapps.net`
   - Verificar que todas las páginas cargan correctamente

2. **✅ Integración API**
   - Probar formulario de "Agendar Cita"
   - Verificar que se conecta al backend: `clinicadentalfunctions.azurewebsites.net`
   - Confirmar que no hay errores CORS

3. **✅ Responsive Design**
   - Probar en móvil, tablet y desktop
   - Verificar que el diseño médico se mantiene

4. **✅ Performance**
   - Usar Lighthouse para verificar métricas
   - Confirmar tiempos de carga < 3s

## 🔧 Configuraciones Técnicas

### **Build Output Optimizado**
```
dist/
├── index.html (0.57 kB)
├── assets/
│   ├── index-b5482537.css (20.02 kB - 4.00 kB gzipped)
│   └── index-91c3cf95.js (233.32 kB - 75.14 kB gzipped)
```

### **Routing Configuration**
- **SPA Routing**: Todas las rutas (`/*`) sirven `index.html`
- **API Proxy**: `/api/*` habilitado para futuras integraciones
- **Cache Strategy**: `no-cache` para desarrollo, optimizar para producción

### **Environment Variables**
El frontend usa la URL del API hardcoded:
```typescript
const API_BASE_URL = 'https://clinicadentalfunctions.azurewebsites.net/api';
```

## 📊 Métricas de Performance Esperadas

### **Lighthouse Targets**
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 85

### **Core Web Vitals**
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 🔍 Troubleshooting

### **Problemas Comunes**

1. **Error 404 en rutas**
   - Verificar `staticwebapp.config.json`
   - Confirmar SPA routing configuration

2. **CORS Errors**
   - El backend debe permitir el dominio de Azure Static Web Apps
   - Verificar headers en Azure Functions

3. **Build Failures**
   - Confirmar que `npm run build` funciona localmente
   - Verificar Node.js version en pipeline (v18)

### **URLs Importantes**
- **Frontend**: `https://zealous-smoke-02cb8110f.4.azurestaticapps.net`
- **Backend API**: `https://clinicadentalfunctions.azurewebsites.net/api`
- **GitHub Repo**: Tu repositorio con el código

## ✅ Checklist Final

- [ ] Build local exitoso
- [ ] Archivos de configuración creados
- [ ] Pipeline configurado con credenciales correctas
- [ ] Código pusheado a GitHub
- [ ] Despliegue automático completado
- [ ] Sitio web accesible
- [ ] API integration funcionando
- [ ] Performance metrics validadas
- [ ] README actualizado con URLs finales

¡Tu aplicación de clínica dental está lista para ser utilizada en clases de performance testing! 🎉
