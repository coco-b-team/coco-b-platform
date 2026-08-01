#!/bin/sh
set -e

echo "Esperando a que WordPress genere wp-config.php..."
until [ -f /var/www/html/wp-config.php ]; do
  sleep 2
done

if wp core is-installed --path=/var/www/html --allow-root; then
  echo "WordPress ya estaba instalado, no se hace nada."
else
  echo "Instalando WordPress (puede tardar unos segundos mientras la base de datos termina de arrancar)..."
  until wp core install \
    --path=/var/www/html \
    --url="http://localhost:10004" \
    --title="Coco B Isla & Coco B Wellness" \
    --admin_user="admin" \
    --admin_password="admin" \
    --admin_email="dev@coco-b.local" \
    --skip-email \
    --allow-root; do
    echo "Todavia no. Reintentando en 3s..."
    sleep 3
  done

  wp rewrite structure '/%postname%/' --path=/var/www/html --allow-root
  wp rewrite flush --path=/var/www/html --allow-root

  echo "WordPress instalado. Usuario: admin / Contraseña: admin"
fi
