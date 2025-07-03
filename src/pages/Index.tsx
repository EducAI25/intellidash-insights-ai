// Update this page (the content is just a fallback if you fail to update the page)

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, Brain, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-mirtilo rounded-2xl mr-3 flex items-center justify-center shadow-mirtilo">
              <div className="w-7 h-7 bg-white rounded-full relative">
                <div className="absolute inset-1.5 bg-gradient-mirtilo rounded-full"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-secondary">Mirtilo</h1>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            variant="mirtilo"
            className="px-6 py-2"
          >
            Fazer Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-secondary mb-6">
            Transforme Planilhas em
            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent"> Dashboards Inteligentes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            O Mirtilo converte automaticamente seus dados em visualizações premium, 
            insights acionáveis e análises preditivas. Design minimalista, segurança máxima.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              variant="mirtilo"
              className="h-14 px-8"
              onClick={() => navigate('/auth')}
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 border-primary text-primary hover:bg-primary-soft">
              Ver Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="shadow-mirtilo border-0 hover:shadow-premium transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-mirtilo rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-mirtilo">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-secondary">IA Avançada</h3>
              <p className="text-muted-foreground">
                Integração com Gemini AI para análises inteligentes, 
                insights automáticos e previsões precisas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-mirtilo border-0 hover:shadow-premium transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-mirtilo rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-mirtilo">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-secondary">Visualizações Premium</h3>
              <p className="text-muted-foreground">
                Design minimalista e elegante com gráficos interativos 
                otimizados automaticamente pela IA
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-mirtilo border-0 hover:shadow-premium transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-mirtilo rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-mirtilo">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-secondary">Segurança Total</h3>
              <p className="text-muted-foreground">
                Criptografia ponta-a-ponta, compliance LGPD/GDPR 
                e controles administrativos avançados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-mirtilo rounded-3xl p-12 text-center text-white shadow-mirtilo">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para Revolucionar Seus Dados?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empresas que já transformaram 
            planilhas estáticas em dashboards inteligentes
          </p>
          <Button 
            size="lg" 
            className="bg-white text-secondary hover:bg-primary-soft h-14 px-8 shadow-elegant"
            onClick={() => navigate('/auth')}
          >
            <Zap className="mr-2 h-5 w-5" />
            Começar Gratuitamente
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
