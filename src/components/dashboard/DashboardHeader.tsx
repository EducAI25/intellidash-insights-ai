import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, ArrowLeft, Settings } from 'lucide-react';

interface DashboardHeaderProps {
  dashboard: {
    id: string;
    title: string;
    description?: string;
  };
}

export function DashboardHeader({ dashboard }: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/boards')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            {dashboard.title}
          </h1>
          <p className="text-muted-foreground">{dashboard.description}</p>
        </div>
      </div>
      <Button variant="outline" onClick={() => navigate(`/dashboard/edit/${dashboard.id}`)}>
        <Settings className="h-4 w-4 mr-2" />
        Editar Dashboard
      </Button>
    </div>
  );
}