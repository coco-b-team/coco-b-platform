# Coco B - Modelo de contenido para WordPress

Base para DISC-02 / CMS-01 a CMS-03. La nomenclatura propuesta usa nombres en espanol, `snake_case`, sin acentos, pensados para ACF, REST API y consumo desde Next.js.

## Supuestos de wireframe y sitio actual

- El wireframe compartido muestra la landing movil con `VillaCollection`, `Mix & Match`, cards de villa, galeria, precio, modal "Read More" y flujo de inquiry en dos pasos.
- En las cards de villa aparecen: tipo/etiqueta, nombre, descripcion corta, capacidad de huespedes, recamaras, banos, precio desde, galeria y CTA.
- El detalle "Read More" de villa muestra: encabezado de villa, galeria con miniaturas, precio desde y descripcion larga.
- El sitio actual usa paginas para villas, retiros/wellness, especiales/paquetes, testimonios y bloques de contacto. La nueva estructura debe mover esos datos a Custom Post Types.

## Convenciones

| Concepto | Convencion |
|---|---|
| Slug de Custom Post Type | Singular, sin acentos: `villa`, `retiro`, `paquete`, `testimonio`, `faq` |
| Nombre de campo ACF | `snake_case`, descriptivo, sin prefijo redundante |
| Titulos visibles | Usar el titulo nativo de WordPress (`post_title`) |
| Descripciones largas | Usar `Editor WYSIWYG` cuando el equipo editorial necesite formato |
| Imagen principal | Usar imagen destacada de WordPress si alcanza; si debe exponerse por ACF, usar `imagen_principal` |
| Opciones fijas | Usar `Seleccion`; permitir seleccion multiple solo cuando se indique |
| Orden manual | `orden` como `Numero`, opcional, para ordenar cards en la landing |
| Estado editorial | Usar estado nativo de WordPress: borrador/publicado |

## Herramientas recomendadas

- Advanced Custom Fields gratuito para grupos de campos, textos, numeros, imagenes, fechas, verdadero/falso, seleccion y relaciones.
- Complemento gratuito sugerido para campos tipo `Galeria` y estructuras repetibles: **Advanced Gallery & Repeater Fields for ACF**. ACF documenta que `Repeater` y `Gallery` son campos de ACF PRO; este complemento permite cubrir esa necesidad sin costo inicial.
- Si el proyecto expone WordPress como headless, conviene activar "Show in REST API" en cada grupo de campos o registrar los campos por PHP con soporte REST.

## Relaciones entre tipos

| Desde | Hacia | Tipo ACF | Cardinalidad | Obligatorio | Uso |
|---|---|---|---|---|---|
| `retiro` | `villa` | Relacion | 1 o varias villas | No | Indicar donde se hospeda o realiza el retiro. |
| `paquete` | `villa` | Relacion | 0 o varias villas | No | Paquetes aplicables a villas especificas, por ejemplo experiencias o promociones. |
| `paquete` | `retiro` | Relacion | 0 o varios retiros | No | Paquetes aplicables a retiros especificos. |
| `testimonio` | `villa` | Relacion | 0 o 1 villa | No | Testimonios mostrados en cards o detalle de villa. |
| `testimonio` | `retiro` | Relacion | 0 o 1 retiro | No | Testimonios de experiencia wellness/retiro. |
| `testimonio` | `paquete` | Relacion | 0 o 1 paquete | No | Testimonios asociados a paquetes o especiales. |
| `faq` | `villa` | Relacion | 0 o varias villas | No | Preguntas especificas de una o varias villas. |
| `faq` | `retiro` | Relacion | 0 o varios retiros | No | Preguntas especificas de retiros. |
| `faq` | `paquete` | Relacion | 0 o varios paquetes | No | Preguntas especificas de paquetes. |

Regla editorial: un `paquete` puede vincularse a villas, retiros o ambos. Si no se vincula a nada, se considera global.

## Villa

Campos ya definidos en el proyecto original se conservan: capacidad en suites entre 4 y 27, estancia minima, recamaras, banos, ubicacion, casos de uso, galeria, descripcion corta y descripcion larga.

