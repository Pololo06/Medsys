# Medsys
Plataforma de Reservas de Consultorios Médicos Universitarios

## Integrantes
- Samuel David Polo Hernández
- Natalia Sofía Arends Roa

---

## Requisitos
- Java 21+
- Maven 3.9+
- PostgreSQL
- Docker

---

## Configuración de la Base de Datos

Las credenciales por defecto se encuentran en:

application.properties

Ajustar según el entorno local.

El esquema se genera automáticamente con:
spring.jpa.hibernate.ddl-auto=update

---

## Ejecución de Tests

**IMPORTANTE:** Se necesita tener Docker Desktop abierto.

- Los tests de repositorio utilizan Testcontainers
- Se levanta automáticamente un contenedor PostgreSQL 16
- No se requiere configuración adicional

---

## Estructura del Proyecto

```text
src/
├── main/
│   ├── java/edu/unimagdalena/medsys/
│   │   ├── entities/       # Entidades JPA
│   │   ├── enums/          # Estados (Appointment, Office, Patient)
│   │   ├── dto/
│   │   │   ├── request/    # DTOs de entrada
│   │   │   └── response/   # DTOs de salida
│   │   ├── repositories/   # Interfaces JpaRepository
│   │   ├── services/
│   │   │   └── impl/       # Lógica de negocio
│   │   ├── mappers/        # Conversión Entidad <-> DTO
│   │   └── exceptions/     # Custom Exceptions & Global Handler
│   └── resources/
│       └── application.properties
└── test/
    └── java/edu/unimagdalena/medsys/
        ├── repositories/   # Tests de Integración (Testcontainers)
        └── services/       # Tests Unitarios (Mockito)

---

## Modelo de Datos

| Tabla              | Propósito |
|-------------------|----------|
| patients          | Pacientes con estado ACTIVE / INACTIVE |
| specialties       | Catálogo de especialidades médicas |
| doctors           | Profesionales asociados a una especialidad |
| offices           | Consultorios físicos con estado AVAILABLE / MAINTENANCE / CLOSED |
| appointment_types | Tipos de cita con duración en minutos |
| doctor_schedules  | Franjas horarias por día |
| appointments      | Reservas médicas con estado |

---

## Relaciones Principales

- Specialty 1 → N Doctor
- Doctor 1 → N DoctorSchedule
- Doctor 1 → N Appointment
- Patient 1 → N Appointment
- Office 1 → N Appointment
- AppointmentType 1 → N Appointment

---

## Reglas de Negocio

### Creación de Citas

- El paciente, doctor y consultorio deben existir y estar activos
- No se pueden crear citas en fecha/hora pasada
- Debe estar dentro del horario laboral del doctor
- endTime lo calcula el servicio (no lo envía el cliente)
- No puede haber traslape:
  - Doctor
  - Paciente
  - Consultorio
- Estado inicial: SCHEDULED

---

### Transiciones de Estado


SCHEDULED -> CONFIRMED -> COMPLETED
SCHEDULED -> CANCELLED
CONFIRMED -> CANCELLED
CONFIRMED -> NO_SHOW


Reglas:
- Solo SCHEDULED → CONFIRMED
- Solo SCHEDULED o CONFIRMED → CANCELLED (requiere motivo)
- Solo CONFIRMED → COMPLETED (después de la hora de inicio)
- Solo CONFIRMED → NO_SHOW (después de la hora de inicio)

---

## Disponibilidad

- Los slots se calculan según la duración del tipo de cita
- Solo se devuelven bloques completos y libres
- Si no hay horario configurado: lista vacía

---

## Endpoints

### Pacientes

| Método | Ruta | Descripción |
|------|------|------------|
| POST | /api/patients | Registrar paciente |
| GET | /api/patients | Listar pacientes |
| GET | /api/patients/{id} | Obtener por ID |
| PUT | /api/patients/{id} | Actualizar |

---

### Doctores

| Método | Ruta | Descripción |
|------|------|------------|
| POST | /api/doctors | Registrar doctor |
| GET | /api/doctors | Listar |
| GET | /api/doctors/{id} | Obtener |
| PUT | /api/doctors/{id} | Actualizar |

---

### Especialidades

| Método | Ruta | Descripción |
|------|------|------------|
| POST | /api/specialties | Registrar |
| GET | /api/specialties | Listar |

---

### Consultorios

| Método | Ruta | Descripción |
|------|------|------------|
| POST | /api/offices | Registrar |
| GET | /api/offices | Listar |
| PUT | /api/offices/{id} | Actualizar |

---

### Tipos de Cita

| Método | Ruta | Descripción |
|------|------|------------|
| POST | /api/appointment-types | Registrar |
| GET | /api/appointment-types | Listar |

---

### Horarios del Doctor

| Método | Ruta | Descripción |
|------|------|------------|
| POST | /api/doctors/{doctorId}/schedules | Configurar |
| GET | /api/doctors/{doctorId}/schedules | Consultar |

---

### Citas

| Método | Ruta | Descripción |
|------|------|------------|
| POST | /api/appointments | Crear |
| GET | /api/appointments | Listar |
| GET | /api/appointments/{id} | Obtener |
| PUT | /api/appointments/{id}/confirm | Confirmar |
| PUT | /api/appointments/{id}/cancel | Cancelar |
| PUT | /api/appointments/{id}/complete | Completar |
| PUT | /api/appointments/{id}/no-show | No asistida |

---

### Disponibilidad y Reportes

| Método | Ruta | Descripción |
|------|------|------------|
| GET | /api/availability/doctors/{doctorId} | Slots disponibles |
| GET | /api/reports/office-occupancy | Ocupación |
| GET | /api/reports/doctor-productivity | Ranking |
| GET | /api/reports/no-show-patients | Inasistencias |

---

## Decisiones de Diseño

### Capa de Repositorio

- Uso de Spring Data JPA con JpaRepository
- Consultas derivadas por nombre
- Uso de @Query para consultas complejas
- Validaciones eficientes con COUNT
- Agregaciones con GROUP BY
- Uso de Optional para evitar nulls
- Sin lógica de negocio (solo acceso a datos)

---

### Capa de Servicio

- Inyección por constructor
- @Transactional(readOnly = true) en consultas
- Mappers manuales (sin MapStruct)
- endTime calculado en backend
- Validación de traslapes con JPQL
- Solo considera citas SCHEDULED y CONFIRMED
