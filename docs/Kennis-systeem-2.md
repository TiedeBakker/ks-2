// docs/Kennis-systeem-2.md
# Kennis-systeem met twee databases
Bij de verdere ontwikkeling van mijn kennissysteem wil ik gebruik maken van een webApp met twee databases. Omdat een deel van de informatie vertrouwelijk is komt dat deel alleen in een database op de eigen werk-PC, terwijl publieke informatie in de web-omgeving (Turso) beschikbaar is. In eerste instantie gaat het om de systematiek van data-opslag en -ontsluiting.
# Hoofdlijnen.
Ik wil met een uitgekristalliseerde databasestructuur een volgende versie van mijn kennissysteem bouwen. Essentie is dat kennis wordt vastgelegd in objecten, relaties tussen objecten en parameterwaarden voor objecten en relaties.
Het kennissysteem bevat én publieke kennis/informatie (opgeslagen in een Turso-database) én vertrouwelijke kennis/informatie (opgeslagen in een lokale SQLite-database). Het kennissysteem wordt als webapp ontwikkeld en wordt gepubliceerd via Vercel. De gebruikersinterface is grotendeels op alle platforms gericht (smartphone, tablet, PC), maar voor specifieke modules is het acceptabel dat die alleen in een PC-omgeving goed te gebruiken zijn. Dit zal met name om presentatie/analyse gaan.
Er wordt zoveel mogelijk gewerkt met UUIDv7 als identifier en extra tabellen t.b.v. UI/UX zijn toegestaan.

De basisstructuur van de applicatie is een modulair menu; naast productie-modules zijn testmodules een optie.
Binnen het publieke deel bestaan alleen relaties tussen publieke objecten en zijn parameterwaarden alleen aan publieke objecten en publieke relaties gekoppeld. Bij het aanmaken van nieuwe objecten wordt de keuze publiek/afgeschermd gemaakt. Nieuwe relaties zijn afgeschermd als tenminste één van de objecten afgeschermd, anders bestaat de keuze. Bij parameterwaarden wordt vergelijkbaar gecontroleerd. Overigens is de verwachting dat er afgeschermde modules zijn, waarbinnen alleen afgeschermde objecten en relaties worden toegevoegd.
# Modules
## Centrale module
Omdat er een vrij eenduidige kennisstructuur ligt wordt als eerste module een beheermodule gebouwd, waarin een bestaand of toe te voegen object als vertrekpunt wordt gekozen. Dit gekozen object wordt getoond met aan de bovenkant ingaande objecten (in de relatiewaarden-tabel: source) en aan de onderkant met uitgaande objecten (target). Vaak is er maar één ingaand object, in dat geval wordt de objecten-lijn doorgezet tot er een splitsing komt. Bij een splitsing wordt bij elk object in de splitsing aangegeven of het een eindpunt is of dat de lijn nog langer kan worden doorgetrokken. Bij de uitgaande projecten wordt dit principe ook gehanteerd.
Van het gekozen object kunnen alle parameter-waarden en details van relaties worden getoond in een venster. Ook kunnen aan dit object nieuwe relaties en nieuwe parameterwaarden worden gekoppeld en kunnen labels, tijdsaanduidingen e.d. worden aangepast.

Door één van de andere zichtbare objecten te selecteren kan dat in gekozen object veranderen.

## Tweede module
Moet nog worden ingevuld

## Tijdelijke ontwikkel/test-module
Moet nog worden ingevuld

# Technisch
We gaan zoveel mogelijk werken met generieke functies die door meerdere modules gebruikt kunnen worden (deze komen per categrie in een core/) en module-specifieke functies die samen met de module-layout in modules/module_1/ terug te vinden zijn, zodat een module als geheel vervangen kan worden.

## Opzet omgeving
New Terminal:
- npx create-next-app@latest .
- npm install @libsql/client drizzle-orm dotenv
- npm install -D drizzle-kit

### Koppeling GitHub
- maak op GitHub nieuwe repository aan ks-2

## Structuur
K-S-2
    docs
    app
    db
        schema
            schema.ts


                     ┌──────────────────────────────┐
                     │     Hybride Client / DB      │
                     │    (src/core/db/client.ts)   │
                     └──────────────┬───────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────┐                          ┌─────────────────────┐
│    Turso Client     │                          │  Lokale DB Client   │
│  (Publieke Cloud)   │                          │ (SQLite op je PC)   │
└─────────────────────┘                          └─────────────────────┘