import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { EXPANDED_FIELDS } from '@/constants/modelsConfig';

interface ImputationResultCardProps {
  camposInformados: Record<string, any>;
  camposImputados: Record<string, any>;
}

function getFieldLabel(key: string): string {
  const field = EXPANDED_FIELDS.find(f => f.key === key);
  return field?.label || key;
}

function formatValue(key: string, value: any): string {
  if (value === null || value === undefined) return '-';
  const field = EXPANDED_FIELDS.find(f => f.key === key);
  if (field?.type === 'boolean' || typeof value === 'boolean') {
    if (value === true || value === 1) return 'Sim';
    if (value === false || value === 0) return 'Não';
    return 'Ignorado';
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  }
  return String(value);
}

const ImputationResultCard: React.FC<ImputationResultCardProps> = ({
  camposInformados,
  camposImputados,
}) => {
  const hasImputedFields = Object.keys(camposImputados).length > 0;

  if (!hasImputedFields) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text size="md" bold style={styles.title}>
          Dados Complementados por IA
        </Text>
        <Text size="xs" style={styles.subtitle}>
          Os campos abaixo foram estimados pelo modelo de imputação
        </Text>
      </View>

      <View style={styles.table}>
        {/* Header da tabela */}
        <View style={styles.tableRow}>
          <Text size="xs" bold style={[styles.tableCell, styles.tableCellHeader, styles.cellField]}>
            Campo
          </Text>
          <Text size="xs" bold style={[styles.tableCell, styles.tableCellHeader, styles.cellValue]}>
            Valor Estimado
          </Text>
        </View>

        {/* Campos imputados */}
        {Object.entries(camposImputados).map(([key, value]) => (
          <View key={key} style={styles.tableRow}>
            <View style={[styles.tableCell, styles.cellField]}>
              <View style={styles.fieldNameRow}>
                <View style={styles.aiTag}>
                  <Text style={styles.aiTagText}>IA</Text>
                </View>
                <Text size="sm" style={styles.fieldName}>
                  {getFieldLabel(key)}
                </Text>
              </View>
            </View>
            <Text size="sm" bold style={[styles.tableCell, styles.cellValue, styles.imputedValue]}>
              {formatValue(key, value)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.disclaimer}>
        <Text size="xs" style={styles.disclaimerText}>
          Valores estimados com base em dados estatísticos. Revise os resultados com atenção clínica.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEFCE8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  title: { color: '#92400E' },
  subtitle: { color: '#A16207', marginTop: 4 },
  table: { padding: 12 },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
    alignItems: 'center',
  },
  tableCell: { paddingHorizontal: 4 },
  tableCellHeader: { paddingBottom: 8 },
  cellField: { flex: 2 },
  cellValue: { flex: 1, textAlign: 'right' },
  fieldNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldName: { color: '#374151' },
  aiTag: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  aiTagText: { color: 'white', fontSize: 9, fontWeight: '700' },
  imputedValue: { color: '#6366F1' },
  disclaimer: {
    backgroundColor: '#FEF9C3',
    padding: 12,
  },
  disclaimerText: { color: '#A16207', textAlign: 'center', lineHeight: 16 },
});

export default ImputationResultCard;
