export interface FlowCapability {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  highlight?: boolean;
}

export interface FlowNode {
  id: string;
  type: 'trigger' | 'agent' | 'decision' | 'action' | 'integration';
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  badges?: string[];
  x: number;
  y: number;
}

export interface FlowEdge {
  from: string;
  to: string;
  label: string;
  style?: 'solid' | 'dashed';
  fromAnchor?: 'left' | 'right' | 'top' | 'bottom';
  toAnchor?: 'left' | 'right' | 'top' | 'bottom';
}

export interface FlowStep {
  title: string;
  description: string;
  outputs: string[];
}

export interface FlowDefinition {
  capabilities: FlowCapability[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  steps: FlowStep[];
}

export const flowDefinition: FlowDefinition = {
  capabilities: [
    {
      id: 'it_ops',
      title: 'IT Ops',
      description: 'Onboarding de colaboradores com provisionamento automático.',
      icon: 'IO',
      accent: '#6366f1',
      highlight: true,
    },
    {
      id: 'sec_ops',
      title: 'Sec Ops',
      description: 'Enriquecer tickets com contexto de ameaças e respostas.',
      icon: 'SO',
      accent: '#0ea5e9',
    },
    {
      id: 'dev_ops',
      title: 'Dev Ops',
      description: 'Transformar linguagem natural em automações e APIs.',
      icon: 'DO',
      accent: '#22c55e',
    },
    {
      id: 'sales',
      title: 'Sales',
      description: 'Gerar insights de clientes a partir de feedbacks.',
      icon: 'SA',
      accent: '#f97316',
    },
  ],
  nodes: [
    {
      id: 'trigger',
      type: 'trigger',
      title: "Formulário 'Novo Colaborador'",
      subtitle: 'Dispara quando RH envia o cadastro.',
      icon: 'TR',
      accent: '#38bdf8',
      x: 14,
      y: 48,
    },
    {
      id: 'agent',
      type: 'agent',
      title: 'Agente FluxoLab',
      subtitle: 'Orquestra validações, IA e integra APIs.',
      icon: 'AG',
      accent: '#818cf8',
      badges: ['Chat', 'Memória'],
      x: 40,
      y: 48,
    },
    {
      id: 'decision',
      type: 'decision',
      title: 'É gestor?',
      subtitle: 'Verifica cargo e permissões solicitadas.',
      icon: 'IF',
      accent: '#22d3ee',
      x: 59,
      y: 48,
    },
    {
      id: 'slackAdd',
      type: 'action',
      title: 'Adicionar ao canal',
      subtitle: 'Convida para #gestores-onboarding.',
      icon: 'SL',
      accent: '#fbbf24',
      x: 80,
      y: 32,
    },
    {
      id: 'slackUpdate',
      type: 'action',
      title: 'Atualizar perfil',
      subtitle: 'Aplica assinatura e grupos padrão.',
      icon: 'SP',
      accent: '#fbbf24',
      x: 80,
      y: 64,
    },
    {
      id: 'anthropic',
      type: 'integration',
      title: 'Resumo com IA',
      subtitle: 'Resume informações do colaborador.',
      icon: 'AI',
      accent: '#a855f7',
      x: 30,
      y: 74,
    },
    {
      id: 'postgresMemory',
      type: 'integration',
      title: 'Memória Postgres',
      subtitle: 'Consulta histórico e evita duplicidade.',
      icon: 'DB',
      accent: '#0ea5e9',
      x: 42,
      y: 74,
    },
    {
      id: 'entra',
      type: 'integration',
      title: 'Microsoft Entra ID',
      subtitle: 'Provisiona licenças corporativas.',
      icon: 'AD',
      accent: '#6366f1',
      x: 54,
      y: 74,
    },
    {
      id: 'jira',
      type: 'integration',
      title: 'Jira Software',
      subtitle: 'Abre tarefa para follow-up.',
      icon: 'JI',
      accent: '#0284c7',
      x: 66,
      y: 74,
    },
  ],
  edges: [
    {
      from: 'trigger',
      to: 'agent',
      label: 'Dados normalizados',
      fromAnchor: 'right',
      toAnchor: 'left',
    },
    {
      from: 'agent',
      to: 'decision',
      label: 'Perfil analisado',
      fromAnchor: 'right',
      toAnchor: 'left',
    },
    {
      from: 'decision',
      to: 'slackAdd',
      label: 'Sim (gestor)',
      fromAnchor: 'right',
      toAnchor: 'left',
    },
    {
      from: 'decision',
      to: 'slackUpdate',
      label: 'Não (squads)',
      fromAnchor: 'bottom',
      toAnchor: 'top',
    },
    {
      from: 'agent',
      to: 'anthropic',
      label: 'Briefing',
      style: 'dashed',
      fromAnchor: 'bottom',
      toAnchor: 'top',
    },
    {
      from: 'agent',
      to: 'postgresMemory',
      label: 'Consulta memória',
      style: 'dashed',
      fromAnchor: 'bottom',
      toAnchor: 'top',
    },
    {
      from: 'agent',
      to: 'entra',
      label: 'Provisionar conta',
      style: 'dashed',
      fromAnchor: 'bottom',
      toAnchor: 'top',
    },
    {
      from: 'agent',
      to: 'jira',
      label: 'Abrir tarefa',
      style: 'dashed',
      fromAnchor: 'bottom',
      toAnchor: 'top',
    },
  ],
  steps: [
    {
      title: 'Captura da solicitação',
      description: 'Formulário padroniza dados e dispara o fluxo.',
      outputs: ['Campos validados', 'Informações de gestor e equipe'],
    },
    {
      title: 'Análise pelo agente',
      description: 'Agente agrega resumo com IA e memória.',
      outputs: ['Resumo do colaborador', 'Checagem de duplicidade'],
    },
    {
      title: 'Provisionamento corporativo',
      description: 'Integra com Entra ID e Jira para abrir tarefas.',
      outputs: ['Conta criada', 'Ticket de acompanhamento'],
    },
    {
      title: 'Roteamento condicional',
      description: 'Define se é gestor para direcionar etapas.',
      outputs: ['Gestor: convite Slack', 'Squad: atualização de perfil'],
    },
  ],
};
