# KalaCal

Mobile app that helps health professionals assess death risk in visceral
leishmaniasis (kala-azar) cases, and shows why the model reached each
prediction instead of returning a bare score.

React Native, Expo and TypeScript. The XGBoost models and their SHAP
explanations run behind a Django REST API kept in a separate repository.

## What the app does

**Risk analysis with explanations.** A 17-field clinical form feeds an XGBoost
ensemble. The result screen pairs the predicted risk with the SHAP contribution
of each field, so the professional can see which findings drove it.

**Two analysis modes.** `padrao` uses only what was actually recorded.
`assistido` runs ANE imputation to estimate missing values, and the interface
marks which fields were estimated rather than measured.

**Case management.** JWT authentication, CRUD for clinical occurrences, and
account recovery, password reset and account deletion flows.

**Care points map.** Georeferenced health units with coverage polygons.

**Reference content.** Material on leishmaniasis, the health promotion line and
the state confrontation plan.

## Stack

Expo Router for file-based routing, gluestack-ui over NativeWind and Tailwind
for the interface, zod for form schemas, axios for the API layer, Jest and
React Native Testing Library for the test suite.

## Running it

```bash
pnpm install
npx expo start
pnpm test
```

`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_KEY` and
`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` are validated at startup by `config/env.ts`
and have to be set before a build. Android builds go through EAS:

```bash
pnpm build-production      # APK
pnpm build-production-aab  # AAB for Google Play
```

## About this fork

Upstream is [miasK3011/KalaKal](https://github.com/miasK3011/KalaKal), by
Neemias Calebe.

What I contributed here: the explainability module (the unified 17-field form,
the multi-model panel and the ANE expanded analysis), the error handling
architecture (global Error Boundary, a centralized parser for API errors,
inline validation and a degradation banner), the Jest and Testing Library
suite, the account recovery and deletion flows, and the production build
configuration.
