import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload as UploadIcon, CheckCircle } from 'lucide-react';
import { FileUpload } from '@/components/upload/FileUpload';
import { DashboardCreator } from '@/components/dashboard/DashboardCreator';
import { useDashboardLimits } from '@/hooks/useDashboardLimits';
import { UserLayout } from '@/components/layout/UserLayout';
import { useToast } from '@/hooks/use-toast';

interface Sheet {
  name: string;
  data: any[];
  preview: string[];
}

export default function Upload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stats, checkCanCreate } = useDashboardLimits();
  const [uploadData, setUploadData] = useState<{
    data: any[];
    filename: string;
    uploadId: string;
    sheets?: Sheet[];
  } | null>(null);
  const [step, setStep] = useState<'upload' | 'create'>('upload');

  const handleDataProcessed = (data: any[], filename: string, uploadId: string, sheets?: Sheet[]) => {
    setUploadData({ data, filename, uploadId, sheets });
    setStep('create');
  };

  const handleDashboardCreated = (dashboardId: string) => {
    toast({
      title: 'Dashboard criado com sucesso!',
      description: 'Redirecionando para visualização...',
    });
    navigate(`/dashboard/view/${dashboardId}`);
  };

  const handleBack = () => {
    if (step === 'create') {
      setStep('upload');
      setUploadData(null);
    } else {
      navigate('/dashboard');
    }
  };

  // Verificar limites antes de permitir upload
  const { canCreate, message } = checkCanCreate();
  
  if (!canCreate && message) {
    return (
      <UserLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Upload de Dados</h1>
              <p className="text-muted-foreground">
                Faça upload da sua planilha para criar um dashboard
              </p>
            </div>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <UploadIcon className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Limite Atingido</h3>
                  <p className="text-red-700">{message}</p>
                </div>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Voltar
                  </Button>
                  <Button variant="default">
                    Fazer Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 'create' ? 'Voltar ao Upload' : 'Voltar'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {step === 'upload' ? 'Upload de Dados' : 'Criar Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'upload' 
                ? 'Faça upload da sua planilha para começar'
                : 'Configure seu novo dashboard'
              }
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary' : 'text-green-600'}`}>
            {step === 'create' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs text-white font-bold">1</span>
              </div>
            )}
            <span className="font-medium">Upload de Arquivo</span>
          </div>
          <div className={`h-px flex-1 ${step === 'create' ? 'bg-green-600' : 'bg-border'}`} />
          <div className={`flex items-center gap-2 ${step === 'create' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              step === 'create' ? 'bg-primary' : 'bg-border'
            }`}>
              <span className={`text-xs font-bold ${step === 'create' ? 'text-white' : 'text-muted-foreground'}`}>2</span>
            </div>
            <span className="font-medium">Criar Dashboard</span>
          </div>
        </div>

        {/* Stats Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Seu Plano Atual</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.activeDashboards} de {stats.dashboardLimit} dashboards utilizados
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{stats.availableDashboards}</div>
                <div className="text-sm text-muted-foreground">disponíveis</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {step === 'upload' ? (
          <FileUpload onDataProcessed={handleDataProcessed} />
        ) : uploadData ? (
          <DashboardCreator
            data={uploadData.data}
            filename={uploadData.filename}
            uploadId={uploadData.uploadId}
            columnMappings={{}}
            filterColumns={Object.keys(uploadData.data[0] || {})}
            onDashboardCreated={handleDashboardCreated}
          />
        ) : null}
      </div>
    </UserLayout>
  );
}