| Campo visible | Nombre ACF | Tipo ACF | Obligatorio | Formato / opciones | Wireframe / uso |
|---|---|---|---|---|---|
| Nombre | `post_title` | Titulo WP | Si | Ej. Casa Lola | Card, sheet, detalle |
| Etiqueta | `etiqueta` | Texto | Si | Ej. Single Villa | Card sobre el nombre |
| Descripcion corta | `descripcion_corta` | Area de texto | Si | 1-2 frases | Card |
| Descripcion larga | `descripcion_larga` | Editor WYSIWYG | Si | Texto editorial con parrafos | Drawer "Read More" |
| Imagen principal | `imagen_principal` | Imagen | Si | Imagen horizontal | Card cuando no se use galeria |
| Galeria de imagenes | `galeria_imagenes` | Galeria | Si | Minimo 3 imagenes recomendado | CardGallery y SheetGallery |
| Capacidad en suites | `capacidad_suites` | Numero | Si | Min 4, max 27 | Inventario original |
| Capacidad de huespedes | `capacidad_huespedes` | Numero | Si | Entero | Spec "14 Guests" |
| Recamaras | `recamaras` | Numero | Si | Entero | Spec "7 Bedrooms" |
| Banos | `banos` | Numero | Si | Entero | Spec "8 Bathrooms" |
| Estancia minima | `estancia_minima_noches` | Numero | Si | Entero, noches | Inquiry / disponibilidad |
| Ubicacion | `ubicacion` | Texto | Si | Ej. Sac Bajo, Isla Mujeres | Detalle / SEO |
| Casos de uso | `casos_uso` | Seleccion | Si | Multiple: familiar, boda, corporativo, bienestar | Cards, filtros, copy |
| Precio desde | `precio_desde` | Numero | No | Monto sin simbolo | "From $3,200 / night" |
| Moneda | `moneda` | Seleccion | No | USD, MXN | Precio |
| Unidad de precio | `unidad_precio` | Seleccion | No | noche, estancia, persona, solicitud | Precio |
| Mostrar precio bajo solicitud | `precio_bajo_solicitud` | Verdadero/Falso | Si | Default false | "Price on request" |
| CTA principal | `cta_principal_texto` | Texto | No | Ej. Inquire | Card / detalle |
| URL CTA principal | `cta_principal_url` | URL | No | URL interna o externa | Boton inquiry |
| Orden | `orden` | Numero | No | Entero ascendente | Orden de cards |
| Activa en landing | `mostrar_en_landing` | Verdadero/Falso | Si | Default true | VillaCollection |

## Retiro

| Campo visible | Nombre ACF | Tipo ACF | Obligatorio | Formato / opciones | Wireframe / uso |
|---|---|---|---|---|---|
| Nombre | `post_title` | Titulo WP | Si | Ej. Yoga & Wellness Retreat | Card / detalle |
| Categoria | `categoria_retiro` | Seleccion | Si | boda, yoga, wellness, culinario, fitness, corporativo, ytt, specialty_training | Seccion Retreats / filtros |
| Descripcion corta | `descripcion_corta` | Area de texto | Si | 1-2 frases | Card |
| Descripcion larga | `descripcion_larga` | Editor WYSIWYG | Si | Texto completo | Detalle |
| Imagen principal | `imagen_principal` | Imagen | Si | Imagen horizontal | Card / hero |
| Galeria de imagenes | `galeria_imagenes` | Galeria | No | Imagenes del retiro | Detalle |
| Fecha de inicio | `fecha_inicio` | Fecha | No | YYYY-MM-DD | Calendario de retiros |
| Fecha de fin | `fecha_fin` | Fecha | No | YYYY-MM-DD | Calendario / detalle |
| Duracion en noches | `duracion_noches` | Numero | No | Entero | Card / detalle |
| Cupo maximo | `cupo_maximo` | Numero | No | Entero | Detalle / inquiry |
| Cupo minimo | `cupo_minimo` | Numero | No | Entero | Operacion |
| Nivel | `nivel` | Seleccion | No | principiante, intermedio, avanzado, todos | Detalle |
| Incluye | `incluye` | Repetidor | No | Subcampo `item` Texto | Lista de inclusiones |
| No incluye | `no_incluye` | Repetidor | No | Subcampo `item` Texto | Lista de exclusiones |
| Facilitador / host | `facilitador` | Texto | No | Nombre visible | Detalle |
| Villa vinculada | `villas_relacionadas` | Relacion | No | Post type `villa`, multiple | Retiro -> Villa |
| Precio desde | `precio_desde` | Numero | No | Monto sin simbolo | Card / detalle |
| Moneda | `moneda` | Seleccion | No | USD, MXN | Precio |
| Estado de disponibilidad | `estado_disponibilidad` | Seleccion | Si | abierto, lista_espera, agotado, privado | CTA y calendario |
| CTA principal | `cta_principal_texto` | Texto | No | Ej. Inquire Retreat | Card / detalle |
| URL CTA principal | `cta_principal_url` | URL | No | URL interna o formulario | Boton |
| Orden | `orden` | Numero | No | Entero ascendente | Listados |
| Activo en landing | `mostrar_en_landing` | Verdadero/Falso | Si | Default true | Seccion Retreats |

