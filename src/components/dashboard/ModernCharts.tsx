import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';

interface ModernChartsProps {
  data: any[];
}

const COLORS = ['hsl(221 83% 53%)', 'hsl(230 84% 27%)', 'hsl(221 100% 95%)', 'hsl(215.4 16.3% 46.9%)', 'hsl(0 84.2% 60.2%)'];

export function ModernCharts({ data }: ModernChartsProps) {
  if (!data || data.length === 0) return null;

  // Análise automática dos dados para gráficos
  const chartData = React.useMemo(() => {
    const processedData = data.slice(0, 8).map((item, index) => {
      const result: any = { index };
      
      // Encontrar nome/descrição
      const nameCol = Object.keys(item).find(key => 
        key.toLowerCase().includes('nome') || 
        key.toLowerCase().includes('produto') ||
        key.toLowerCase().includes('descrição') ||
        key.toLowerCase().includes('description')
      );
      result.name = nameCol ? String(item[nameCol]).substring(0, 15) + '...' : `Item ${index + 1}`;

      // Encontrar valores numéricos
      Object.keys(item).forEach(key => {
        const value = Number(item[key]);
        if (!isNaN(value) && value > 0) {
          if (key.toLowerCase().includes('venda') || key.toLowerCase().includes('receita')) {
            result.vendas = value;
          }
          if (key.toLowerCase().includes('custo') || key.toLowerCase().includes('cost')) {
            result.custo = value;
          }
          if (key.toLowerCase().includes('estoque') || key.toLowerCase().includes('quantidade')) {
            result.estoque = value;
          }
        }
      });

      return result;
    });

    return processedData.filter(item => item.vendas || item.custo || item.estoque);
  }, [data]);

  // Dados para gráfico de pizza (distribuição de vendas)
  const pieData = chartData.slice(0, 5).map(item => ({
    name: item.name,
    value: item.vendas || item.custo || item.estoque || 0
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Gráfico de Barras - Top Produtos */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Top Produtos por Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
                />
                <YAxis fontSize={12} tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214.3 31.8% 91.4%)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="vendas" fill="hsl(221 83% 53%)" name="Vendas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custo" fill="hsl(230 84% 27%)" name="Custo" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Distribuição */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Distribuição por Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Área - Comparação Custo vs Venda */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Custo vs Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
                />
                <YAxis fontSize={12} tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214.3 31.8% 91.4%)',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="vendas" 
                  stackId="1" 
                  stroke="hsl(221 83% 53%)" 
                  fill="hsl(221 83% 53% / 0.3)" 
                  name="Vendas"
                />
                <Area 
                  type="monotone" 
                  dataKey="custo" 
                  stackId="1" 
                  stroke="hsl(230 84% 27%)" 
                  fill="hsl(230 84% 27% / 0.3)" 
                  name="Custo"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Linha - Tendência de Estoque */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Níveis de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }}
                />
                <YAxis fontSize={12} tick={{ fill: 'hsl(215.4 16.3% 46.9%)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214.3 31.8% 91.4%)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="estoque" 
                  stroke="hsl(221 83% 53%)" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(221 83% 53%)', strokeWidth: 2, r: 6 }}
                  name="Estoque"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}