# Build de Produção - KalaCal

## Configurações Aplicadas

### API de Produção
- **URL Base**: https://kalacal-api-102830866843.us-central1.run.app
- **API Key Mobile**: mobile_kala_prod_f04e32235be9fc75e47bc1ba47b576c2

### Outras Chaves Disponíveis
- **Web API Key**: web_kala_prod_8bef4c863da99aaca188cd9056e849e9
- **Admin API Key**: admin_kala_prod_08a0d43050644a40842036a86fb3ef8f
- **External API Key**: external_kala_prod_23185e4ac05cc632b11bf4fc4fafd5f6

## Como Gerar o APK

### Método 1: Build na Nuvem (Recomendado)
```bash
npm run build-production
```
ou
```bash
eas build --platform android --profile production
```

### Método 2: Build Local (Linux/macOS apenas)
```bash
eas build --platform android --profile production --local --output ./builds/production/kalacal-production.apk
```

## Configurações do Build

O build de produção está configurado em `eas.json` com:
- **buildType**: apk (para gerar APK diretamente)
- **autoIncrement**: true (incrementa versão automaticamente)
- **Variáveis de ambiente**: API_URL e API_KEY configuradas

## Após o Build

1. O APK será disponibilizado no painel do Expo
2. Você receberá um link para download
3. O APK pode ser instalado diretamente em dispositivos Android
4. Para distribuição, considere usar Google Play Store ou distribuição interna

## Troubleshooting

- **Erro de owner**: Certifique-se que o owner no `app.config.ts` corresponde ao projeto EAS
- **Build local no Windows**: Use o build na nuvem, pois build local Android não é suportado no Windows
- **Variáveis de ambiente**: Estão configuradas diretamente no `eas.json` para o perfil de produção

