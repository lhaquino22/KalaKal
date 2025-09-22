import React, { useMemo, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import KalaCalAPI from '@/services/KalaCalAPI';
import { ApiResponse, XaiResultadoResponse } from '@/services/types';
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
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <VStack className="gap-4">
        <Text size="xl" bold>
          XAI - Explicabilidade
        </Text>

        <Button onPress={handleHealthcheck} action="secondary" variant="outline">
          <ButtonText>Testar Healthcheck</ButtonText>
        </Button>
        {health ? (
          <Text size="sm">Status: {health}</Text>
        ) : null}

        {error ? (
          <Text size="sm" className="text-error-600">
            {error}
          </Text>
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

        <Button onPress={handleEnviar} disabled={loading}>
          <ButtonText>{loading ? 'Enviando...' : 'Gerar Explicação'}</ButtonText>
        </Button>

        {resultado?.imagem_base64 ? (
          <View className="mt-4 items-center">
            <Image
              source={{ uri: resultado.imagem_base64 }}
              style={{ width: 320, height: 200, resizeMode: 'contain' }}
            />
            <Text size="sm" className="mt-2">
              Valor predito: {resultado.valor_predito.toFixed(2)} (erro: {resultado.erro_modelo.toFixed(2)})
            </Text>
          </View>
        ) : null}
      </VStack>
    </ScrollView>
  );
}


