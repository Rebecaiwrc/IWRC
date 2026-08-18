# ERP Interno iWrc - Gestão de Fornecedores (MVP)

Este é o MVP do ERP Interno da **iWrc**, desenvolvido para substituir o acompanhamento manual de planilhas por um sistema estruturado, rastreável e escalável. O foco principal é gerenciar toda a jornada inicial do fornecedor/gerador de resíduos recicláveis, conectando o comercial/prospecção com a análise de viabilidade logística e pesagem em balança.

---

## 🚀 Tecnologias Utilizadas (Stack)
* **Core**: Next.js 14+ (App Router) & React 18+
* **Linguagem**: TypeScript (Strict Mode)
* **Estilização**: Tailwind CSS (Vanilla CSS com classes utilitárias)
* **Banco de Dados**: PostgreSQL (Supabase)
* **Autenticação**: Supabase Auth (com fallback local no MVP)
* **Icons**: Lucide React

---

## 🛠️ Arquitetura Híbrida (Dual-Mode Client)
Para permitir testes locais instantâneos e offline sem barreiras de setup inicial (como a criação imediata de um banco de dados no Supabase), o sistema possui uma arquitetura de banco **Dual-Mode**:
* **Modo Mock / LocalStorage**: Se as variáveis do Supabase no arquivo `.env.local` estiverem vazias ou ausentes, o ERP rodará localmente, armazenando os dados no `localStorage` do navegador e autosemeando-se com dados fictícios estruturados de teste.
* **Modo Supabase / PostgreSQL**: Assim que as variáveis de ambiente forem configuradas, o sistema comutará automaticamente para o Supabase, fazendo queries reais no banco relacional PostgreSQL.

---

## 📋 Pré-requisitos
* Node.js v18 ou superior.
* Gerenciador de pacotes npm (já instalado com o Node).

---

## ⚙️ Instalação e Configuração

1. Clone o projeto para o seu ambiente local.
2. Na pasta raiz, instale as dependências executando:
   ```bash
   npm install
   ```

