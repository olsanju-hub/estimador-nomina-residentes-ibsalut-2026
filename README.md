# Estimador nómina residentes IB-Salut 2026

App web estática para estimar la nómina mensual de residentes del IB-Salut. Funciona con HTML, CSS y JavaScript vanilla, sin backend ni paso de compilación.

## Alcance

Solo personal sanitario en formación/residentes del IB-Salut:

- MIR/FIR/BIR/QIR/PIR y otros facultativos en formación que usen la misma tabla.
- EIR queda desactivado hasta confirmar datos oficiales 2026 específicos.
- Islas disponibles: Mallorca, Menorca e Ibiza.
- Formentera no se ofrece porque no hay residentes en Formentera.
- No incluye adjuntos, estatutarios fijos, eventuales no residentes ni otras categorías.
- El cálculo no incluye trienios.

## Fuentes oficiales consultadas

- IB-Salut, tablas salariales oficiales actualizadas a 2025: https://www.ibsalut.es/es/profesionales/recursos-humanos/tablas-salariales
- PDF oficial IB-Salut 2025: https://www.ibsalut.es/docs/rrhh/normativa/instrucciones%20y%20circulares/es/2025%20Tabla%20salarial%20personal%20estatutario%20CAST.pdf
- BOIB núm. 010, 20/01/2026, acuerdo de insularidad para personal estatutario IB-Salut: https://www.caib.es/eboibfront/es/2026/12221/710965/acuerdo-del-consejo-de-gobierno-de-16-de-enero-de-
- CAIB, subida salarial 2026 del 1,5% para empleados públicos: https://www.caib.es/pidip2front/ficha_convocatoria.xhtml?lang=es&urlSemantica=consell-de-governaprobada-la-subida-salarial-del-15--para-los-empleados-publicos-de-baleares
- BOE, Real Decreto-ley 14/2025 sobre retribuciones del sector público: https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-24445
- Calendario laboral Illes Balears 2026: https://www.illesbalears.cat/sites/calendarilaboral/es/aao_2026/
- Días especiales de atención continuada localizados en la tabla oficial IB-Salut 2025: 24, 25 y 31 de diciembre y 1 de enero.

Fecha de actualización: 14 de mayo de 2026.

No se ha localizado una tabla IB-Salut 2026 completa publicada para sustituir la tabla oficial 2025. La hora ordinaria para turnos parciales no se calcula con tarifa inventada: queda como campo manual editable.

## Criterio de cálculo

- El usuario selecciona el mes de nómina.
- Por defecto, la nómina incluye las guardias realizadas el mes anterior.
- Ejemplo: nómina de junio 2026 = fijo de junio + guardias de mayo 2026.
- La paga extra depende del mes de nómina: junio y diciembre.

## Datos

Los datos editables están al inicio de `app.js`:

- `salaryTables`
- `islandAllowance`
- `guardRates`
- `extraPayRules`
- `specialDays`
- `irpfSuggestions`
- `socialSecurityDefaults`

Si IB-Salut publica una tabla salarial completa 2026, actualizar esas constantes y mantener las fuentes en este README.

La logística de guardias se configura en `defaultHoursForGuard`: hospital, centro de salud y modo manual. El 31 de diciembre se fuerza a revisión por posible variabilidad de horas/tarifa.

## Publicación en GitHub Pages

La app funciona abriendo `index.html` o publicando desde GitHub Pages.

Pasos manuales si no queda activado automáticamente:

1. Ir a `Settings` del repositorio.
2. Abrir `Pages`.
3. En `Build and deployment`, elegir `Deploy from a branch`.
4. Seleccionar rama `main` y carpeta `/root`.
5. Guardar.

## Aviso

Estimador orientativo, no vinculante. No sustituye la nómina oficial ni la información de la unidad de nóminas.
