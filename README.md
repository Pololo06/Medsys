# Medsys
Plataforma de Reservas de Consultorios Médicos Universitarios

## Integrantes
Samuel David Polo Hernández,

Natalia Sofía Arends Roa

## Stack
- Java 21
- Spring Boot 4.0.6
- PostgreSQL
- Testcontainers
- JUnit 5 + Mockito
- React + Vite

## Requisitos
- Java 21+
- Maven 3.9+
- PostgreSQL
- Docker (para tests con Testcontainers)

## Configuración de la Base de Datos
Las credenciales se encuentran en `application.properties`.
Ajustar según el entorno local.
El esquema se genera automáticamente con `spring.jpa.hibernate.ddl-auto=update`.

## Ejecución de Tests
**IMPORTANTE:** Se necesita tener Docker Desktop abierto.
Los tests de repositorio utilizan Testcontainers.
Se levanta automáticamente un contenedor PostgreSQL 16.
No se requiere configuración adicional.

```bash
./mvnw test
```

## Ejecución del Backend
```bash
./mvnw spring-boot:run
```

## Ejecución del Frontend
```bash
cd frontend
npm install
npm run dev
```

## Estructura del Proyecto
```
src/
├── main/java/edu/unimagdalena/medsys/
│   ├── api/
│   │   ├── auth/               # Autenticación (login/register)
│   │   ├── dto/request/        # DTOs de entrada
│   │   └── dto/response/       # DTOs de salida
│   │   └── error/              # ApiError + GlobalExceptionHandler
│   ├── domain/
│   │   ├── entities/           # Entidades JPA
│   │   ├── enums/              # Estados (Appointment, Office, Patient)
│   │   └── repositories/       # Interfaces JpaRepository
│   ├── exceptions/             # Custom Exceptions
│   ├── security/               # JWT auth, filters, config
│   └── services/
│       ├── impl/               # Lógica de negocio
│       └── mappers/            # Conversión Entidad <-> DTO
└── test/java/edu/unimagdalena/medsys/
    ├── api/                    # Controller tests (MockMvc)
    ├── repositories/           # Tests de Integración (Testcontainers)
    └── services/               # Tests Unitarios (Mockito)

frontend/
├── src/
│   ├── components/             # Componentes React
│   ├── pages/                  # Vistas del sistema
│   ├── services/               # Consumo de API REST
│   └── styles/                 # Hojas de estilo
└── package.json
```

## Modelo de Datos

| Tabla              | Propósito |
|--------------------|-----------|
| patients           | Pacientes con estado ACTIVE / INACTIVE / SUSPENDED |
| specialties        | Catálogo de especialidades médicas |
| doctors            | Profesionales asociados a una especialidad |
| offices            | Consultorios físicos con estado AVAILABLE / OCCUPIED / MAINTENANCE / OUT_OF_SERVICE |
| appointment_types  | Tipos de cita con duración en minutos |
| doctor_schedules   | Franjas horarias por día de la semana |
| appointments       | Reservas médicas con trazabilidad de estado |

## Relaciones Principales
- Specialty 1 → N Doctor
- Doctor 1 → N DoctorSchedule
- Doctor 1 → N Appointment
- Patient 1 → N Appointment
- Office 1 → N Appointment
- AppointmentType 1 → N Appointment

## Reglas de Negocio

### Creación de Citas
- Paciente, doctor y consultorio deben existir y estar activos
- No se pueden crear citas en fecha/hora pasada
- Debe estar dentro del horario laboral del doctor
- `endTime` lo calcula el servicio (no lo envía el cliente)
- No puede haber traslape de horario para: doctor, paciente ni consultorio
- Estado inicial: `SCHEDULED`

### Transiciones de Estado
```
SCHEDULED → CONFIRMED → COMPLETED
SCHEDULED → CANCELLED
CONFIRMED → CANCELLED (requiere motivo)
CONFIRMED → NO_SHOW
```

### Confirmación
- Solo `SCHEDULED` → `CONFIRMED`

### Cancelación
- Solo `SCHEDULED` o `CONFIRMED` → `CANCELLED` (motivo obligatorio)

### Finalización
- Solo `CONFIRMED` → `COMPLETED` (después de la hora de inicio)

### No Asistencia
- Solo `CONFIRMED` → `NO_SHOW` (después de la hora de inicio)

## Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Iniciar sesión |
| POST | /api/auth/register | Registrar usuario |

### Pacientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/patients | Registrar |
| GET | /api/patients | Listar |
| GET | /api/patients/{id} | Obtener |
| PUT | /api/patients/{id} | Actualizar |

### Doctores
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/doctors | Registrar |
| GET | /api/doctors | Listar |
| GET | /api/doctors/{id} | Obtener |
| PUT | /api/doctors/{id} | Actualizar |

### Especialidades
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/specialties | Registrar |
| GET | /api/specialties | Listar |

### Consultorios
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/offices | Registrar |
| GET | /api/offices | Listar |
| PUT | /api/offices/{id} | Actualizar |

### Tipos de Cita
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/appointment-types | Registrar |
| GET | /api/appointment-types | Listar |

### Horarios del Doctor
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/doctors/{doctorId}/schedules | Configurar |
| GET | /api/doctors/{doctorId}/schedules | Consultar |

### Citas
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/appointments | Crear |
| GET | /api/appointments | Listar |
| GET | /api/appointments/{id} | Obtener |
| PUT | /api/appointments/{id}/confirm | Confirmar |
| PUT | /api/appointments/{id}/cancel | Cancelar |
| PUT | /api/appointments/{id}/complete | Completar |
| PUT | /api/appointments/{id}/no-show | No asistida |

### Disponibilidad y Reportes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/availability/doctors/{doctorId} | Slots disponibles |
| GET | /api/reports/office-occupancy | Ocupación de consultorios |
| GET | /api/reports/doctor-productivity | Ranking de doctores |
| GET | /api/reports/no-show-patients | Pacientes con inasistencias |

## Decisiones de Diseño

### Capa de Repositorio
- Spring Data JPA con JpaRepository
- Consultas derivadas por nombre de método
- `@Query` JPQL para consultas complejas y agregaciones
- Validaciones eficientes con COUNT
- `Optional` para evitar nulls

### Capa de Servicio
- Inyección por constructor
- `@Transactional(readOnly = true)` en consultas
- Mappers manuales estáticos (sin MapStruct)
- `endTime` calculado en backend según duración del tipo de cita
- Validación de traslapes con JPQL

### Capa de Seguridad
- JWT con refresh implícito
- Filtro `OncePerRequestFilter` para validación de tokens
- `CustomAuthenticationEntryPoint` para errores 401 JSON
- `CustomAccessDeniedHandler` para errores 403 JSON
- Roles: ADMIN, DOCTOR, RECEPTIONIST

### Frontend
- React 19 + Vite
- Autenticación con JWT (contexto + localStorage)
- Protección de rutas por rol
- Tema oscuro/claro
- Skeleton loaders y estados de carga
- Manejo de errores con ErrorBoundary
- Debounce en búsquedas
