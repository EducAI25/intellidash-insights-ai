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
            <div className="w-10 h-10 bg-gradient-primary rounded-xl mr-3"></div>
            <h1 className="text-2xl font-bold text-secondary">IntelliDash</h1>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-primary"
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
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Dashboards Inteligentes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Nossa IA converte automaticamente seus dados em visualizações premium, 
            insights acionáveis e análises preditivas. Design minimalista, segurança máxima.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary h-14 px-8"
              onClick={() => navigate('/auth')}
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8">
              Ver Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="shadow-elegant border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">IA Avançada</h3>
              <p className="text-muted-foreground">
                Integração com Gemini AI para análises inteligentes, 
                insights automáticos e previsões precisas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Visualizações Premium</h3>
              <p className="text-muted-foreground">
                Design minimalista e elegante com gráficos interativos 
                otimizados automaticamente pela IA
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Segurança Total</h3>
              <p className="text-muted-foreground">
                Criptografia ponta-a-ponta, compliance LGPD/GDPR 
                e controles administrativos avançados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-primary rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para Revolucionar Seus Dados?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empresas que já transformaram 
            planilhas estáticas em dashboards inteligentes
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 h-14 px-8"
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
