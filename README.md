# ERP iWrc - Gestão de Fornecedores

Sistema interno desenvolvido para controle e gestão do fluxo de fornecedores, prospecção comercial, análise de logística, agendamento de coletas e pesagem de materiais.

## Tecnologias
- Next.js (App Router) + React
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL / Auth / Storage)
- Lucide React (Ícones)

## Como rodar o projeto

1. Instalar as dependências:
```bash
npm install
```

2. Configurar as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz (pode copiar do `.env.example`) com as credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

> **Obs:** Se rodar sem preencher o `.env.local`, o sistema entra automaticamente em modo mock (salva no localStorage do navegador com dados de teste para facilitar visualização offline/local).

3. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse em: `http://localhost:3000`

## Banco de Dados e Migrations (Supabase)

Os scripts SQL estão na pasta `supabase/`:
- `supabase/migrations/001_init_schema.sql`: Estrutura principal das tabelas, enums, triggers e RLS.
- `supabase/migrations/002_material_dispatch_and_security.sql`: Ajustes de saídas de materiais e segurança.
- `supabase/migrations/003_add_storage_provision_columns.sql`: Colunas operacionais adicionais.
- `supabase/seed.sql`: Dados iniciais de teste.
- `supabase/seed_sorocaba_fornecedores.sql`: Carga com lista de fornecedores da região de Sorocaba.

## Principais Módulos do Sistema
- **Dashboard**: Indicadores gerais e métricas de volume.
- **Fornecedores / Visão 360**: Cadastro completo, contatos, materiais, checklists operacionais, anexos e histórico.
- **Compras / Prospecção**: Kanban e funil comercial de qualificação de leads.
- **Logística**: Fila de avaliação de viabilidade técnica, frete e restrições de veículos.
- **Coletas**: Agendamento operacional e controle de status das retiradas.
- **Recebimentos / Balança**: Registro físico de pesagens líquidas na balança e baixa das coletas.
- **Saídas de Materiais**: Expedição e controle de estoque de recicláveis.
