#!/bin/bash

# Script de despliegue manual a Azure Static Web Apps
# Requiere Azure CLI instalado: az login

echo "🚀 Iniciando despliegue a Azure Static Web Apps..."

# Variables de configuración
RESOURCE_GROUP="rg-clinica-dental"
STATIC_WEB_APP_NAME="clinica-dental-frontend"
LOCATION="eastus2"
BUILD_LOCATION="dist"

echo "📦 Creando build de producción..."
npm run build

echo "☁️ Desplegando a Azure Static Web Apps..."

# Crear el Static Web App si no existe
echo "🏗️ Verificando/Creando Azure Static Web App..."
az staticwebapp show --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "📝 Creando nuevo Azure Static Web App..."
    az staticwebapp create \
        --name $STATIC_WEB_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION \
        --source "https://github.com/tu-usuario/tu-repo" \
        --branch main \
        --app-location "/" \
        --output-location "dist" \
        --login-with-github
else
    echo "✅ Azure Static Web App ya existe"
fi

echo "🌐 Obteniendo URL de despliegue..."
DEPLOYMENT_URL=$(az staticwebapp show --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostname" -o tsv)

echo "✅ Despliegue completado!"
echo "🌐 URL: https://$DEPLOYMENT_URL"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verificar que el sitio carga correctamente"
echo "   2. Probar la integración con el API backend"
echo "   3. Configurar dominio personalizado si es necesario"
