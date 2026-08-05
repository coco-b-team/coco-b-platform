# Coco B - Modelo de contenido para WordPress

Base para DISC-02 / CMS-01 a CMS-03. La documentacion esta en espanol para el equipo, pero la nomenclatura tecnica usa ingles, `snake_case`, sin prefijos redundantes, pensada para ACF, REST API y consumo desde Next.js.

## Supuestos de wireframe y sitio actual

- El wireframe compartido muestra la landing movil con `VillaCollection`, `Mix & Match`, cards de villa, galeria, precio, modal "Read More" y flujo de inquiry en dos pasos.
- En las cards de villa aparecen: tipo/etiqueta, nombre, descripcion corta, capacidad de huespedes, recamaras, banos, precio desde, galeria y CTA.
- El detalle "Read More" de villa muestra: encabezado de villa, galeria con miniaturas, precio desde y descripcion larga.
- El sitio actual usa paginas para villas, retiros/wellness, especiales/paquetes, testimonios y bloques de contacto. La nueva estructura debe mover esos datos a Custom Post Types.

## Convenciones

| Concepto | Convencion |
|---|---|
| Slug de Custom Post Type | Singular en ingles cuando aplique: `villa`, `retreat`, `package`, `testimonial`, `faq` |
| Nombre de campo ACF | Ingles, `snake_case`, descriptivo, sin prefijo redundante |
| Titulos visibles | Usar el titulo nativo de WordPress (`post_title`) |
| Descripciones largas | Usar `Editor WYSIWYG` cuando el equipo editorial necesite formato |
| Imagen principal | Usar imagen destacada de WordPress si alcanza; si debe exponerse por ACF, usar `main_image` |
| Opciones fijas | Usar `Seleccion`; permitir seleccion multiple solo cuando se indique |
| Orden manual | `sort_order` como `Numero`, opcional, para ordenar cards en la landing |
| Estado editorial | Usar estado nativo de WordPress: borrador/publicado |

Buenas practicas aplicadas:

- Mantener slugs de CPT en ingles y singular para que los endpoints sean previsibles: `/wp-json/wp/v2/retreat`.
- Reutilizar nombres de campos comunes entre tipos de contenido cuando representan lo mismo: `short_description`, `long_description`, `main_image`, `image_gallery`, `starting_price`.
- Evitar prefijos por tipo dentro de cada grupo ACF: usar `guest_capacity` en Villa, no `villa_guest_capacity`.
- Usar valores de `Seleccion` en ingles, minusculas y con guion bajo para evitar traducciones en codigo: `price_on_request`, `all_inclusive`, `sold_out`.
- Separar label editorial de nombre tecnico: el editor puede ver "Descripcion corta", pero la API entrega `short_description`.

## Herramientas recomendadas

- Advanced Custom Fields gratuito para grupos de campos, textos, numeros, imagenes, fechas, verdadero/falso, seleccion y relaciones.
- Complemento gratuito sugerido para campos tipo `Galeria` y estructuras repetibles: **Advanced Gallery & Repeater Fields for ACF**. ACF documenta que `Repeater` y `Gallery` son campos de ACF PRO; este complemento permite cubrir esa necesidad sin costo inicial.
- Si el proyecto expone WordPress como headless, conviene activar "Show in REST API" en cada grupo de campos o registrar los campos por PHP con soporte REST.

## Relaciones entre tipos

| Desde | Hacia | Tipo ACF | Cardinalidad | Obligatorio | Uso |
|---|---|---|---|---|---|
| `retreat` | `villa` | Relacion | 1 o varias villas | No | Indicar donde se hospeda o realiza el retiro. |
| `package` | `villa` | Relacion | 0 o varias villas | No | Paquetes aplicables a villas especificas, por ejemplo experiencias o promociones. |
| `package` | `retreat` | Relacion | 0 o varios retiros | No | Paquetes aplicables a retiros especificos. |
| `testimonial` | `villa` | Relacion | 0 o 1 villa | No | Testimonios mostrados en cards o detalle de villa. |
| `testimonial` | `retreat` | Relacion | 0 o 1 retiro | No | Testimonios de experiencia wellness/retiro. |
| `testimonial` | `package` | Relacion | 0 o 1 paquete | No | Testimonios asociados a paquetes o especiales. |
| `faq` | `villa` | Relacion | 0 o varias villas | No | Preguntas especificas de una o varias villas. |
| `faq` | `retreat` | Relacion | 0 o varios retiros | No | Preguntas especificas de retiros. |
| `faq` | `package` | Relacion | 0 o varios paquetes | No | Preguntas especificas de paquetes. |

