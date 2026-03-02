export interface AgentDef {
  id: string;
  name: string;
  avatar: string;
  color: string;
  workStyle: string;
}

export const AGENTS: AgentDef[] = [
  { id: 'coordinator', name: 'Coordinator', avatar: '/avatars/coordinator.svg', color: '#f59e0b', workStyle: 'commanding' },
  { id: 'researcher',  name: 'Researcher',  avatar: '/avatars/researcher.svg',  color: '#8b5cf6', workStyle: 'methodical' },
  { id: 'writer',      name: 'Writer',      avatar: '/avatars/writer.svg',      color: '#10b981', workStyle: 'artistic' },
  { id: 'observer',    name: 'Observer',     avatar: '/avatars/observer.svg',    color: '#0ea5e9', workStyle: 'watchful' },
];

export const WORK_MSGS: Record<string, string[]> = {
  coordinator: ['Coordinating...', 'Scheduling', 'Delegating', 'Checking systems...'],
  researcher:  ['Analyzing...', 'Deep research', 'Reviewing data...', 'Crunching numbers'],
  writer:      ['Writing copy...', 'Designing', 'Sketching ideas...', 'Editing draft'],
  observer:    ['Logging observations...', 'Watching ops...', 'Taking notes', 'Tracking patterns'],
};

export const PERSONALITY_BANTER: Record<string, string[]> = {
  coordinator: ['Reviewing the roadmap...', 'Team sync soon', 'Checking priorities', 'Delegating tasks'],
  researcher:  ['Cross-referencing data...', 'Running hypothesis', 'Peer review time', 'Validating findings'],
  writer:      ['Polishing the draft', 'Brainstorming headlines', 'Layout adjustments', 'Creative block...'],
  observer:    ['Noting a pattern...', 'Interesting dynamics', 'Recording observations', 'Compiling notes'],
};

export const COFFEE_MSGS = ['Coffee time!', 'Need caffeine', 'Refueling...', 'Ahh, coffee...'];

export const CELEBRATE_MSGS: Record<string, string[]> = {
  coordinator: ['Ship it!', 'Deployed!', 'All systems go!'],
  researcher:  ['Data confirms it!', 'Hypothesis proven!', 'Eureka!'],
  writer:      ['Masterpiece!', 'Published!', 'Perfection!'],
  observer:    ['Story captured!', 'Logged!', 'Pattern found!'],
};

export const LOUNGE_MSGS: Record<string, string[]> = {
  coordinator: ['Break time~', 'Quick rest', 'Recharging...'],
  researcher:  ['Reading papers...', 'Contemplating...', 'In thought...'],
  writer:      ['Getting inspired', 'Moodboarding', 'Creativity++'],
  observer:    ['Just watching...', 'Quiet observe', 'Noting...'],
};
