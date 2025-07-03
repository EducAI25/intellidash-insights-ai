-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de dashboards
CREATE TABLE public.dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de dados dos dashboards
CREATE TABLE public.dashboard_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  raw_data JSONB,
  processed_data JSONB,
  column_mappings JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de análises de IA
CREATE TABLE public.ai_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('insights', 'recommendations', 'anomalies', 'trends')),
  content JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de logs de atividade
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies para dashboards
CREATE POLICY "Users can view their own dashboards" ON public.dashboards
FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own dashboards" ON public.dashboards
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards" ON public.dashboards
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards" ON public.dashboards
FOR DELETE USING (auth.uid() = user_id);

-- Policies para dashboard_data
CREATE POLICY "Users can view their dashboard data" ON public.dashboard_data
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_data.dashboard_id 
    AND (dashboards.user_id = auth.uid() OR dashboards.is_public = true)
  )
);

CREATE POLICY "Users can insert their dashboard data" ON public.dashboard_data
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_data.dashboard_id 
    AND dashboards.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their dashboard data" ON public.dashboard_data
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_data.dashboard_id 
    AND dashboards.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their dashboard data" ON public.dashboard_data
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_data.dashboard_id 
    AND dashboards.user_id = auth.uid()
  )
);

-- Policies para ai_analyses
CREATE POLICY "Users can view AI analyses for their dashboards" ON public.ai_analyses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = ai_analyses.dashboard_id 
    AND (dashboards.user_id = auth.uid() OR dashboards.is_public = true)
  )
);

CREATE POLICY "Users can insert AI analyses for their dashboards" ON public.ai_analyses
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = ai_analyses.dashboard_id 
    AND dashboards.user_id = auth.uid()
  )
);

-- Policies para activity_logs
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" ON public.activity_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar storage bucket para arquivos
INSERT INTO storage.buckets (id, name, public) VALUES ('dashboard-files', 'dashboard-files', false);

-- Policies para storage
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'dashboard-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (bucket_id = 'dashboard-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (bucket_id = 'dashboard-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (bucket_id = 'dashboard-files' AND auth.uid()::text = (storage.foldername(name))[1]);