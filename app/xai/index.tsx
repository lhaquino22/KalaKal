import React, { useMemo, useState } from 'react';
import { Image, ScrollView, View, StyleSheet } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import KalaCalAPI from '@/services/KalaCalAPI';
import { ApiResponse, XaiResultadoResponse } from '@/services/types';
import { colors } from '@/commons';
import z from 'zod';

export default function XaiScreen() {
  const [id, setId] = useState<string>('1');
  const [dataNascimento, setDataNascimento] = useState<string>('15/12/1999');
  const [edema, setEdema] = useState<string>('true');
  const [peso, setPeso] = useState<string>('26.1');
  const [aids, setAids] = useState<string>('false');
  const [plaque, setPlaque] = useState<string>('4.8');

  const [loading, setLoading] = useState<boolean>(false);
  const [health, setHealth] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [resultado, setResultado] = useState<XaiResultadoResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const edemaBool = useMemo(() => edema.trim().toLowerCase() === 'true', [edema]);
  const aidsBool = useMemo(() => aids.trim().toLowerCase() === 'true', [aids]);

  const handleHealthcheck = async () => {
    setError('');
    setHealth('');
    try {
      const res = await KalaCalAPI.getXaiHealthcheck();
      if (res.success) {
        setHealth(res.data?.status || 'ok');
      } else {
        setError(res.error || 'Falha no healthcheck');
      }
    } catch (e) {
      setError('Erro inesperado no healthcheck');
    }
  };

  const handleEnviar = async () => {
    setLoading(true);
    setError('');
    setResultado(null);
    setFieldErrors({});
    try {
      const payload = {
        id: Number(id),
        data_nascimento: dataNascimento,
        edema: edemaBool,
        peso: Number(peso),
        aids: aidsBool,
        plaque: Number(plaque),
      };

      const schema = z.object({
        id: z.number().min(1, 'ID inválido'),
        data_nascimento: z
          .string()
          .min(8, 'Data obrigatória (dd/mm/aaaa)')
          .regex(/^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/, 'Formato dd/mm/aaaa ou aaaa-mm-dd'),
        edema: z.boolean(),
        peso: z.number().finite('Peso inválido'),
        aids: z.boolean(),
        plaque: z.number().finite('Plaque inválido'),
      });

      const parsed = schema.safeParse(payload);
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        parsed.error.issues.forEach((i) => {
          const k = i.path.join('.') || 'form';
          errs[k] = i.message;
        });
        setFieldErrors(errs);
        setLoading(false);
        return;
      }

      const res: ApiResponse<XaiResultadoResponse> = await KalaCalAPI.getXaiResultado(payload);
      if (res.success && res.data) {
        setResultado(res.data);
      } else {
        setError(res.error || 'Erro na predição');
      }
    } catch (e) {
      setError('Erro inesperado ao enviar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <VStack className="gap-6" style={styles.content}>
        <View style={styles.header}>
          <Text size="2xl" bold style={styles.title}>
            🧠 Explicabilidade IA
          </Text>
          <Text size="sm" style={styles.subtitle}>
            Análise preditiva com explicação visual dos fatores de risco
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Button 
            onPress={handleHealthcheck} 
            action="secondary" 
            variant="outline"
            style={styles.buttonSmall}
          >
            <ButtonText>🔍 Testar Conexão</ButtonText>
          </Button>
          {health ? (
            <View style={styles.successBadge}>
              <Text size="sm" style={styles.successText}>✅ {health}</Text>
            </View>
          ) : null}
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text size="sm" style={styles.errorText}>
              ⚠️ {error}
            </Text>
          </View>
        ) : null}

        <View className="gap-2">
          <Text size="sm">ID</Text>
          <Input>
            <InputField
              value={id}
              onChangeText={setId}
              keyboardType="numeric"
              placeholder="1"
            />
          </Input>
          {fieldErrors.id ? (
            <Text size="xs" className="text-error-600">{fieldErrors.id}</Text>
          ) : null}
        </View>

        <View className="gap-2">
          <Text size="sm">Data de Nascimento (dd/mm/aaaa)</Text>
          <Input>
            <InputField
              value={dataNascimento}
              onChangeText={setDataNascimento}
              placeholder="15/12/1999"
            />
          </Input>
          {fieldErrors.data_nascimento ? (
            <Text size="xs" className="text-error-600">{fieldErrors.data_nascimento}</Text>
          ) : null}
        </View>

        <View className="gap-2">
          <Text size="sm">Edema (true/false)</Text>
          <Input>
            <InputField value={edema} onChangeText={setEdema} placeholder="true" />
          </Input>
        </View>

        <View className="gap-2">
          <Text size="sm">Peso</Text>
          <Input>
            <InputField
              value={peso}
              onChangeText={setPeso}
              keyboardType="decimal-pad"
              placeholder="26.1"
            />
          </Input>
          {fieldErrors.peso ? (
            <Text size="xs" className="text-error-600">{fieldErrors.peso}</Text>
          ) : null}
        </View>

        <View className="gap-2">
          <Text size="sm">AIDS (true/false)</Text>
          <Input>
            <InputField value={aids} onChangeText={setAids} placeholder="false" />
          </Input>
        </View>

        <View className="gap-2">
          <Text size="sm">Plaque</Text>
          <Input>
            <InputField
              value={plaque}
              onChangeText={setPlaque}
              keyboardType="decimal-pad"
              placeholder="4.8"
            />
          </Input>
          {fieldErrors.plaque ? (
            <Text size="xs" className="text-error-600">{fieldErrors.plaque}</Text>
          ) : null}
        </View>

        <Button 
          onPress={handleEnviar} 
          disabled={loading}
          style={styles.primaryButton}
        >
          <ButtonText>
            {loading ? '⏳ Processando...' : '🚀 Gerar Explicação IA'}
          </ButtonText>
        </Button>

        {resultado?.imagem_base64 ? (
          <View style={styles.resultContainer}>
            <Text size="lg" bold style={styles.resultTitle}>
              📊 Resultado da Análise
            </Text>
            
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text size="xs" style={styles.metricLabel}>VALOR PREDITO</Text>
                <Text size="xl" bold style={styles.metricValue}>
                  {resultado.valor_predito.toFixed(2)}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text size="xs" style={styles.metricLabel}>MARGEM DE ERRO</Text>
                <Text size="xl" bold style={styles.metricValue}>
                  ±{resultado.erro_modelo.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text size="sm" bold style={styles.chartTitle}>
                🎯 Fatores de Influência (SHAP)
              </Text>
              <Image
                source={{ uri: resultado.imagem_base64 }}
                style={styles.chartImage}
              />
              <Text size="xs" style={styles.chartDescription}>
                🟢 Fatores que diminuem o risco | 🔴 Fatores que aumentam o risco
              </Text>
            </View>

            {resultado.variaveis && resultado.variaveis.length > 0 && (
              <View style={styles.variablesContainer}>
                <Text size="sm" bold style={styles.variablesTitle}>
                  📋 Variáveis Analisadas:
                </Text>
                <View style={styles.variablesList}>
                  {resultado.variaveis.map((variavel, index) => (
                    <View key={index} style={styles.variableBadge}>
                      <Text size="xs" style={styles.variableText}>{variavel}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : null}
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    color: colors.mainColor,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.secondaryColor,
    textAlign: 'center',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  buttonSmall: {
    flex: 1,
  },
  successBadge: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  successText: {
    color: 'white',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: colors.mainColor,
    marginVertical: 16,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultTitle: {
    color: colors.mainColor,
    textAlign: 'center',
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metricCard: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    minWidth: 100,
  },
  metricLabel: {
    color: '#64748b',
    fontWeight: '600',
  },
  metricValue: {
    color: colors.mainColor,
    marginTop: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chartTitle: {
    color: colors.secondaryColor,
    marginBottom: 8,
  },
  chartImage: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  chartDescription: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  variablesContainer: {
    marginTop: 16,
  },
  variablesTitle: {
    color: colors.secondaryColor,
    marginBottom: 8,
  },
  variablesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variableBadge: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    marginRight: 8,
  },
  variableText: {
    color: '#374151',
    fontWeight: '500',
  },
});