Regla editorial: un `package` puede vincularse a villas, retiros o ambos. Si no se vincula a nada, se considera global.

## Villa

Campos ya definidos en el proyecto original se conservan: capacidad en suites entre 4 y 27, estancia minima, recamaras, banos, ubicacion, casos de uso, galeria, descripcion corta y descripcion larga.

| Campo visible | Nombre ACF | Tipo ACF | Obligatorio | Formato / opciones | Wireframe / uso |
|---|---|---|---|---|---|
| Nombre | `post_title` | Titulo WP | Si | Ej. Casa Lola | Card, sheet, detalle |
| Etiqueta | `label` | Texto | Si | Ej. Single Villa | Card sobre el nombre |
| Descripcion corta | `short_description` | Area de texto | Si | 1-2 frases | Card |
| Descripcion larga | `long_description` | Editor WYSIWYG | Si | Texto editorial con parrafos | Drawer "Read More" |
| Imagen principal | `main_image` | Imagen | Si | Imagen horizontal | Card cuando no se use galeria |
| Galeria de imagenes | `image_gallery` | Galeria | Si | Minimo 3 imagenes recomendado | CardGallery y SheetGallery |
| Capacidad en suites | `suite_capacity` | Numero | Si | Min 4, max 27 | Inventario original |
| Capacidad de huespedes | `guest_capacity` | Numero | Si | Entero | Spec "14 Guests" |
| Recamaras | `bedrooms` | Numero | Si | Entero | Spec "7 Bedrooms" |
| Banos | `bathrooms` | Numero | Si | Entero | Spec "8 Bathrooms" |
| Estancia minima | `minimum_stay_nights` | Numero | Si | Entero, noches | Inquiry / disponibilidad |
| Ubicacion | `location` | Texto | Si | Ej. Sac Bajo, Isla Mujeres | Detalle / SEO |
| Casos de uso | `use_cases` | Seleccion | Si | Multiple: family, wedding, corporate, wellness | Cards, filtros, copy |
| Precio desde | `starting_price` | Numero | No | Monto sin simbolo | "From $3,200 / night" |
| Moneda | `currency` | Seleccion | No | USD, MXN | Precio |
| Unidad de precio | `price_unit` | Seleccion | No | night, stay, person, request | Precio |
| Mostrar precio bajo solicitud | `price_on_request` | Verdadero/Falso | Si | Default false | "Price on request" |
| CTA principal | `primary_cta_label` | Texto | No | Ej. Inquire | Card / detalle |
| URL CTA principal | `primary_cta_url` | URL | No | URL interna o externa | Boton inquiry |
| Orden | `sort_order` | Numero | No | Entero ascendente | Orden de cards |
| Activa en landing | `show_on_landing` | Verdadero/Falso | Si | Default true | VillaCollection |

## Retiro

