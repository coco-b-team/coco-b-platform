# WordPress (Docker) — instalación local

Instancia de WordPress headless para desarrollo local, usada como CMS para
Villas, Retiros, Paquetes, Testimonios y FAQ. Cada integrante del equipo
levanta su propia copia — no hace falta compartir nada para desarrollar.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

## Levantar el proyecto

Desde esta carpeta (`wordpress/`):

```bash
docker compose up -d
```

La primera vez tarda unos minutos: descarga las imágenes, crea la base de
datos, e instala WordPress automáticamente con un usuario de prueba — no
hace falta llenar el formulario de instalación a mano.

## Acceso

| | |
|---|---|
| Sitio | http://localhost:10004 |
| Panel de administración | http://localhost:10004/wp-admin |
| API REST | http://localhost:10004/wp-json/wp/v2 |
| Usuario | `admin` |
| Contraseña | `admin` |

## Apagar

```bash
docker compose down
```

Los datos (base de datos y contenido) se conservan entre reinicios — puedes
apagar y prender sin perder nada.

Para borrar todo y empezar de cero:

```bash
docker compose down -v
```

## Estructura

- `docker-compose.yml` — define los contenedores: WordPress, MySQL, y un
  contenedor de `wp-cli` que instala WordPress automáticamente la primera vez.
- `docker/init.sh` — script que corre el contenedor de `wp-cli` para dejar
  WordPress instalado y configurado sin intervención manual.
- `mu-plugins/coco-b-content.php` — donde van a vivir los Custom Post Types
  (Villa, Retiro, Paquete, Testimonio, FAQ) una vez definidos.
- `seed.php` — script para crear contenido de prueba, pendiente hasta que
  existan los Custom Post Types.
