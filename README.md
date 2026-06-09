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

- `Tablas retributivas_2026_ESP.pdf`, incluido en la raiz del repositorio.
- Fecha de las tablas usadas: 01-01-2026.
- Tabla IV: complemento de atencion continuada.
- Tabla VI: personal en formacion especializada, interno residente.
- Tabla VIII: indemnizacion por residencia.
- Calendario laboral Illes Balears 2026: https://www.illesbalears.cat/sites/calendarilaboral/es/aao_2026/

Fecha de actualizacion: 9 de junio de 2026.

La app usa datos 2026 oficiales del PDF para sueldo base, complemento de formacion, paga extraordinaria, guardias de residentes facultativos e indemnizacion por residencia. La hora ordinaria para turnos parciales no se calcula con tarifa inventada: queda como campo manual editable.

## Criterio de cálculo

- El usuario selecciona el mes de nómina.
- Por defecto, la nómina incluye las guardias realizadas el mes anterior.
- Ejemplo: nómina de junio 2026 = fijo de junio + guardias de mayo 2026.
- La paga extra depende del mes de nómina: junio y diciembre.
- La paga extra usa el importe especifico de la Tabla VI para cada año de residencia.
- Las guardias 5.ª y siguientes aplican el tramo oficial de personal facultativo en formación si el día no es especial.
- En días especiales se prioriza la tarifa especial de la Tabla IV sobre tarifa normal y sobre tarifa de 5.ª guardia y siguientes; la tabla no indica una combinacion separada.
- El resumen final puede imprimirse o guardarse como PDF con `Imprimir / PDF`; es orientativo y no oficial.
- Incluye icono local, favicon y manifest PWA sin logos oficiales.

## Datos

Los datos editables están al inicio de `app.js`:

- `salaryTables`
- `islandAllowance`
- `guardRates`
- `extraPayRules`
- `specialDays`
- `irpfSuggestions`
- `socialSecurityDefaults`

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