## Paquete

Este tipo cubre "Mix & Match", especiales/promociones y paquetes de experiencias.

| Campo visible | Nombre ACF | Tipo ACF | Obligatorio | Formato / opciones | Wireframe / uso |
|---|---|---|---|---|---|
| Nombre | `post_title` | Titulo WP | Si | Ej. Lola & Encantada, Girls Trip Package | Card / detalle |
| Tipo de paquete | `tipo_paquete` | Seleccion | Si | mix_match, promocion, experiencia, servicio, all_inclusive | Listados / filtros |
| Descripcion corta | `descripcion_corta` | Area de texto | Si | 1-2 frases | Card |
| Descripcion larga | `descripcion_larga` | Editor WYSIWYG | Si | Texto completo | Detalle |
| Imagen principal | `imagen_principal` | Imagen | Si | Imagen horizontal | Card |
| Galeria de imagenes | `galeria_imagenes` | Galeria | No | Imagenes relacionadas | Detalle |
| Villas vinculadas | `villas_relacionadas` | Relacion | No | Post type `villa`, multiple | Mix & Match / paquetes villa |
| Retiros vinculados | `retiros_relacionados` | Relacion | No | Post type `retiro`, multiple | Paquetes retiro |
| Capacidad en suites total | `capacidad_suites_total` | Numero | No | Entero | Ej. 13 Total Suites |
| Capacidad de huespedes | `capacidad_huespedes` | Numero | No | Entero | Paquetes grupales |
| Estancia minima | `estancia_minima_noches` | Numero | No | Entero | Especiales |
| Fecha de inicio | `fecha_inicio` | Fecha | No | YYYY-MM-DD | Promociones temporales |
| Fecha de fin | `fecha_fin` | Fecha | No | YYYY-MM-DD | Promociones temporales |
| Incluye | `incluye` | Repetidor | No | Subcampo `item` Texto | Lista tipo "Included" |
| Restricciones | `restricciones` | Repetidor | No | Subcampo `item` Texto | Condiciones / notas |
| Precio desde | `precio_desde` | Numero | No | Monto sin simbolo | Card / detalle |
| Moneda | `moneda` | Seleccion | No | USD, MXN | Precio |
| Descuento | `descuento` | Texto | No | Ej. 10% off villa rates | Especiales |
| CTA principal | `cta_principal_texto` | Texto | No | Ej. Book Your Friends Getaway | Card / detalle |
| URL CTA principal | `cta_principal_url` | URL | No | URL interna o formulario | Boton |
| Orden | `orden` | Numero | No | Entero ascendente | Listados |
| Activo en landing | `mostrar_en_landing` | Verdadero/Falso | Si | Default false | Secciones destacadas |

## Testimonio