### Configurando o Supabase (Opcional para Produção)
Se desejar conectar a um banco relacional do Supabase em nuvem, siga estes passos:
1. Crie um projeto gratuito no [Supabase](https://supabase.com/).
2. Acesse o SQL Editor no painel do Supabase e cole o conteúdo do arquivo de migração:
   * [001_init_schema.sql](file:///supabase/migrations/001_init_schema.sql) (Localizado na pasta `/supabase/migrations/`).
3. Para preencher o banco com dados de semente fictícios para teste, cole no SQL Editor o arquivo:
   * [seed.sql](file:///supabase/seed.sql) (Localizado na pasta `/supabase/`).
4. Renomeie o arquivo `.env.example` para `.env.local` na raiz do projeto e preencha com as credenciais da API do seu projeto (encontradas em *Project Settings -> API* no painel do Supabase):
   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-anon-publica
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
   ```

---

## 💻 Execução Local

Para iniciar o servidor de desenvolvimento local do Next.js, execute:
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador para acessar o sistema.

---

## 🧪 Como Testar o Fluxo (Passo a Passo)

### 1. Login Inteligente (Mock Mode)
Caso não tenha preenchido o `.env.local`, a tela de login apresentará 3 contas de teste com diferentes permissões. Clique em qualquer uma delas para entrar:
* **Carlos Comercial (Comprador)**: Focado em captar leads, registrar interações, adicionar materiais e gerenciar o Kanban de prospecção.
* **Lucas Logística (Logística)**: Focado na fila de análise de frete/veículo e registro final de pesagens físicas da balança.
* **Aline Admin (Administrador)**: Permissão de acesso completo a todos os módulos do ERP.

### 2. Fluxo Comercial (Prospecção)
1. Efetue login como **Carlos Comercial**.
2. Vá em **Fornecedores** e clique em **Cadastrar Fornecedor**. Insira dados fictícios como "Indústrias Alpha S/A", crie o contato principal e defina a localização. Salve o cadastro.
3. Vá em **Prospecção (Kanban)**. Veja o cartão da empresa na coluna "Prospecção". Arraste-o para a coluna "Qualificação".
4. Clique no fornecedor para abrir a sua **Ficha 360º**.
5. Na aba **Materiais**, adicione um material como "Papelão Ondulado" (5 toneladas / Mensal / Compra a R$0,45/kg).
6. Na aba **Visão Geral**, adicione uma nova pendência: "Aguardando envio do contrato".
7. Registre um contato clicando em **Registrar Contato** (Selecione WhatsApp, escreva o resumo da conversa e salve).
8. Clique no botão azul **Enviar para Logística** no cabeçalho da ficha. O sistema validará as informações mínimas (Contato, Endereço e Materiais), mudará a etapa para "Análise Logística" e a empresa aparecerá no painel de Logística.

### 3. Fluxo Logístico
1. Mude o papel de simulação na base da Sidebar para **Lucas Logística** (ou saia e logue com a conta dele).
2. Acesse o módulo **Logística** na Sidebar. A "Indústrias Alpha S/A" estará na fila de análise.
3. Clique em **Analisar**. Defina a distância (ex: 35km), o veículo sugerido (VUC), o custo de frete (ex: R$ 380,00) e marque a viabilidade como **Viável**. Salve.
4. O fornecedor será automaticamente promovido para a etapa de **Documentação** e seu status se tornará **Aprovado**, habilitando a operação.

### 4. Fluxo Operacional (Coleta e Recebimento)
1. Alterne seu papel na Sidebar de volta para **Carlos Comercial** (ou logue como Comercial).
2. Abra a ficha da "Indústrias Alpha S/A" (ela estará na etapa de Documentação ou Ativa).
3. No cabeçalho, clique em **Agendar Coleta**. Defina a data da coleta, preencha o nome do motorista e selecione o material cadastrado ("Papelão Ondulado") com a quantidade estimada. Salve.
4. Mude seu papel para **Lucas Logística**.
5. Vá em **Coletas** na Sidebar. Você verá a coleta agendada. Clique em **Registrar Recebimento**.
6. O sistema redirecionará para a tela de Balança com a empresa e coleta pré-selecionadas. Insira os dados reais aferidos na balança física (ex: 5.200 kg reais recebidos em fardos). Clique em **Registrar Pesagem**.
7. O agendamento mudará para "Realizada" e os dados de peso líquido real entrarão no estoque e histórico da empresa.
8. Abra a ficha do fornecedor e clique na aba **Linha do Tempo (Timeline)** para ver a auditoria de tudo que ocorreu no relacionamento de ponta a ponta.

---

## 📁 Estrutura de Diretórios
```text
src/
├── app/                              # Next.js App Router (Páginas e Rotas)
│   ├── (auth)/                       # Rota de Login com mock flow
│   └── (dashboard)/                  # Rotas internas protegidas com Sidebar
│       ├── dashboard/                # Dash principal de indicadores
│       ├── fornecedores/             # Ficha 360 e Lista de fornecedores
│       ├── prospeccao/               # Kanban Board comercial
│       ├── logistica/                # Fila de homologação técnica de frete
│       ├── coletas/                  # Calendário/lista de agendas
│       └── recebimentos/             # Tela de pesagem física/balança
│
├── features/                         # Lógica de Negócio (Feature-Based Design)
│   ├── auth/                         # Contextos de segurança
│   ├── shared/                       # dbService central do banco Dual-Mode
│   └── suppliers/                    # Componentes específicos de fornecedores
│
├── components/                       # Componentes Reutilizáveis Globais
│   ├── ui/                           # Componentes atômicos (Button, Input, Select, Badge, Card, Modal)
│   └── layout/                       # Sidebar de navegação do sistema
│
├── lib/                              # Configuração inicial do cliente Supabase
├── types/                            # Tipagem forte TypeScript
└── supabase/                         # Scripts de Banco de Dados (migrations e seed)
```

---

## 🚀 Deploy em Produção (Futuro)
O ERP está totalmente preparado para ser buildado na **Vercel** e hospedado em produção:
1. Faça o deploy do repositório no painel da Vercel.
2. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. O sistema mudará automaticamente para o modo de produção conectado ao PostgreSQL.
