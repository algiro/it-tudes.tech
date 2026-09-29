---
title: nInvoices
summary: Facturas y partes de horas para autónomos que facturan por días u horas. Autoalojado, y con la factura real a la vista antes de crearla.
kind: Código fuente disponible
imageAlt: Panel de nInvoices con importes pendientes, un gráfico mensual y las últimas facturas (datos de demostración)
---

La mayoría de las herramientas de facturación están pensadas para tiendas que venden productos. Autónomos y consultores facturan **tiempo**: los días trabajados para un cliente cada mes, a veces repartidos entre proyectos, con festivos, medias jornadas y gastos de viaje. nInvoices está construido en torno a esa rutina mensual.

- **Tu mes en un calendario.** Los días laborables empiezan como jornadas completas y los festivos ya vienen marcados.
- **Ve la factura real antes de crearla.** El último paso genera el PDF y el parte de horas reales; no se guarda nada hasta que pulsas *Generate*.
- **Tu diseño, tu idioma.** Facturas y partes de horas son plantillas HTML, con las fechas en el idioma de cada cliente.
- **Autoalojado.** Clientes, tarifas y facturas se quedan en tu propio servidor.

El backend es ASP.NET Core sobre .NET 10 con un front end en Vue 3, distribuido como imágenes Docker. El código fuente se publica bajo la licencia PolyForm Shield.
