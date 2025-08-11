import {
  Cloud,
  Database,
  ShieldCheck,
  Server,
  Rows,
  GitBranch,
  Cpu,
  Network,
  Puzzle,
  FileCode,
  type LucideIcon,
} from 'lucide-react';

const categoryIconMap: Record<string, LucideIcon> = {
  'API Gateway': Network,
  Authentication: ShieldCheck,
  Cache: Rows,
  CDN: Cloud,
  'CI/CD': GitBranch,
  'Container Orchestration': Puzzle,
  Database: Database,
  DNS: Network,
  'Function as a Service (FaaS)': Cpu,
  'Load Balancer': Server,
  Logging: FileCode,
  'Message Queue': Server,
  Monitoring: Server,
  'Object Storage': Database,
  Proxy: Server,
  Search: FileCode,
  'Service Mesh': Network,
  'Stream Processing': Server,
  Shapes: Puzzle,
  UML: GitBranch,
  default: Puzzle,
};

export const getIconForCategory = (category: string): LucideIcon => {
  return categoryIconMap[category] || categoryIconMap.default;
};
