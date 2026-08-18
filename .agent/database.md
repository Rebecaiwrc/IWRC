# Modelagem do Banco de Dados - ERP iWrc

Este documento especifica a modelagem física e lógica do banco de dados PostgreSQL (Supabase) e sua representação no Mock LocalStorage.

---

## 1. Dicionário de Dados (Tabelas e Colunas)

### Tabela: `profiles`
Armazena dados de autenticação e perfis dos usuários internos da iWrc.
* `id` (uuid, PK, references auth.users): Identificador único do usuário.
* `email` (text, unique): E-mail do usuário.
* `name` (text): Nome completo.
* `role` (user_role): Papel no sistema (`ADMIN`, `BUYER`, `LOGISTICS`).
* `created_at` (timestamp with time zone).

### Tabela: `suppliers`
Entidade central do sistema. Um fornecedor existe apenas uma vez nesta tabela.
* `id` (uuid, PK): Identificador do fornecedor.
* `name` (text): Razão Social.
* `trade_name` (text, nullable): Nome fantasia.
* `document` (text, nullable): CNPJ ou CPF.
* `supplier_type` (text): Tipo do gerador (ex: Indústria, Comércio, Condomínio, etc.).
* `lead_source` (text): Origem do lead (ex: Google, Indicação, Prospecção Ativa).
* `internal_responsible_id` (uuid, FK references `profiles.id`): Responsável pela conta.
* `current_stage` (supplier_stage): Etapa atual (`PROSPECTING`, `QUALIFICATION`, `LOGISTICS`, `DOCUMENTATION`, `COLLECTION`, `OPERATION`).
* `current_status` (supplier_status): Situação (`PENDING`, `IN_PROGRESS`, `APPROVED`, `REJECTED`, `COMPLETED`, `INACTIVE`).
* `backlog_reason` (text, nullable): Descrição textual rápida da pendência ativa.
* `created_at` (timestamp with time zone).
* `updated_at` (timestamp with time zone).

### Tabela: `supplier_contacts`
Contatos associados ao fornecedor. Um fornecedor pode ter vários contatos.
* `id` (uuid, PK).
* `supplier_id` (uuid, FK references `suppliers.id` ON DELETE CASCADE).
* `name` (text): Nome do contato.
* `role` (text, nullable): Cargo (ex: Comprador, Gerente de Meio Ambiente).
* `phone` (text, nullable): Telefone fixo.
* `whatsapp` (text, nullable): WhatsApp.
* `email` (text, nullable): E-mail de contato.
* `is_primary` (boolean): Flag identificando se é o contato comercial principal.

### Tabela: `supplier_addresses`
Endereço estruturado do fornecedor. Um endereço por fornecedor (relacionamento 1-para-1).
* `id` (uuid, PK).
* `supplier_id` (uuid, FK references `suppliers.id` ON DELETE CASCADE, unique).
* `zip_code` (text): CEP.
* `street` (text): Logradouro.
* `number` (text): Número.
* `complement` (text, nullable): Complemento.
* `neighborhood` (text): Bairro.
* `city` (text): Cidade.
* `state` (text): Estado (UF, ex: SP).

### Tabela: `supplier_materials`
Materiais recicláveis declarados/disponíveis no fornecedor.
* `id` (uuid, PK).
* `supplier_id` (uuid, FK references `suppliers.id` ON DELETE CASCADE).
* `material_name` (text): Nome do material (ex: Papelão Ondulado, Sucata de Alumínio).
* `category` (text): Categoria (ex: Papel/Papelão, Plástico, Metal, Vidro).
* `estimated_volume` (numeric): Quantidade estimada.
* `unit` (text): Unidade (`kg`, `ton`, `l`, `m³`, `un`, `saco`, `big bag`).
* `frequency` (text): Frequência (`weekly`, `biweekly`, `monthly`, `sporadic`, etc.).
* `transaction_type` (text): Modalidade (`purchase` - compra ou `donation` - doação).
* `price_per_kg` (numeric, nullable): Valor negociado por kg (se for compra).
* `storage_form` (text, nullable): Como é acondicionado (ex: Fardos, Caçamba, Sacos).
* `notes` (text, nullable).

