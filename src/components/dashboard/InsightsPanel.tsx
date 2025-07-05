import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, CheckCircle, TrendingUp, Package } from 'lucide-react';

interface InsightsPanelProps {
  data: any[];
}

export function InsightsPanel({ data }: InsightsPanelProps) {
  if (!data || data.length === 0) return null;

  // Gerar insights automáticos
  const insights = React.useMemo(() => {
    let lowStockItems = 0;
    let highProfitItems = 0;
    let totalItems = data.length;
    let avgProfit = 0;
    let bestPerformer = '';
    let alerts: string[] = [];

    data.forEach(item => {
      // Detectar itens com estoque baixo
      const stockCol = Object.keys(item).find(key => 
        key.toLowerCase().includes('estoque') || key.toLowerCase().includes('stock')
      );
      if (stockCol && Number(item[stockCol]) < 10) {
        lowStockItems++;
      }

      // Calcular margem de lucro
      const vendasCol = Object.keys(item).find(key => 
        key.toLowerCase().includes('venda') || key.toLowerCase().includes('receita')
      );
      const custoCol = Object.keys(item).find(key => 
        key.toLowerCase().includes('custo') || key.toLowerCase().includes('cost')
      );

      if (vendasCol && custoCol) {
        const vendas = Number(item[vendasCol]);
        const custo = Number(item[custoCol]);
        const profit = ((vendas - custo) / vendas) * 100;
        
        if (profit > 40) {
          highProfitItems++;
        }
        avgProfit += profit;

        // Melhor performer
        if (!bestPerformer || profit > avgProfit) {
          const nameCol = Object.keys(item).find(key => 
            key.toLowerCase().includes('nome') || key.toLowerCase().includes('produto')
          );
          if (nameCol) {
            bestPerformer = String(item[nameCol]).substring(0, 25);
          }
        }
      }
    });

    avgProfit = avgProfit / totalItems;

    // Gerar alertas
    if (lowStockItems > 0) {
      alerts.push(`${lowStockItems} produtos com estoque baixo`);
    }
    if (avgProfit < 20) {
      alerts.push('Margem de lucro média abaixo do ideal');
    }
    if (highProfitItems / totalItems > 0.7) {
      alerts.push('Ótima performance geral dos produtos');
    }

    return {
      lowStockItems,
      highProfitItems,
      totalItems,
      avgProfit,
      bestPerformer,
      alerts,
      stockHealth: ((totalItems - lowStockItems) / totalItems) * 100,
      profitHealth: Math.min(avgProfit * 2, 100)
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Insights Automáticos */}
      <Card className="lg:col-span-2 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Insights Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-soft rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary-dark" />
                  <span className="text-sm font-medium text-primary-dark">Performance</span>
                </div>
                <p className="text-2xl font-bold text-primary-dark">{insights.highProfitItems}</p>
                <p className="text-xs text-muted-foreground">produtos com alta margem</p>
              </div>

              <div className="p-4 bg-primary-soft rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Estoque</span>
                </div>
                <p className="text-2xl font-bold text-primary">{insights.totalItems - insights.lowStockItems}</p>
                <p className="text-xs text-primary/70">produtos bem estocados</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Saúde do Estoque</span>
                  <span>{insights.stockHealth.toFixed(0)}%</span>
                </div>
                <Progress value={insights.stockHealth} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Margem de Lucro Média</span>
                  <span>{insights.avgProfit.toFixed(1)}%</span>
                </div>
                <Progress value={insights.profitHealth} className="h-2" />
              </div>
            </div>

            {insights.bestPerformer && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Melhor Produto:</p>
                <p className="font-medium">{insights.bestPerformer}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Notificações */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.alerts.length > 0 ? (
              insights.alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                  {alert.includes('baixo') || alert.includes('abaixo') ? (
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm">{alert}</p>
                    <Badge 
                      variant={alert.includes('baixo') || alert.includes('abaixo') ? 'destructive' : 'default'}
                      className="mt-1 text-xs"
                    >
                      {alert.includes('baixo') || alert.includes('abaixo') ? 'Atenção' : 'Positivo'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Tudo funcionando bem!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}