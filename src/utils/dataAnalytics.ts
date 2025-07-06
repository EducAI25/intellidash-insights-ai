/**
 * Utilitários para análise precisa de dados
 */

export interface ColumnAnalysis {
  type: 'numeric' | 'text' | 'currency' | 'percentage' | 'date' | 'boolean';
  isId: boolean;
  samples: any[];
  confidence: number;
}

export interface DataInsights {
  totalRecords: number;
  numericColumns: string[];
  textColumns: string[];
  currencyColumns: string[];
  insights: string[];
  quality: number;
}

/**
 * Analisa o tipo de uma coluna baseado nos dados
 */
export function analyzeColumn(columnName: string, values: any[]): ColumnAnalysis {
  const cleanValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (cleanValues.length === 0) {
    return { type: 'text', isId: false, samples: [], confidence: 0 };
  }

  const samples = cleanValues.slice(0, 10);
  const columnLower = columnName.toLowerCase();
  
  // Verificar se é ID
  const isId = columnLower.includes('id') || 
              columnLower.includes('codigo') || 
              columnLower.includes('code');

  // Verificar tipos
  const numericCount = cleanValues.filter(v => !isNaN(Number(v)) && isFinite(Number(v))).length;
  const numericRatio = numericCount / cleanValues.length;

  // Detectar moeda
  const currencyKeywords = ['valor', 'preço', 'price', 'cost', 'custo', 'venda', 'receita'];
  const isCurrency = currencyKeywords.some(keyword => columnLower.includes(keyword));

  // Detectar porcentagem
  const hasPercentageSymbol = cleanValues.some(v => String(v).includes('%'));
  const isPercentage = hasPercentageSymbol || columnLower.includes('percent') || columnLower.includes('pct');

  // Detectar data
  const dateCount = cleanValues.filter(v => !isNaN(Date.parse(String(v)))).length;
  const isDate = dateCount / cleanValues.length > 0.5;

  // Detectar booleano
  const booleanValues = ['true', 'false', 'sim', 'não', 'yes', 'no', '1', '0'];
  const isBooleanLike = cleanValues.every(v => 
    booleanValues.includes(String(v).toLowerCase())
  );

  let type: ColumnAnalysis['type'] = 'text';
  let confidence = 0;

  if (isBooleanLike) {
    type = 'boolean';
    confidence = 0.9;
  } else if (isDate) {
    type = 'date';
    confidence = 0.8;
  } else if (numericRatio > 0.8) {
    if (isPercentage) {
      type = 'percentage';
      confidence = 0.9;
    } else if (isCurrency) {
      type = 'currency';
      confidence = 0.9;
    } else {
      type = 'numeric';
      confidence = numericRatio;
    }
  } else {
    type = 'text';
    confidence = 1 - numericRatio;
  }

  return {
    type,
    isId,
    samples,
    confidence
  };
}

/**
 * Gera insights inteligentes sobre o dataset
 */
export function generateDataInsights(data: any[]): DataInsights {
  if (!data || data.length === 0) {
    return {
      totalRecords: 0,
      numericColumns: [],
      textColumns: [],
      currencyColumns: [],
      insights: ['Nenhum dado disponível para análise'],
      quality: 0
    };
  }

  const columns = Object.keys(data[0]);
  const analyses = columns.map(col => ({
    name: col,
    analysis: analyzeColumn(col, data.map(row => row[col]))
  }));

  const numericColumns = analyses
    .filter(a => a.analysis.type === 'numeric' && !a.analysis.isId && a.analysis.confidence > 0.7)
    .map(a => a.name);

  const currencyColumns = analyses
    .filter(a => a.analysis.type === 'currency' && a.analysis.confidence > 0.7)
    .map(a => a.name);

  const textColumns = analyses
    .filter(a => a.analysis.type === 'text' && !a.analysis.isId)
    .map(a => a.name);

  // Calcular qualidade dos dados
  const qualityScore = analyses.reduce((acc, a) => acc + a.analysis.confidence, 0) / analyses.length;

  // Gerar insights
  const insights: string[] = [];
  
  insights.push(`Dataset contém ${data.length.toLocaleString('pt-BR')} registros com ${columns.length} colunas`);
  
  if (numericColumns.length > 0) {
    insights.push(`${numericColumns.length} colunas numéricas identificadas para análise estatística`);
  }
  
  if (currencyColumns.length > 0) {
    insights.push(`${currencyColumns.length} colunas monetárias detectadas`);
  }

  // Detectar dados faltantes
  const missingDataRatio = columns.reduce((acc, col) => {
    const missing = data.filter(row => !row[col] || row[col] === '').length;
    return acc + (missing / data.length);
  }, 0) / columns.length;

  if (missingDataRatio > 0.1) {
    insights.push(`Atenção: ${(missingDataRatio * 100).toFixed(1)}% dos dados estão faltando`);
  }

  // Detectar outliers em colunas numéricas
  numericColumns.forEach(col => {
    const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
    if (values.length > 0) {
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const outliers = values.filter(v => v < (q1 - 1.5 * iqr) || v > (q3 + 1.5 * iqr));
      
      if (outliers.length > values.length * 0.05) {
        insights.push(`Coluna "${col}" contém ${outliers.length} valores atípicos`);
      }
    }
  });

  return {
    totalRecords: data.length,
    numericColumns,
    textColumns,
    currencyColumns,
    insights,
    quality: Math.round(qualityScore * 100)
  };
}

/**
 * Calcula estatísticas avançadas para uma coluna numérica
 */
export function calculateAdvancedStats(values: number[]) {
  const cleanValues = values.filter(v => !isNaN(v) && isFinite(v));
  
  if (cleanValues.length === 0) {
    return null;
  }

  const sorted = [...cleanValues].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  
  // Mediana
  const median = n % 2 === 0 
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  // Quartis
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  
  // Desvio padrão
  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return {
    count: n,
    sum,
    mean,
    median,
    min: sorted[0],
    max: sorted[n - 1],
    q1,
    q3,
    iqr: q3 - q1,
    stdDev,
    variance,
    range: sorted[n - 1] - sorted[0]
  };
}