# Melo delivery — 2026-08-05

This folder is the downloadable project delivery accompanying the runnable Expo
application in the repository root.

## One-file download

- `Melo_Final_Package_2026.zip` — presentation files, bilingual reports,
  bilingual presenter script, QA summary, source teammate deck and clean app
  screenshots.

The same files are also available unpacked in `Melo_Final_Package_2026/` so they
can be reviewed directly on GitHub.

## Run the application

From the repository root:

```bash
npm install
npm run typecheck
npm test
npx expo-doctor
npx expo start
```

For Web, use `npm run web`; it starts Expo Web and the local loopback Provider
proxy together. Provider credentials are never included in this repository.

## Verified baseline

- TypeScript passed.
- 62/62 deterministic tests passed.
- Expo Doctor passed 18/18 checks.
- Web, iOS and Android production exports completed successfully.
- The downloadable package contains no API key.

Physical-device Provider behaviour still depends on the selected Provider
account, exact model, plan, region and current network.
