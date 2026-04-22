# Medsys
Plataforma de Reservas de Consultorios Médicos Universitarios

## Integrantes
- Samuel David Polo Hernández
- Natalia Sofía Arends Roa

---

## Configuración

Las credenciales se encuentran en:


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
│ ├── java/edu/unimagdalena/medsys/
│ │ ├── api/ # Controllers REST
│ │ │ ├── dto/
│ │ │ │ ├── request/ # DTOs de entrada
│ │ │ │ └── response/ # DTOs de salida
│ │ │ └── error/ # Manejo de errores global
│ │ ├── domain/
│ │ │ ├── entities/ # Entidades JPA
│ │ │ ├── enums/ # Estados del sistema
│ │ │ └── repositories/ # JpaRepository
│ │ ├── services/
│ │ │ ├── impl/ # Lógica de negocio
│ │ │ └── mappers/ # Conversión entidad <-> DTO
│ │ └── exceptions/ # Excepciones personalizadas
│ └── resources/
│ └── application.properties
│
└── test/
└── java/edu/unimagdalena/medsys/
├── api/ # Tests Controllers (MockMvc)
├── repositories/ # Tests integración (Testcontainers)
└── services/ # Tests unitarios (Mockito)


---

## Modelo de Datos

| Tabla              | Propósito |
|-------------------|----------|
| patients          | Pacientes con estado ACTIVE / INACTIVE |
| specialties       | Catálogo de especialidades médicas |
| doctors           | Profesionales asociados |
| offices           | Consultorios (AVAILABLE / MAINTENANCE / CLOSED) |
| appointment_types | Tipos de cita |
| doctor_schedules  | Horarios por día |
| appointments      | Reservas médicas |

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

- Entidades deben existir y estar activas
- No fechas pasadas
- Debe estar dentro del horario del doctor
- `endTime` se calcula en backend
- Sin traslapes (doctor, paciente, consultorio)
- Estado inicial: `SCHEDULED`

---

### Transiciones de Estado


SCHEDULED → CONFIRMED → COMPLETED
SCHEDULED → CANCELLED
CONFIRMED → CANCELLED
CONFIRMED → NO_SHOW


**Reglas:**
- SCHEDULED → CONFIRMED
- SCHEDULED/CONFIRMED → CANCELLED
- CONFIRMED → COMPLETED
- CONFIRMED → NO_SHOW

---

## Disponibilidad

- Slots según duración de cita
- Solo bloques completos
- Sin horario → lista vacía

---

## Endpoints

### Pacientes

| Método | Ruta |
|--------|------|
| POST | /api/patients |
| GET | /api/patients |
| GET | /api/patients/{id} |
| PUT | /api/patients/{id} |

---

### Doctores

| Método | Ruta |
|--------|------|
| POST | /api/doctors |
| GET | /api/doctors |
| GET | /api/doctors/{id} |
| PUT | /api/doctors/{id} |
| GET | /api/doctors/specialty/{specialtyId}/active |

---

### Especialidades

| Método | Ruta |
|--------|------|
| POST | /api/specialties |
| GET | /api/specialties |
| GET | /api/specialties/{id} |

---

### Consultorios

| Método | Ruta |
|--------|------|
| POST | /api/offices |
| GET | /api/offices |
| GET | /api/offices/{id} |
| PUT | /api/offices/{id} |

---

### Citas

| Método | Ruta |
|--------|------|
| POST | /api/appointments |
| GET | /api/appointments |
| GET | /api/appointments/{id} |
| PATCH | /api/appointments/{id}/confirm |
| PATCH | /api/appointments/{id}/cancel |
| PATCH | /api/appointments/{id}/complete |
| PATCH | /api/appointments/{id}/no-show |

---

## Decisiones de Diseño

### Arquitectura

- API Layer: Controllers REST
- Service Layer: lógica de negocio
- Repository Layer: acceso a datos
- Domain Layer: entidades y enums

---

### Repositorio

- Spring Data JPA
- Consultas derivadas
- `@Query` con JPQL
- Uso de Optional
- Sin lógica de negocio

---

### Servicio

- Inyección por constructor
- `@Transactional(readOnly = true)`
- Mappers manuales
- Validación de traslapes
- `endTime` calculado en backend

---

### Testing

- Controllers: MockMvc
- Services: Mockito
- Repositories: Testcontainers

---

## Tecnologías

- Spring Boot 3.x
- Hibernate / JPA
- PostgreSQL
- Maven
- JUnit 5
- Mockito
- Testcontainers
