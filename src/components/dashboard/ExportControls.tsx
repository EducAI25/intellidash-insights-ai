import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileImage, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportControlsProps {
  dashboardTitle: string;
}

export function ExportControls({ dashboardTitle }: ExportControlsProps) {
  const { toast } = useToast();

  const exportToPDF = async () => {
    try {
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) {
        throw new Error('Dashboard não encontrado');
      }

      toast({
        title: "Gerando PDF...",
        description: "Aguarde enquanto o dashboard é convertido",
      });

      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${dashboardTitle || 'dashboard'}.pdf`);

      toast({
        title: "PDF exportado com sucesso!",
        description: "O arquivo foi salvo na pasta de downloads",
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  };

  const exportToPNG = async () => {
    try {
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) {
        throw new Error('Dashboard não encontrado');
      }

      toast({
        title: "Gerando PNG...",
        description: "Aguarde enquanto a imagem é criada",
      });

      const canvas = await html2canvas(dashboardElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${dashboardTitle || 'dashboard'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: "PNG exportado com sucesso!",
        description: "A imagem foi salva na pasta de downloads",
      });
    } catch (error) {
      console.error('Erro ao exportar PNG:', error);
      toast({
        title: "Erro ao exportar PNG",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Exportar Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Button onClick={exportToPDF} className="flex-1 bg-gradient-primary">
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={exportToPNG} variant="outline" className="flex-1">
            <FileImage className="h-4 w-4 mr-2" />
            Exportar PNG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}