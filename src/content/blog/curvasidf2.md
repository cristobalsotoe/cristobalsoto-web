---
title: "¿Qué tan extremo fue el temporal de inicios de julio en el sur de Chile?"
summary: "Analizamos el periodo de retorno de las lluvias del 6 al 9 de julio en el sur de Chile: qué tan inusual fue el evento y qué implica para el diseño de infraestructura."
date: "Jul 12 2026"
draft: false
lang: "es"
source: "Nota de campo"
image: "/img/map_periodo_retorno_histograma_inset_osm.png"
tags:
  - Hidrologia
  - Chile
  - PrecipitacionExtrema
  - CurvasIDF
  - GestionDelRiesgo
  - Infraestructura
---

Entre el 6 y 9 de julio, un sistema frontal dejó acumulaciones de lluvia que en varias zonas superaron con creces lo habitual para la época.

Aquí un análisis preliminar centrado en una pregunta clave para la gestión del riesgo: ¿con qué frecuencia cabría esperar eventos de esta magnitud en un año cualquiera?

La métrica que utilizamos es el periodo de retorno (T): el tiempo medio entre eventos de igual o mayor intensidad. No dice cuándo va a ocurrir el próximo episodio, pero sí cuán inusual fue el que acabamos de vivir.

### Lo que muestran los datos

Analizamos el periodo de retorno de las precipitaciones máximas para tres duraciones críticas en hidrología aplicada (6, 24 y 48 horas) junto con el porcentaje de área afectada en cada rango.

- **24 horas**: a primera vista, el 38% del área se sitúa en un rango relativamente frecuente (2-10 años). Pero este valor oculta el riesgo real: cerca de un 30% del territorio analizado experimentó lluvias con periodos de retorno superiores a 50 años.
- **48 horas**: la señal se intensifica en varias zonas, algunas que alcanzan T>100 años, coherentes con los impactos observados en conectividad y servicios básicos.
- **6 horas**: predominan eventos más comunes, pero con excepciones locales de mayor severidad, relevantes para generación de escorrentía rápida y anegamientos urbanos.

![Mapa de periodo de retorno de las precipitaciones máximas en el sur de Chile, con histograma de porcentaje de área afectada por rango](/img/map_periodo_retorno_histograma_inset_osm.png)

Lectura operativa: la variación espacial es decisiva. A pocos kilómetros de distancia, la severidad cambia de forma abrupta. Diseñar con promedios regionales diluye los extremos que realmente ocasionan impactos en infraestructura.

### ¿Por qué importa?

Tras la emergencia, la atención pública cae rápido. Pero la reducción de riesgo se juega antes del próximo frente: en cómo dimensionamos obras, actualizamos curvas IDF y priorizamos inversiones.

Con ese objetivo desarrollamos una herramienta abierta para análisis de precipitaciones extremas y apoyo al diseño hidráulico en Chile:

- Herramienta: [curvasidf.cl](https://curvasidf.cl/)
- Artículo: [lnkd.in/dgjKYGNG](https://lnkd.in/dgjKYGNG)

**Implicancias:**

- **Diseño de drenaje urbano**: incorporar escenarios ≥50 años en zonas críticas, no solo el evento "típico".
- **Conectividad vial**: evaluar duraciones de 24-48 h, donde se concentran los mayores periodos de retorno.
- **Gestión territorial**: mapear hotspots locales en lugar de promedios comunales.

*Nota metodológica: estimaciones basadas en IMERG v07B Early. Análisis preliminar sujeto a disponibilidad y control de calidad de datos. El mapa incluye solo píxeles con T > 2 años. El histograma calcula el porcentaje de área solo sobre territorio continental (excluye el océano).*
