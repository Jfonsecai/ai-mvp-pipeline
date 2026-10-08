# Initial Project Input

## Project Idea

We want to develop an MVP of a web application similar to Rappi, but focused on veterinary services instead of restaurants.

The platform would connect veterinary clinics and independent veterinarians with pet owners who need veterinary services.

Veterinary clinics and independent veterinarians would be able to offer their services through the platform, either at their clinic or as home services.

Pet owners would be able to consult the veterinary clinics and veterinarians available in their area, see the services they offer according to their pet's needs, and schedule appointments.

The main idea is to centralize veterinary services in one platform and make it easier for pet owners to find and access the services they need for their pets.

## Initial Features

Some features we have considered for the MVP are:

* Pet registration.
* Veterinary service catalog.
* Consultation of veterinary services and providers in the user's area.
* Appointment scheduling.

These are initial ideas and have not yet been fully specified.

## Initial Users

We expect the platform to be used by:

* Pet owners who need veterinary services.
* Veterinary clinics that want to offer their services.
* Independent veterinarians who want to offer their services, either at their clinic or through home visits.

## Platform

The initial idea is to develop the product as a web application.

## Team

* David — Backend / Database
* Jhonier — Frontend
* Casanova — Backend
* Fonseca — DevOps
* Sebas — Fullstack

## Questions

### What problem do pet owners (and providers) currently experience? How do they currently find and book veterinary services, and with what consequences?
Los servicios actualmente se encuentran a través de diversas plataformas como Instagram, Facebook, Google, Maps, incluso el boca a boca o simplemente explorando por los alrededores de espacios familiares. No existe una única plataforma centralizada en la que poder encontrar especialmente este servicio, lo que hace que muchas veces por la naturaleza en la que se encuentran las veterinarias, no hayan reseñas o clasificaciones necesarias para que al experiencia de búsqueda sea óptima y cómoda, sin saltar de plataforma en plataforma o confiar ciegamente en lugares sin calificaciones accesibles.

### Which aspects of the "similar to Rappi" reference apply to this product (e.g., payments, ratings/reviews, real-time tracking, notifications)? Which are explicitly excluded from the MVP?
Para el MVP, la similaridad a Rappi es principalmente conceptual, como la forma en la que se encuentran y buscan los servicios y productos.

### How is "the user's area" determined (e.g., city or zone selection, address, device location, distance) and, for home services, what coverage area does a provider serve?
Como sólo nos enfocaremos en una ciudad para el MVP, no tomaremos en cuenta el área del usuario por ningún método.

### How should appointment scheduling work: provider availability, confirmation, rescheduling/cancellation, and differences between in-clinic and home-visit appointments?
Todo lo anterior sin tener en cuenta diferencias entre atención en clínica o en residencia.

### Do users need accounts and authentication for each role in the MVP?
Yes.

### Who creates and maintains the service catalog: a standard platform catalog, each provider, or both? Is an administrator/operator role needed?
Cada proveedor debe mantener actualizado su catálogo en la app.

### Must providers be verified (e.g., professional credentials) before offering services, and who performs that verification?
Por el momento al ser un proyecto académico no se contará con ninguna verificación para los proveedores.

### What pet information is registered, and what does "according to their pet's needs" mean (e.g., species, type of service needed)?
Se registran la especie, el peso, la edad, la altura, y la raza de la mascota. Las necesidades de las mascotas se tomarán en cuenta a la hora de mostrar servicios disponibles, dependiendo de su especie.

### What is the initial geographic market or coverage area for the MVP?
La ciudad de Bogotá.

### What are the timeline, deadlines, budget, and any academic or institutional requirements?
Se tiene una semana para desarrollar el MVP. No se cuenta con presupuesto, pues es un proyecto académico. No hay requerimientos institucionales.

### Are there required or preferred technologies, hosting constraints, or existing infrastructure?
No.

### What personal data will be handled (e.g., owner contact details, home address for home visits, pet data), and are there privacy requirements to follow?
Los usuarios tendrán un correo, nombre, contraseña, la cual deberá estar hasheada en la base de datos para seguridad, y qué información se guardará de las mascotas se especificó en otra respuesta.

### Is the web platform a firm requirement, or a preliminary preference?
Un requerimiento firme.

### Should MVP-005 (provider service offering) be confirmed as an MVP feature? It appears in the project idea but not in the "Initial Features" list.
Se confirma.
