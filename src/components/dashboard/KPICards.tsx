import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Package, DollarSign, Target, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface KPICardsProps {
  data: any[];
}

export function KPICards({ data }: KPICardsProps) {
  if (!data || data.length === 0) return null;

  // Análise automática dos dados
  const analytics = React.useMemo(() => {
    let totalProducts = 0;
    let totalStock = 0;
    let totalRevenue = 0;
    let totalCost = 0;
    let bestProduct = { name: '', revenue: 0 };

    data.forEach(item => {
      totalProducts++;
      
      // Detectar colunas de estoque
      const stockCol = Object.keys(item).find(key => 
        key.toLowerCase().includes('estoque') || 
        key.toLowerCase().includes('stock') ||
        key.toLowerCase().includes('quantidade')
      );
      if (stockCol && !isNaN(Number(item[stockCol]))) {
        totalStock += Number(item[stockCol]);
      }

      // Detectar colunas de venda/receita
      const revenueCol = Object.keys(item).find(key => 
        key.toLowerCase().includes('venda') || 
        key.toLowerCase().includes('receita') ||
        key.toLowerCase().includes('revenue')
      );
      if (revenueCol && !isNaN(Number(item[revenueCol]))) {
        const revenue = Number(item[revenueCol]);
        totalRevenue += revenue;
        
        // Encontrar melhor produto
        if (revenue > bestProduct.revenue) {
          const nameCol = Object.keys(item).find(key => 
            key.toLowerCase().includes('nome') || 
            key.toLowerCase().includes('produto') ||
            key.toLowerCase().includes('descrição') ||
            key.toLowerCase().includes('description')
          );
          bestProduct = {
            name: nameCol ? String(item[nameCol]).substring(0, 20) + '...' : 'Produto',
            revenue
          };
        }
      }

      // Detectar colunas de custo
      const costCol = Object.keys(item).find(key => 
        key.toLowerCase().includes('custo') || 
        key.toLowerCase().includes('cost')
      );
      if (costCol && !isNaN(Number(item[costCol]))) {
        totalCost += Number(item[costCol]);
      }
    });

    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      totalProducts,
      totalStock,
      totalRevenue,
      totalCost,
      profit,
      profitMargin,
      bestProduct
    };
  }, [data]);

  const kpiCards = [
    {
      title: 'Total de Produtos',
      value: analytics.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-gradient-primary',
      change: '+12%',
      isPositive: true
    },
    {
      title: 'Estoque Total',
      value: analytics.totalStock.toLocaleString(),
      icon: Target,
      color: 'bg-gradient-button',
      change: '+8%',
      isPositive: true
    },
    {
      title: 'Receita Total',
      value: `R$ ${analytics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-gradient-mirtilo',
      change: '+15%',
      isPositive: true
    },
    {
      title: 'Margem de Lucro',
      value: `${analytics.profitMargin.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-gradient-soft',
      textColor: 'text-primary-dark',
      change: analytics.profitMargin > 30 ? '+5%' : '-2%',
      isPositive: analytics.profitMargin > 30
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="relative overflow-hidden shadow-elegant hover:shadow-mirtilo transition-all duration-300">
            <CardContent className="p-6">
              <div className={`absolute top-0 right-0 w-20 h-20 ${kpi.color} opacity-10 rounded-full -translate-y-4 translate-x-4`}></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${kpi.color}`}>
                  <Icon className={`h-6 w-6 ${kpi.textColor || 'text-white'}`} />
                </div>
                <div className={`flex items-center text-sm ${kpi.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                  {kpi.isPositive ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
                  {kpi.change}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}