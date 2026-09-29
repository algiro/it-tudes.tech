---
title: Infraestructura reconstruible desde cero
summary: Un solo comando reconstruye nuestros servidores de producción en un VPS nuevo, desde el aprovisionamiento hasta TLS, copias de seguridad y despliegues.
kind: Interno
---

Nuestros servidores de producción se pueden recrear desde cero en cualquier proveedor. Una sola herramienta revisa el servidor, hace copias de seguridad cifradas, prepara una máquina vacía y restaura en ella todas las aplicaciones.

- **Independiente del proveedor.** Linux, Docker y shell, sin depender de ningún panel de hosting.
- **Secretos cifrados** en el propio repositorio con sops y age.
- **Ensayado, no supuesto.** Reconstruimos un servidor en producción sobre un VPS vacío de principio a fin: unos tres minutos de preparación y menos de un minuto de restauración.