| Campo visible | Nombre ACF | Tipo ACF | Obligatorio | Formato / opciones | Wireframe / uso |
|---|---|---|---|---|---|
| Nombre | `post_title` | Titulo WP | Si | Ej. Yoga & Wellness Retreat | Card / detalle |
| Categoria | `retreat_category` | Seleccion | Si | wedding, yoga, wellness, culinary, fitness, corporate, ytt, specialty_training | Seccion Retreats / filtros |
| Descripcion corta | `short_description` | Area de texto | Si | 1-2 frases | Card |
| Descripcion larga | `long_description` | Editor WYSIWYG | Si | Texto completo | Detalle |
| Imagen principal | `main_image` | Imagen | Si | Imagen horizontal | Card / hero |
| Galeria de imagenes | `image_gallery` | Galeria | No | Imagenes del retiro | Detalle |
| Fecha de inicio | `start_date` | Fecha | No | YYYY-MM-DD | Calendario de retiros |
| Fecha de fin | `end_date` | Fecha | No | YYYY-MM-DD | Calendario / detalle |
| Duracion en noches | `duration_nights` | Numero | No | Entero | Card / detalle |
| Cupo maximo | `maximum_capacity` | Numero | No | Entero | Detalle / inquiry |
| Cupo minimo | `minimum_capacity` | Numero | No | Entero | Operacion |
| Nivel | `level` | Seleccion | No | beginner, intermediate, advanced, all_levels | Detalle |
| Incluye | `included_items` | Repetidor | No | Subcampo `item` Texto | Lista de inclusiones |
| No incluye | `excluded_items` | Repetidor | No | Subcampo `item` Texto | Lista de exclusiones |
| Facilitador / host | `host_name` | Texto | No | Nombre visible | Detalle |
| Villa vinculada | `related_villas` | Relacion | No | Post type `villa`, multiple | Retiro -> Villa |
| Precio desde | `starting_price` | Numero | No | Monto sin simbolo | Card / detalle |
| Moneda | `currency` | Seleccion | No | USD, MXN | Precio |
| Estado de disponibilidad | `availability_status` | Seleccion | Si | open, waitlist, sold_out, private | CTA y calendario |
| CTA principal | `primary_cta_label` | Texto | No | Ej. Inquire Retreat | Card / detalle |
| URL CTA principal | `primary_cta_url` | URL | No | URL interna o formulario | Boton |
| Orden | `sort_order` | Numero | No | Entero ascendente | Listados |
| Activo en landing | `show_on_landing` | Verdadero/Falso | Si | Default true | Seccion Retreats |

## Paquete

Este tipo cubre "Mix & Match", especiales/promociones y paquetes de experiencias.

| Campo visible | Nombre ACF | Tipo ACF | Obligatorio | Formato / opciones | Wireframe / uso |
|---|---|---|---|---|---|
| Nombre | `post_title` | Titulo WP | Si | Ej. Lola & Encantada, Girls Trip Package | Card / detalle |
| Tipo de paquete | `package_type` | Seleccion | Si | mix_match, promotion, experience, service, all_inclusive | Listados / filtros |
| Descripcion corta | `short_description` | Area de texto | Si | 1-2 frases | Card |
| Descripcion larga | `long_description` | Editor WYSIWYG | Si | Texto completo | Detalle |
| Imagen principal | `main_image` | Imagen | Si | Imagen horizontal | Card |
| Galeria de imagenes | `image_gallery` | Galeria | No | Imagenes relacionadas | Detalle |
| Villas vinculadas | `related_villas` | Relacion | No | Post type `villa`, multiple | Mix & Match / paquetes villa |
| Retiros vinculados | `related_retreats` | Relacion | No | Post type `retreat`, multiple | Paquetes retiro |
| Capacidad en suites total | `total_suite_capacity` | Numero | No | Entero | Ej. 13 Total Suites |
| Capacidad de huespedes | `guest_capacity` | Numero | No | Entero | Paquetes grupales |
| Estancia minima | `minimum_stay_nights` | Numero | No | Entero | Especiales |
| Fecha de inicio | `start_date` | Fecha | No | YYYY-MM-DD | Promociones temporales |
| Fecha de fin | `end_date` | Fecha | No | YYYY-MM-DD | Promociones temporales |
| Incluye | `included_items` | Repetidor | No | Subcampo `item` Texto | Lista tipo "Included" |
| Restricciones | `restrictions` | Repetidor | No | Subcampo `item` Texto | Condiciones / notas |
| Precio desde | `starting_price` | Numero | No | Monto sin simbolo | Card / detalle |
| Moneda | `currency` | Seleccion | No | USD, MXN | Precio |
| Descuento | `discount_label` | Texto | No | Ej. 10% off villa rates | Especiales |
| CTA principal | `primary_cta_label` | Texto | No | Ej. Book Your Friends Getaway | Card / detalle |
| URL CTA principal | `primary_cta_url` | URL | No | URL interna o formulario | Boton |
| Orden | `sort_order` | Numero | No | Entero ascendente | Listados |
| Activo en landing | `show_on_landing` | Verdadero/Falso | Si | Default false | Secciones destacadas |

## Testimonio

