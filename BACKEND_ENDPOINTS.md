# Endpoints del Backend - Metalix

Este documento detalla todos los endpoints del backend utilizados por el frontend de Metalix.

## Configuración Base

### Desarrollo
- **URL Base**: `http://localhost:8081/api/v1`

### Producción
- **URL Base**: `https://metalix-backend.onrender.com/api/v1`

---

## 1. Autenticación (`/auth`)

### POST `/api/v1/auth/login`
**Descripción**: Iniciar sesión en el sistema

**Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Respuesta**:
```json
{
  "token": "string",
  "userId": "number",
  "email": "string",
  "role": "string"
}
```

**Servicio**: `AuthService`

---

### POST `/api/v1/auth/register`
**Descripción**: Registrar un nuevo usuario

**Body**:
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string (opcional)",
  "phone": "string (opcional)",
  "address": "string (opcional)",
  "city": "string (opcional)",
  "zipCode": "string (opcional)",
  "municipalityId": "number (opcional)"
}
```

**Respuesta**:
```json
{
  "token": "string",
  "userId": "number",
  "email": "string",
  "role": "string"
}
```

**Servicio**: `AuthService`

---

## 2. Usuarios (`/users`)

### GET `/api/v1/users/{id}`
**Descripción**: Obtener información completa de un usuario

**Parámetros**:
- `id` (path): ID del usuario

**Respuesta**: Objeto User completo

**Servicio**: `AuthService`, `UserIdentificationService`

---

### GET `/api/v1/users/{id}/profile`
**Descripción**: Obtener perfil completo de un usuario con estadísticas

**Parámetros**:
- `id` (path): ID del usuario

**Respuesta**: Objeto UserProfile con estadísticas de colección

**Servicio**: `UserIdentificationService`

---

### PUT `/api/v1/users/{id}`
**Descripción**: Actualizar información de un usuario

**Parámetros**:
- `id` (path): ID del usuario

**Body**: Datos parciales del usuario a actualizar

**Servicio**: `UserIdentificationService`

---

### GET `/api/v1/users/{id}/points`
**Descripción**: Obtener puntos totales de un usuario

**Parámetros**:
- `id` (path): ID del usuario

**Respuesta**: `number` (puntos totales)

**Servicio**: `RewardService`

---

### GET `/api/v1/users/{id}/stats`
**Descripción**: Obtener estadísticas detalladas de un usuario

**Parámetros**:
- `id` (path): ID del usuario

**Respuesta**:
```json
{
  "userId": "string",
  "totalCollections": "number",
  "totalWeight": "number",
  "totalPoints": "number",
  "averageWeight": "number",
  "collectionsThisMonth": "number",
  "pointsThisMonth": "number",
  "rank": "number",
  "lastUpdated": "string"
}
```

**Servicio**: `UserIdentificationService`

---

### GET `/api/v1/users/municipality/{municipalityId}`
**Descripción**: Obtener usuarios por municipalidad

**Parámetros**:
- `municipalityId` (path): ID de la municipalidad

**Respuesta**: Array de objetos User

**Servicio**: `UserIdentificationService`

---

### GET `/api/v1/users?page={page}&size={size}`
**Descripción**: Obtener lista paginada de usuarios (usado para búsqueda)

**Parámetros**:
- `page` (query): Número de página
- `size` (query): Tamaño de página

**Respuesta**: Objeto paginado con usuarios

**Servicio**: `UserIdentificationService`

---

### GET `/api/v1/users/{id}/activity?limit={limit}`
**Descripción**: Obtener actividad reciente de un usuario

**Parámetros**:
- `id` (path): ID del usuario
- `limit` (query): Límite de actividades a retornar

**Respuesta**: Array de actividades

**Servicio**: `UserIdentificationService`

---

## 3. Municipalidades (`/municipalities`)

### GET `/api/v1/municipalities`
**Descripción**: Obtener lista de todas las municipalidades

**Respuesta**: Array de objetos Municipality

**Servicio**: `MunicipalityService`

---

### GET `/api/v1/municipalities/{id}`
**Descripción**: Obtener información de una municipalidad específica

**Parámetros**:
- `id` (path): ID de la municipalidad

**Respuesta**: Objeto Municipality

**Servicio**: `MunicipalityService`

---

### POST `/api/v1/municipalities`
**Descripción**: Crear una nueva municipalidad

**Body**:
```json
{
  "name": "string",
  "code": "string",
  "region": "string",
  "population": "number",
  "area": "number",
  "contactEmail": "string",
  "contactPhone": "string"
}
```

**Servicio**: `MunicipalityService`

---

### PUT `/api/v1/municipalities/{id}`
**Descripción**: Actualizar información de una municipalidad

**Parámetros**:
- `id` (path): ID de la municipalidad

**Body**: Datos parciales de la municipalidad a actualizar

**Servicio**: `MunicipalityService`

---

### GET `/api/v1/municipalities/{id}/stats`
**Descripción**: Obtener estadísticas de una municipalidad

**Parámetros**:
- `id` (path): ID de la municipalidad

**Respuesta**:
```json
{
  "municipalityId": "string",
  "totalUsers": "number",
  "activeUsers": "number",
  "totalCollections": "number",
  "totalWeight": "number",
  "totalPoints": "number",
  "averageParticipation": "number",
  "lastUpdated": "string"
}
```

**Servicio**: `MunicipalityService`

---

### GET `/api/v1/municipalities/{id}/dashboard`
**Descripción**: Obtener datos del dashboard de una municipalidad

**Parámetros**:
- `id` (path): ID de la municipalidad

**Respuesta**:
```json
{
  "municipalityId": "string",
  "totalCollections": "number",
  "totalWeight": "number",
  "activeUsers": "number",
  "totalPoints": "number",
  "environmentalImpact": {
    "co2Saved": "number",
    "energySaved": "number",
    "treesEquivalent": "number"
  },
  "recentAlerts": "Alert[]",
  "topCollectors": "Array",
  "lastUpdated": "string"
}
```

**Servicio**: `MonitoringService`

---

## 4. Zonas (`/zones`)

### GET `/api/v1/zones`
**Descripción**: Obtener lista de todas las zonas

**Respuesta**: Array de objetos Zone

**Servicio**: `MunicipalityService`

---

### GET `/api/v1/zones/{id}`
**Descripción**: Obtener información de una zona específica

**Parámetros**:
- `id` (path): ID de la zona

**Respuesta**: Objeto Zone

**Servicio**: `MunicipalityService`

---

### GET `/api/v1/zones/municipality/{municipalityId}`
**Descripción**: Obtener zonas de una municipalidad específica

**Parámetros**:
- `municipalityId` (path): ID de la municipalidad

**Respuesta**: Array de objetos Zone

**Servicio**: `MunicipalityService`

---

### POST `/api/v1/zones`
**Descripción**: Crear una nueva zona

**Body**: Objeto Zone parcial

**Servicio**: `MunicipalityService`

---

### PUT `/api/v1/zones/{id}`
**Descripción**: Actualizar información de una zona

**Parámetros**:
- `id` (path): ID de la zona

**Body**: Datos parciales de la zona a actualizar

**Servicio**: `MunicipalityService`

---

### DELETE `/api/v1/zones/{id}`
**Descripción**: Eliminar una zona

**Parámetros**:
- `id` (path): ID de la zona

**Servicio**: `MunicipalityService`

---

## 5. Colectores de Residuos (`/waste-collectors`)

### GET `/api/v1/waste-collectors`
**Descripción**: Obtener lista de todos los colectores de residuos

**Respuesta**: Array de objetos WasteCollector

**Servicio**: `WasteCollectionService`

---

### GET `/api/v1/waste-collectors/{id}`
**Descripción**: Obtener información de un colector específico

**Parámetros**:
- `id` (path): ID del colector

**Respuesta**: Objeto WasteCollector

**Servicio**: `WasteCollectionService`

---

### PUT `/api/v1/waste-collectors/{id}`
**Descripción**: Actualizar estado de un colector

**Parámetros**:
- `id` (path): ID del colector

**Body**:
```json
{
  "status": "string (ACTIVE | INACTIVE | MAINTENANCE)"
}
```

**Servicio**: `WasteCollectionService`

---

## 6. Recolecciones de Residuos (`/waste-collections`)

### GET `/api/v1/waste-collections`
**Descripción**: Obtener lista de todas las recolecciones

**Respuesta**: Array de objetos WasteCollection (puede ser paginado)

**Servicio**: `WasteCollectionService`

---

### GET `/api/v1/waste-collections/user/{userId}`
**Descripción**: Obtener recolecciones de un usuario específico

**Parámetros**:
- `userId` (path): ID del usuario

**Respuesta**: Array de objetos WasteCollection (puede ser paginado)

**Servicio**: `WasteCollectionService`

---

### POST `/api/v1/waste-collections`
**Descripción**: Registrar una nueva recolección de residuos

**Body**:
```json
{
  "userId": "number",
  "collectorId": "number",
  "municipalityId": "number",
  "weight": "number",
  "recyclableType": "string (PLASTIC | GLASS | METAL | PAPER | CARDBOARD | ORGANIC | ELECTRONIC | HAZARDOUS | GENERAL)",
  "points": "number",
  "verificationMethod": "string (RFID | MANUAL | QR_CODE | SENSOR | VISUAL)"
}
```

**Servicio**: `WasteCollectionService`

---

## 7. Recompensas (`/rewards`)

### GET `/api/v1/rewards/active`
**Descripción**: Obtener lista de recompensas activas

**Respuesta**: Array de objetos Reward

**Servicio**: `RewardService`

---

### GET `/api/v1/rewards/municipality/{municipalityId}`
**Descripción**: Obtener recompensas de una municipalidad específica

**Parámetros**:
- `municipalityId` (path): ID de la municipalidad

**Respuesta**: Array de objetos Reward

**Servicio**: `RewardService`

---

### GET `/api/v1/rewards/{id}`
**Descripción**: Obtener información de una recompensa específica

**Parámetros**:
- `id` (path): ID de la recompensa

**Respuesta**: Objeto Reward

**Servicio**: `RewardService`

---

### POST `/api/v1/rewards`
**Descripción**: Crear una nueva recompensa

**Body**:
```json
{
  "name": "string",
  "description": "string",
  "pointsCost": "number",
  "category": "string (PRODUCT | EXPERIENCE | SERVICE | DISCOUNT | VOUCHER | CHARITY | OTHER)",
  "availability": "number (stock)",
  "expirationDate": "string (YYYY-MM-DD)",
  "municipalityId": "number"
}
```

**Servicio**: `RewardService`

---

### PUT `/api/v1/rewards/{id}`
**Descripción**: Actualizar información de una recompensa

**Parámetros**:
- `id` (path): ID de la recompensa

**Body**: Datos parciales de la recompensa a actualizar

**Servicio**: `RewardService`

---

### DELETE `/api/v1/rewards/{id}`
**Descripción**: Eliminar una recompensa

**Parámetros**:
- `id` (path): ID de la recompensa

**Servicio**: `RewardService`

---

## 8. Transacciones de Recompensas (`/reward-transactions`)

### POST `/api/v1/reward-transactions/redeem`
**Descripción**: Canjear una recompensa

**Body**:
```json
{
  "userId": "number",
  "rewardId": "number"
}
```

**Respuesta**: Objeto RewardTransaction

**Servicio**: `RewardService`

---

### GET `/api/v1/reward-transactions/user/{userId}`
**Descripción**: Obtener transacciones de un usuario

**Parámetros**:
- `userId` (path): ID del usuario

**Respuesta**: Array de objetos RewardTransaction (puede ser paginado)

**Servicio**: `RewardService`

---

## 9. Tarjetas RFID (`/rfid-cards`)

### GET `/api/v1/rfid-cards`
**Descripción**: Obtener lista de todas las tarjetas RFID

**Respuesta**: Array de objetos RfidCard

**Servicio**: `UserIdentificationService`

---

### GET `/api/v1/rfid-cards/user/{userId}`
**Descripción**: Obtener tarjeta RFID de un usuario específico

**Parámetros**:
- `userId` (path): ID del usuario

**Respuesta**: Objeto RfidCard o array con una tarjeta

**Servicio**: `UserIdentificationService`

---

### POST `/api/v1/rfid-cards/assign`
**Descripción**: Asignar una nueva tarjeta RFID a un usuario

**Body**:
```json
{
  "userId": "number",
  "cardNumber": "string"
}
```

**Respuesta**: Objeto RfidCard

**Servicio**: `UserIdentificationService`

---

### PATCH `/api/v1/rfid-cards/{id}/block`
**Descripción**: Desactivar/bloquear una tarjeta RFID

**Parámetros**:
- `id` (path): ID de la tarjeta

**Respuesta**: Objeto RfidCard actualizado

**Servicio**: `UserIdentificationService`

---

## 10. Monitoreo (`/monitoring`)

### GET `/api/v1/monitoring/reports`
**Descripción**: Obtener lista de todos los reportes

**Respuesta**: Array de objetos Report

**Servicio**: `MonitoringService`

---

### GET `/api/v1/monitoring/reports/{id}`
**Descripción**: Obtener un reporte específico

**Parámetros**:
- `id` (path): ID del reporte

**Respuesta**: Objeto Report

**Servicio**: `MonitoringService`

---

### GET `/api/v1/monitoring/reports/municipality/{municipalityId}`
**Descripción**: Obtener reportes de una municipalidad específica

**Parámetros**:
- `municipalityId` (path): ID de la municipalidad

**Respuesta**: Array de objetos Report

**Servicio**: `MonitoringService`

---

### POST `/api/v1/monitoring/reports`
**Descripción**: Generar un nuevo reporte

**Body**:
```json
{
  "reportType": "string (COLLECTION_EFFICIENCY | ENVIRONMENTAL_IMPACT | USER_PARTICIPATION | FINANCIAL_SUMMARY)",
  "municipalityId": "number",
  "generatedBy": "number",
  "data": "object",
  "status": "string (PENDING)"
}
```

**Servicio**: `MonitoringService`

---

### GET `/api/v1/monitoring/metrics`
**Descripción**: Obtener todas las métricas

**Respuesta**: Array de objetos Metric

**Servicio**: `MonitoringService`

---

### GET `/api/v1/monitoring/metrics/municipality/{municipalityId}`
**Descripción**: Obtener métricas de una municipalidad específica

**Parámetros**:
- `municipalityId` (path): ID de la municipalidad

**Respuesta**: Array de objetos Metric

**Servicio**: `MonitoringService`

---

### GET `/api/v1/monitoring/alerts`
**Descripción**: Obtener todas las alertas

**Respuesta**: Array de objetos Alert

**Servicio**: `MonitoringService`

---

### GET `/api/v1/monitoring/alerts/municipality/{municipalityId}`
**Descripción**: Obtener alertas de una municipalidad específica

**Parámetros**:
- `municipalityId` (path): ID de la municipalidad

**Respuesta**: Array de objetos Alert

**Servicio**: `MonitoringService`

---

### GET `/api/v1/monitoring/alerts/unread`
**Descripción**: Obtener alertas no resueltas

**Respuesta**: Array de objetos Alert

**Servicio**: `MonitoringService`

---

### PATCH `/api/v1/monitoring/alerts/{id}`
**Descripción**: Resolver/actualizar una alerta

**Parámetros**:
- `id` (path): ID de la alerta

**Body**:
```json
{
  "isResolved": "boolean"
}
```

**Respuesta**: Objeto Alert actualizado

**Servicio**: `MonitoringService`

---

## Resumen de Endpoints

### Por Módulo

| Módulo | Cantidad de Endpoints |
|--------|---------------------|
| Autenticación | 2 |
| Usuarios | 7 |
| Municipalidades | 6 |
| Zonas | 6 |
| Colectores de Residuos | 3 |
| Recolecciones de Residuos | 3 |
| Recompensas | 6 |
| Transacciones de Recompensas | 2 |
| Tarjetas RFID | 4 |
| Monitoreo | 10 |
| **TOTAL** | **49** |

### Por Método HTTP

| Método | Cantidad |
|--------|----------|
| GET | 32 |
| POST | 8 |
| PUT | 5 |
| PATCH | 2 |
| DELETE | 2 |

---

## Notas Importantes

1. **Autenticación**: Todos los endpoints (excepto `/auth/login` y `/auth/register`) requieren un token JWT en el header `Authorization: Bearer {token}`.

2. **Paginación**: Algunos endpoints retornan resultados paginados con la estructura:
   ```json
   {
     "content": [],
     "page": 0,
     "size": 10,
     "totalElements": 100,
     "totalPages": 10
   }
   ```

3. **Mapeo de Categorías**: El frontend y backend usan diferentes enumeraciones para las categorías de recompensas:
   - Frontend → Backend:
     - SHOPPING → PRODUCT
     - ENTERTAINMENT → EXPERIENCE
     - DINING/SERVICES → SERVICE
     - DISCOUNTS → DISCOUNT

4. **Campos de Fecha**: 
   - Frontend usa `validUntil` (ISO string)
   - Backend usa `expirationDate` (LocalDate YYYY-MM-DD)
   - Frontend usa `stock`
   - Backend usa `availability`

5. **IDs**: El frontend maneja los IDs como strings, pero el backend los espera como números en los requests.

6. **Endpoints IoT**: Los endpoints para datos de sensores (`getSensorData`) están pendientes de implementación en el backend.

---

**Última actualización**: Diciembre 3, 2025