### Tabela: `supplier_interactions`
Histórico detalhado de contatos e reuniões.
* `id` (uuid, PK).
* `supplier_id` (uuid, FK references `suppliers.id` ON DELETE CASCADE).
* `user_id` (uuid, FK references `profiles.id`): Quem realizou o contato.
* `type` (interaction_type): Tipo (`whatsapp`, `phone`, `email`, `meeting`, `visit`, `internal_obs`, `other`).
* `description` (text): Resumo ou notas do contato.
* `interaction_date` (date): Data do evento.
* `interaction_time` (time): Hora do evento.

### Tabela: `supplier_status_history`
Auditoria histórica das mudanças de funil.
* `id` (uuid, PK).
* `supplier_id` (uuid, FK references `suppliers.id` ON DELETE CASCADE).
* `old_stage` (supplier_stage).
* `new_stage` (supplier_stage).
* `old_status` (supplier_status).
* `new_status` (supplier_status).
* `user_id` (uuid, FK references `profiles.id`).
* `notes` (text, nullable): Justificativa ou observação.
* `created_at` (timestamp with time zone).

### Tabela: `supplier_tasks`
Lista de pendências e tarefas a serem resolvidas no fornecedor.
* `id` (uuid, PK).
* `supplier_id` (uuid, FK references `suppliers.id` ON DELETE CASCADE).
* `description` (text): O que precisa ser feito/esperado.
* `status` (text): Estado (`pending` ou `completed`).
* `due_date` (date, nullable): Data limite.
* `completed_by` (uuid, FK references `profiles.id`, nullable).
* `completed_at` (timestamp with time zone, nullable).
* `created_at` (timestamp with time zone).

### Tabela: `logistics_analyses`
Análise de viabilidade logística.
* `id` (uuid, PK).
* `supplier_id` (uuid, FK references `suppliers.id` ON DELETE CASCADE).
* `distance_km` (numeric): Distância calculada da base da iWrc até o local.
* `transport_type` (text): Tipo de veículo sugerido (ex: Fiorino, VUC, Truck, Carreta).
* `estimated_cost` (numeric): Custo estimado para a coleta.
* `recommended_frequency` (text): Frequência logística recomendada.
* `transport_responsible` (text): Quem realiza o frete (`iWrc`, `Fornecedor`, `Terceirizado`).
* `conditioning_infrastructure_needed` (text, nullable): Se necessita caçamba, prensa, etc.
* `feasibility` (feasibility_status): Viabilidade (`PENDING`, `IN_PROGRESS`, `FEASIBLE`, `INFEASIBLE`, `NEED_INFO`).
* `notes` (text, nullable).
* `analyst_id` (uuid, FK references `profiles.id`).
* `analyzed_at` (timestamp with time zone).
* `created_at` (timestamp with time zone).

### Tabela: `collections`
Agendamentos de coletas operacionais.
* `id` (uuid, PK).
* `supplier_id` (uuid, FK references `suppliers.id`).
* `scheduled_date` (date): Data prevista para coleta.
* `completed_date` (date, nullable): Data real da coleta.
* `status` (collection_status): Situação da coleta.
* `driver_name` (text, nullable).
* `carrier_name` (text, nullable).
* `notes` (text, nullable).
* `created_at` (timestamp with time zone).

### Tabela: `collection_items`
Materiais associados ao agendamento de coleta.
* `id` (uuid, PK).
* `collection_id` (uuid, FK references `collections.id` ON DELETE CASCADE).
* `material_name` (text).
* `estimated_volume` (numeric).
* `unit` (text).

### Tabela: `receipts`
Fechamento de recebimento dos materiais (pesagem real na balança).
* `id` (uuid, PK).
* `supplier_id` (uuid, FK references `suppliers.id`).
* `collection_id` (uuid, FK references `collections.id`, nullable).
* `received_date` (date): Data do recebimento físico.
* `notes` (text, nullable).
* `created_at` (timestamp with time zone).

### Tabela: `receipt_items`
Detalhes dos itens pesados e validados no recebimento.
* `id` (uuid, PK).
* `receipt_id` (uuid, FK references `receipts.id` ON DELETE CASCADE).
* `material_name` (text).
* `quantity` (numeric): Quantidade de fardos, caçambas, etc. (se houver).
* `unit` (text).
* `weight_kg` (numeric): Peso líquido real aferido na balança em kg.
* `notes` (text, nullable).
