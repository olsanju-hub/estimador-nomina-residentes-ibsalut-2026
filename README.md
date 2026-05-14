# Estimador nómina residentes IB-Salut 2026

App web estática para estimar la nómina mensual de residentes del IB-Salut. Funciona con HTML, CSS y JavaScript vanilla, sin backend ni paso de compilación.

## Alcance

Solo personal sanitario en formación/residentes del IB-Salut:

- MIR/FIR/BIR/QIR/PIR y otros facultativos en formación que usen la misma tabla.
- EIR queda desactivado hasta confirmar datos oficiales 2026 específicos.
- No incluye adjuntos, estatutarios fijos, eventuales no residentes ni otras categorías.

## Fuentes oficiales consultadas

- IB-Salut, tablas salariales oficiales actualizadas a 2025: https://www.ibsalut.es/es/profesionales/recursos-humanos/tablas-salariales
- PDF oficial IB-Salut 2025: https://www.ibsalut.es/docs/rrhh/normativa/instrucciones%20y%20circulares/es/2025%20Tabla%20salarial%20personal%20estatutario%20CAST.pdf
- BOIB núm. 010, 20/01/2026, acuerdo de insularidad para personal estatutario IB-Salut: https://www.caib.es/eboibfront/es/2026/12221/710965/acuerdo-del-consejo-de-gobierno-de-16-de-enero-de-
- CAIB, subida salarial 2026 del 1,5% para empleados públicos: https://www.caib.es/pidip2front/ficha_convocatoria.xhtml?lang=es&urlSemantica=consell-de-governaprobada-la-subida-salarial-del-15--para-los-empleados-publicos-de-baleares
- BOE, Real Decreto-ley 14/2025 sobre retribuciones del sector público: https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-24445
- Calendario laboral Illes Balears 2026: https://www.illesbalears.cat/sites/calendarilaboral/es/aao_2026/

Fecha de actualización: 14 de mayo de 2026.

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
