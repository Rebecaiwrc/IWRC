# Regras do Projeto - ERP iWrc

## 1. Stack Tecnológica
* **Framework**: Next.js 14+ (App Router)
* **Linguagem**: TypeScript (Strict Mode)
* **Estilização**: Tailwind CSS (Vanilla CSS com classes utilitárias)
* **Banco de Dados**: PostgreSQL (Supabase)
* **Autenticação**: Supabase Auth (com fallback local no MVP)
* **Gerenciamento de Estado**: React Context API & React Hooks

## 2. Convenções e Idiomas
* **Código Fonte**: Todos os nomes de arquivos, diretórios, variáveis, funções, classes, schemas, colunas de banco de dados e mensagens de commit devem ser escritos em **Inglês**.
* **Interface do Usuário (UI)**: Toda a interface exposta aos usuários da iWrc (títulos, formulários, alertas, tabelas, menus) deve ser em **Português do Brasil (pt-BR)**.
* **Componentes**: Nomear em PascalCase (ex: `Sidebar.tsx`, `SupplierForm.tsx`).
* **Hooks**: Nomear com prefixo `use` em camelCase (ex: `useSupplier.ts`).
* **Serviços/Repositórios**: Nomear em camelCase (ex: `supplierService.ts`).

## 3. Estrutura de Diretórios
Seguir a arquitetura baseada em **Features**:
* `src/app/`: Apenas rotas, layouts e páginas que consomem as features.
* `src/features/`: Lógica de negócio, hooks específicos de feature e acesso a dados.
* `src/components/ui/`: Componentes atômicos reutilizáveis sem regras de negócio (ex: botões, inputs, modais).
* `src/components/layout/`: Elementos estruturais da página (Sidebar, Header).
* `src/types/`: Tipagens TypeScript globais.
* `supabase/migrations/`: Scripts SQL enumerados de banco.

## 4. Diretrizes de Banco de Dados e Acesso
* **Entidade Única**: Um fornecedor/gerador possui um único ID. Todas as interações, análises logísticas, coletas e recebimentos devem referenciar esse ID.
* **Dual-Mode Client**: O acesso ao banco é abstraído. Se chaves do Supabase não existirem, o cliente lê/grava no `localStorage` simulando o comportamento real de forma síncrona/assíncrona.
* **Migrations**: Qualquer mudança estrutural no banco deve ser salva em `supabase/migrations/<timestamp_ou_numero>_nome.sql`.
* **RLS (Row Level Security)**: Deve ser ativado em todas as tabelas, definindo políticas de leitura e gravação baseadas no `auth.uid()`.

## 5. Qualidade e Boas Práticas
* **Sem placeholders**: Use dados realistas ou sementes para visualização.
* **Acessibilidade**: Elementos interativos devem ter IDs únicos e claros.
* **Controle de Erro**: Envolver chamadas assíncronas em blocos try/catch e apresentar feedbacks amigáveis de carregamento (loading states) e erro ao usuário.
* **Responsividade**: Layouts devem se adaptar de dispositivos móveis a desktops ultra-wide.
