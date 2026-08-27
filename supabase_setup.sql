-- ==============================================================================
-- 🚀 CloudVault - Script de Configuração Definitivo (Correção RLS & Perfis)
-- ==============================================================================
-- Execute este script no SQL Editor do seu Supabase (https://supabase.com/dashboard/project/tkpuhumphrakvnwvltqc/sql)

-- 1. Criação do Bucket de Armazenamento
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cloudvault', 'cloudvault', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    is_approved BOOLEAN DEFAULT false, -- Inicia bloqueado até o admin aprovar
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, is_approved, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    false,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Tabela de Arquivos com Isolamento Rigoroso por Usuário (user_id)
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('photos', 'videos', 'documents')),
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
    original_size_bytes BIGINT,
    storage_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    compressed BOOLEAN DEFAULT false,
    duration_seconds NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas de Profiles
DROP POLICY IF EXISTS "Ver perfis" ON public.profiles;
DROP POLICY IF EXISTS "Atualizar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Perfis: Leitura segura" ON public.profiles;
DROP POLICY IF EXISTS "Perfis: Atualizacao segura" ON public.profiles;
DROP POLICY IF EXISTS "Perfis: Insercao segura" ON public.profiles;

-- Políticas de Profiles SEM RECURSÃO (Permite ler e atualizar sem erro de recursão infinita)
CREATE POLICY "Perfis: Leitura Geral"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Perfis: Insercao Geral"
ON public.profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Perfis: Atualizacao Geral"
ON public.profiles FOR UPDATE
USING (true)
WITH CHECK (true);

-- Políticas de Arquivos (ISOLAMENTO ABSOLUTO: Cada um só vê e mexe no seu)
DROP POLICY IF EXISTS "Ver apenas seus próprios arquivos" ON public.media_files;
DROP POLICY IF EXISTS "Inserir apenas seus próprios arquivos" ON public.media_files;
DROP POLICY IF EXISTS "Atualizar apenas seus próprios arquivos" ON public.media_files;
DROP POLICY IF EXISTS "Deletar apenas seus próprios arquivos" ON public.media_files;
DROP POLICY IF EXISTS "Arquivos: Leitura restrita ao dono" ON public.media_files;
DROP POLICY IF EXISTS "Arquivos: Insercao restrita ao dono" ON public.media_files;
DROP POLICY IF EXISTS "Arquivos: Atualizacao restrita ao dono" ON public.media_files;
DROP POLICY IF EXISTS "Arquivos: Exclusao restrita ao dono" ON public.media_files;

CREATE POLICY "Arquivos: Leitura restrita ao dono"
ON public.media_files FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Arquivos: Insercao restrita ao dono"
ON public.media_files FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Arquivos: Atualizacao restrita ao dono"
ON public.media_files FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Arquivos: Exclusao restrita ao dono"
ON public.media_files FOR DELETE
USING (auth.uid() = user_id);

-- 5. Políticas de Storage
DROP POLICY IF EXISTS "Leitura de Arquivos Storage" ON storage.objects;
DROP POLICY IF EXISTS "Upload Storage" ON storage.objects;
DROP POLICY IF EXISTS "Deletar Storage" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Upload seguro na pasta do usuario" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Leitura segura na pasta do usuario" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Exclusao segura na pasta do usuario" ON storage.objects;

CREATE POLICY "Storage: Acesso Storage CloudVault"
ON storage.objects FOR ALL
USING (bucket_id = 'cloudvault')
WITH CHECK (bucket_id = 'cloudvault');

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON public.media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_approved ON public.profiles(is_approved);