| Campo visible | Nombre ACF | Tipo ACF | Obligatorio | Formato / opciones | Wireframe / uso |
|---|---|---|---|---|---|
| Nombre / autor | `post_title` | Titulo WP | Si | Ej. Jacqueline Coleman | Card |
| Cita | `cita` | Area de texto | Si | Texto del testimonio | Card / carrusel |
| Cargo u origen | `autor_detalle` | Texto | No | Ej. NamaStay Yoga, Wash DC | Card |
| Imagen del autor | `imagen_autor` | Imagen | No | Retrato o logo | Card |
| Tipo de testimonio | `tipo_testimonio` | Seleccion | No | villa, retiro, paquete, general, prensa | Filtros / ubicacion |
| Calificacion | `calificacion` | Numero | No | 1-5 | Si se muestra rating |
| Fecha | `fecha_testimonio` | Fecha | No | YYYY-MM-DD | Orden / credibilidad |
| Villa vinculada | `villa_relacionada` | Relacion | No | Post type `villa`, max 1 | Contexto |
| Retiro vinculado | `retiro_relacionado` | Relacion | No | Post type `retiro`, max 1 | Contexto |
| Paquete vinculado | `paquete_relacionado` | Relacion | No | Post type `paquete`, max 1 | Contexto |
| Destacado | `destacado` | Verdadero/Falso | Si | Default false | Landing |
| Orden | `orden` | Numero | No | Entero ascendente | Carrusel / listado |

## Preguntas Frecuentes

| Campo visible | Nombre ACF | Tipo ACF | Obligatorio | Formato / opciones | Wireframe / uso |
|---|---|---|---|---|---|
| Pregunta | `post_title` | Titulo WP | Si | Texto de pregunta | Accordion / FAQ |
| Respuesta | `respuesta` | Editor WYSIWYG | Si | Texto con links si hacen falta | Accordion / FAQ |
| Categoria | `categoria_faq` | Seleccion | Si | villas, retiros, paquetes, reservas, pagos, transporte, servicios, general | Filtros / agrupacion |
| Villas vinculadas | `villas_relacionadas` | Relacion | No | Post type `villa`, multiple | FAQ especifica |
| Retiros vinculados | `retiros_relacionados` | Relacion | No | Post type `retiro`, multiple | FAQ especifica |
| Paquetes vinculados | `paquetes_relacionados` | Relacion | No | Post type `paquete`, multiple | FAQ especifica |
| Mostrar en landing | `mostrar_en_landing` | Verdadero/Falso | Si | Default false | FAQ destacadas |
| Orden | `orden` | Numero | No | Entero ascendente | Orden del accordion |

## Campos de formulario visibles en wireframe

Estos campos no necesariamente deben ser CPT; pueden vivir en HubSpot o en un endpoint propio. Se documentan porque el wireframe los usa y varios dependen del contenido.

| Paso | Campo | Nombre tecnico sugerido | Tipo | Obligatorio | Fuente |
|---|---|---|---|---|---|
| 1 | Villa seleccionada | `villa_id` | Relacion / ID | Si | Card o detalle de Villa |
| 1 | Check-in | `fecha_check_in` | Fecha | Si | Input con calendario |
| 1 | Check-out | `fecha_check_out` | Fecha | Si | Input con calendario |
| 1 | Huespedes | `huespedes` | Numero | Si | Stepper |
| 1 | Fechas flexibles | `fechas_flexibles` | Verdadero/Falso | No | Radio Si/No |
| 2 | Nombre | `nombre` | Texto | Si | Lead |
| 2 | Apellido | `apellido` | Texto | Si | Lead |
| 2 | Email | `email` | Email | Si | Lead |
| 2 | Telefono | `telefono` | Texto | Si | Lead |
| 2 | Mensaje / notas | `mensaje` | Area de texto | No | Lead |
| 2 | Consentimiento SMS | `consentimiento_sms` | Verdadero/Falso | Si | Checkbox legal |

## Decisiones pendientes para acordar

- Confirmar si "Mix & Match" debe administrarse como `paquete` o como subtipo de `villa`. Recomendacion: `paquete`, porque combina varias villas.
- Confirmar si los retiros tendran calendario publico con fechas reales o solo formulario para hosts. Si no hay calendario publico, `fecha_inicio` y `fecha_fin` pueden ser opcionales.
- Confirmar si precios seran publicos, "desde" o siempre bajo solicitud. La tabla permite ambos con `precio_desde` y `precio_bajo_solicitud`.
- Confirmar idioma editorial inicial. Los nombres tecnicos quedan en espanol; el contenido visible puede ser ingles/espanol segun estrategia.
- Confirmar si FAQ sera global o tambien embebida por tipo de contenido. La relacion opcional permite ambos modelos.
