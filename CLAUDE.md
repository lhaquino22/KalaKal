# KalaCal — Guia de Desenvolvimento

## Visão Geral

Sistema de predição de risco de morte por Leishmaniose Visceral (Calazar) composto por:

- **Kala-Cal-API**: Backend Django REST Framework + XGBoost/SHAP
- **KalaKal**: Frontend React Native / Expo (mobile Android)

Repos separados: `lhaquino22/Kala-Cal-API` e `lhaquino22/KalaKal`

---

## Arquitetura

### Backend (Django)

| App | Responsabilidade |
|-----|-----------------|
| `authentication` | JWT (SimpleJWT), reset de senha, exclusão de conta |
| `casos` | CRUD de ocorrências (casos clínicos) |
| `kalacal_calculator` | Calculadora KalaCal original |
| `kcxapi2` | **iKalaCal** — explicabilidade SHAP, modelos XGBoost, imputação ANE |

### Frontend (Expo/React Native)

- `app/` — Rotas (Expo Router)
- `components/xai/` — Componentes de explicabilidade (formulários, resultados, painel)
- `hooks/` — Hooks customizados (`useExpandedExplainability`, etc.)
- `services/` — Comunicação com API
- `constants/modelsConfig.ts` — Configuração dos 17 campos e modelos

---

## Modelos XGBoost

### 4 Modelos Nomeados (Fase 1 — fast path)
- `xgboost_clinicas.joblib` — 3 features (Idademeses, edema, peso)
- `xgboost_aids.joblib` — 4 features (+aids)
- `xgboost_plaque.joblib` — 4 features (+plaque)
- `xgboost_completa.joblib` — 5 features (+aids, plaque)

### 2048 Modelos Combinatórios (Fase 2 — fallback)
- `xgb-0000` a `xgb-2047` cobrindo combinações de 11 features opcionais
- Base obrigatória: Idademeses, urina, faltadear, edema, peso, hemorragia
- Opcionais: aids, plaque, oliguria, peleadmiss, ast, pneumonia, sepse, plasma, venoclise, leuco, ira
- Seleção via bit-index em `ia.py:compute_combinatorial_model_filename()`

### Seleção de Modelo
1. Tenta modelos nomeados (match exato de features)
2. Se falhar, mapeia features API → nomes combo e calcula filename combinatório
3. Cria explainer SHAP on-the-fly para combinatórios

---

## Endpoints Principais (kcxapi2)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/xai/resultado/` | POST | Análise direta (dict genérico) |
| `/api/xai/resultado-completo/` | POST | Análise expandida (17 campos tipados, `modo: padrao\|assistido`) |
| `/api/xai/teste/` | GET | Health check |
| `/api/xai/debug-modelos/` | GET | Debug de modelos disponíveis |

### Modos de Análise
- **`padrao`**: usa apenas dados informados, sem imputação
- **`assistido`**: executa imputação ANE para estimar dados faltantes

---

## Deploy

### API → Google Cloud Run

**Pré-requisitos**: Google Cloud SDK instalado e autenticado

```bash
# Localização do gcloud no Windows
# C:\Users\luizm\google-cloud-sdk\bin\gcloud

# Configurações
# Projeto: kala-cal-api
# Região: us-central1
# Serviço: kalacal-api
# DB: Cloud SQL PostgreSQL 15 (kalacal-db)

# Deploy rápido (usa Dockerfile + Cloud Build)
cd Kala-Cal-API
gcloud run deploy kalacal-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DEBUG=False,DB_NAME=kalacal_prod,DB_USER=kalacal_user,DB_HOST=/cloudsql/kala-cal-api:us-central1:kalacal-db,DB_PORT=5432,ALLOWED_HOSTS=*" \
  --set-secrets "SECRET_KEY=django-secret-key:latest,DB_PASSWORD=db-password:latest,MOBILE_API_KEY=mobile-api-key:latest,WEB_API_KEY=web-api-key:latest,ADMIN_API_KEY=admin-api-key:latest,EXTERNAL_API_KEY=external-api-key:latest" \
  --add-cloudsql-instances kala-cal-api:us-central1:kalacal-db \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80

# URL de produção:
# https://kalacal-api-102830866843.us-central1.run.app

# Migrações são executadas automaticamente pelo entrypoint.sh
# Para deploy inicial completo, usar: ./deploy_gcloud.sh
```

### Frontend → APK via EAS Build

```bash
cd KalaKal

# APK de produção (linkado à API de produção)
npx eas-cli build --platform android --profile production

# APK de preview
npx eas-cli build --platform android --profile preview

# AAB para Google Play
npx eas-cli build --platform android --profile production-aab
```

**Variáveis de produção configuradas em `eas.json`**:
- `EXPO_PUBLIC_API_URL`: URL do Cloud Run
- `EXPO_PUBLIC_API_KEY`: chave de API mobile
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`: chave do Google Maps

---

## Desenvolvimento Local

### Backend
```bash
cd Kala-Cal-API
docker-compose up -d --build
docker-compose exec web python manage.py test kcxapi2.tests_ia -v2
```

### Frontend
```bash
cd KalaKal
npm install
npx expo start
```

---

## Testes

### Backend: 94+ testes em `kcxapi2/tests_ia.py`
```bash
docker-compose exec web python manage.py test kcxapi2.tests_ia -v2
docker-compose exec web python manage.py test kcxapi2 -v2   # todos
```

### Frontend
```bash
cd KalaKal && npm test
```

---

## Padrões e Convenções

- Autenticação: JWT (SimpleJWT) + API Key middleware
- Todos os endpoints exigem `IsAuthenticated` + header `X-API-KEY`
- Commits em português com prefixo conventional: `feat()`, `fix()`, `test()`
- Backend: Python 3.11, Django 5.2, DRF 3.15
- Frontend: React Native, Expo SDK, TypeScript
- Modelos ML: scikit-learn pipelines + XGBoost, SHAP para explicabilidade
