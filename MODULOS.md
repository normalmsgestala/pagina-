# Módulos de aprendizaje (Campus LEAF)

Esta sección tiene cursos autodidactas de proyectos STEAM. Cada curso tiene 5 fases. Las fases se abren en orden: hay que terminar las sesiones de la fase y sacar al menos 80 % en su repaso.

- **Ruta:** `/modulos` o `/?modulos=1`.
- **Datos:** Cloudflare D1 (usuarios, avance, respuestas, repasos, certificados).
- **Archivos:** las fotos de los alumnos y los PDF privados del docente también se guardan en D1. El video final se entrega como enlace (Drive o YouTube).
- **Sin servidor** (`npm run dev`): funciona en *modo demostración*, que guarda todo solo en el navegador.

## Archivos

| Qué | Dónde |
|---|---|
| Contenido de cada módulo | `src/modulos/data/*.ts` (se registra en `data/index.ts`) |
| Vistas del alumno | `src/modulos/ModulosApp.tsx` |
| Panel docente (gráfica, tabla, Excel) | `src/modulos/PanelDocente.tsx` |
| Simuladores | `src/modulos/simuladores.tsx` |
| Reglas de avance y certificado | `src/modulos/progreso.ts` |
| API (Cloudflare Pages Functions) | `functions/api/modulos/[[ruta]].ts` (rutas `/api/modulos/...`) |
| Tablas de la base de datos | `db/modulos-schema.sql` |
| PDFs, video e historieta públicos | `public/modulos/<id>/` |
| PDFs del docente (privados) | Se suben desde **Panel docente → Materiales del docente** |

## Configuración en Cloudflare (ya hecha)

- Base de datos D1 propia: `leaf-modulos` (separada de `campusleaf-db`; las tablas están en `db/modulos-schema.sql`).
- Proyecto de Pages conectado a este repositorio:
  - **Variable:** `MODULOS_ADMIN_EMAILS` (los correos de los administradores de los módulos, separados por coma).
  - **Binding D1:** `MODULOS_DB` → `leaf-modulos`.

Quien se registre con un correo de `MODULOS_ADMIN_EMAILS` es administrador. Desde **Panel docente → Permisos** puede dar acceso a otros docentes.

## Agregar un módulo nuevo

1. Copia `src/modulos/data/explorando-el-universo.ts` con otro nombre y cambia el contenido.
2. Agrégalo a la lista de `src/modulos/data/index.ts`.
3. Pon sus PDF públicos en `public/modulos/<id>/`. Los del docente se suben desde el panel.
4. Si lleva simuladores nuevos, agrégalos en `simuladores.tsx` y escribe su `id` en la sesión.
