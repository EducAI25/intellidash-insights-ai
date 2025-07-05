-- Adicionar coluna user_id à tabela dashboard_data
ALTER TABLE public.dashboard_data 
ADD COLUMN user_id UUID;

-- Atualizar dados existentes com user_id baseado nos dashboards associados
UPDATE public.dashboard_data 
SET user_id = d.user_id 
FROM public.dashboards d 
WHERE dashboard_data.dashboard_id = d.id;

-- Para registros sem dashboard_id, deixar user_id como NULL por enquanto
-- (serão tratados no código)

-- Criar nova policy RLS que permite ver dados próprios mesmo sem dashboard_id
DROP POLICY IF EXISTS "Users can view their dashboard data" ON public.dashboard_data;

CREATE POLICY "Users can view their dashboard data" ON public.dashboard_data
FOR SELECT USING (
  -- Permitir se é o dono dos dados (pela coluna user_id)
  auth.uid() = user_id 
  OR
  -- OU se existe dashboard associado e é público/próprio
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_data.dashboard_id 
    AND (dashboards.user_id = auth.uid() OR dashboards.is_public = true)
  )
);

-- Atualizar policy de INSERT para definir user_id automaticamente
DROP POLICY IF EXISTS "Users can insert their dashboard data" ON public.dashboard_data;
DROP POLICY IF EXISTS "Allow insert for authtnticated users" ON public.dashboard_data;

CREATE POLICY "Users can insert their dashboard data" ON public.dashboard_data
FOR INSERT WITH CHECK (
  -- Permitir se está definindo o user_id como próprio
  auth.uid() = user_id
  OR
  -- OU se não há user_id mas existe dashboard próprio
  (user_id IS NULL AND EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_data.dashboard_id 
    AND dashboards.user_id = auth.uid()
  ))
);

-- Atualizar policy de UPDATE
DROP POLICY IF EXISTS "Users can update their dashboard data" ON public.dashboard_data;

CREATE POLICY "Users can update their dashboard data" ON public.dashboard_data
FOR UPDATE USING (
  -- Permitir se é o dono dos dados
  auth.uid() = user_id
  OR
  -- OU se existe dashboard próprio
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_data.dashboard_id 
    AND dashboards.user_id = auth.uid()
  )
);

-- Atualizar policy de DELETE  
DROP POLICY IF EXISTS "Users can delete their dashboard data" ON public.dashboard_data;

CREATE POLICY "Users can delete their dashboard data" ON public.dashboard_data
FOR DELETE USING (
  -- Permitir se é o dono dos dados
  auth.uid() = user_id
  OR
  -- OU se existe dashboard próprio
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_data.dashboard_id 
    AND dashboards.user_id = auth.uid()
  )
);

-- Limpar registros órfãos antigos sem upload_id
DELETE FROM public.dashboard_data 
WHERE upload_id IS NULL AND dashboard_id IS NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_dashboard_data_user_id ON public.dashboard_data(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_upload_user ON public.dashboard_data(upload_id, user_id);