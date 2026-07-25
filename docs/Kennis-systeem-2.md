// docs/Kennis-systeem-2.md
# Kennis-systeem met twee databases
Bij de verdere ontwikkeling van mijn kennissysteem wil ik gebruik maken van een webApp met twee databases. Omdat een deel van de informatie vertrouwelijk is komt dat deel alleen in een database op de eigen werk-PC, terwijl publieke informatie in de web-omgeving (Turso) beschikbaar is. In eerste instantie gaat het om de systematiek van data-opslag en -ontsluiting.
# Technisch
## Opzet omgeving
New Terminal:
- npx create-next-app@latest .
- npm install @libsql/client drizzle-orm dotenv