| Campo visible | Nombre ACF | Tipo ACF | Obligatorio | Formato / opciones | Wireframe / uso |
|---|---|---|---|---|---|
| Nombre / autor | `post_title` | Titulo WP | Si | Ej. Jacqueline Coleman | Card |
| Cita | `quote` | Area de texto | Si | Texto del testimonio | Card / carrusel |
| Cargo u origen | `author_detail` | Texto | No | Ej. NamaStay Yoga, Wash DC | Card |
| Imagen del autor | `author_image` | Imagen | No | Retrato o logo | Card |
| Tipo de testimonio | `testimonial_type` | Seleccion | No | villa, retreat, package, general, press | Filtros / ubicacion |
| Calificacion | `rating` | Numero | No | 1-5 | Si se muestra rating |
| Fecha | `testimonial_date` | Fecha | No | YYYY-MM-DD | Orden / credibilidad |
| Villa vinculada | `related_villa` | Relacion | No | Post type `villa`, max 1 | Contexto |
| Retiro vinculado | `related_retreat` | Relacion | No | Post type `retreat`, max 1 | Contexto |
| Paquete vinculado | `related_package` | Relacion | No | Post type `package`, max 1 | Contexto |
| Destacado | `is_featured` | Verdadero/Falso | Si | Default false | Landing |
| Orden | `sort_order` | Numero | No | Entero ascendente | Carrusel / listado |

## Preguntas Frecuentes

| Campo visible | Nombre ACF | Tipo ACF | Obligatorio | Formato / opciones | Wireframe / uso |
|---|---|---|---|---|---|
| Pregunta | `post_title` | Titulo WP | Si | Texto de pregunta | Accordion / FAQ |
| Respuesta | `answer` | Editor WYSIWYG | Si | Texto con links si hacen falta | Accordion / FAQ |
| Categoria | `faq_category` | Seleccion | Si | villas, retreats, packages, booking, payments, transportation, services, general | Filtros / agrupacion |
| Villas vinculadas | `related_villas` | Relacion | No | Post type `villa`, multiple | FAQ especifica |
| Retiros vinculados | `related_retreats` | Relacion | No | Post type `retreat`, multiple | FAQ especifica |
| Paquetes vinculados | `related_packages` | Relacion | No | Post type `package`, multiple | FAQ especifica |
| Mostrar en landing | `show_on_landing` | Verdadero/Falso | Si | Default false | FAQ destacadas |
| Orden | `sort_order` | Numero | No | Entero ascendente | Orden del accordion |

## Campos de formulario visibles en wireframe

Estos campos no necesariamente deben ser CPT; pueden vivir en HubSpot o en un endpoint propio. Se documentan porque el wireframe los usa y varios dependen del contenido.

| Paso | Campo | Nombre tecnico sugerido | Tipo | Obligatorio | Fuente |
|---|---|---|---|---|---|
| 1 | Villa seleccionada | `villa_id` | Relacion / ID | Si | Card o detalle de Villa |
| 1 | Check-in | `check_in_date` | Fecha | Si | Input con calendario |
| 1 | Check-out | `check_out_date` | Fecha | Si | Input con calendario |
| 1 | Huespedes | `guest_count` | Numero | Si | Stepper |
| 1 | Fechas flexibles | `flexible_dates` | Verdadero/Falso | No | Radio Si/No |
| 2 | Nombre | `first_name` | Texto | Si | Lead |
| 2 | Apellido | `last_name` | Texto | Si | Lead |
| 2 | Email | `email` | Email | Si | Lead |
| 2 | Telefono | `phone` | Texto | Si | Lead |
| 2 | Mensaje / notas | `message` | Area de texto | No | Lead |
| 2 | Consentimiento SMS | `sms_consent` | Verdadero/Falso | Si | Checkbox legal |

## Decisiones pendientes para acordar

- Confirmar si "Mix & Match" debe administrarse como `package` o como subtipo de `villa`. Recomendacion: `package`, porque combina varias villas.
- Confirmar si los retiros tendran calendario publico con fechas reales o solo formulario para hosts. Si no hay calendario publico, `start_date` y `end_date` pueden ser opcionales.
- Confirmar si precios seran publicos, "desde" o siempre bajo solicitud. La tabla permite ambos con `starting_price` y `price_on_request`.
- Confirmar idioma editorial inicial. Los nombres tecnicos quedan en ingles; el contenido visible puede ser ingles/espanol segun estrategia.
- Confirmar si FAQ sera global o tambien embebida por tipo de contenido. La relacion opcional permite ambos modelos.
