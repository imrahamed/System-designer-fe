import { Node, Edge } from 'reactflow';

export interface DesignTemplate {
  name: string;
  design: {
    nodes: Node[];
    edges: Edge[];
  };
}

export const MOCK_TEMPLATES: DesignTemplate[] = [
  {
    name: 'Simple CQRS',
    design: {
      nodes: [
        { id: 'cqrs-1', type: 'input', position: { x: 100, y: 50 }, data: { label: 'Client' } },
        { id: 'cqrs-2', position: { x: 300, y: 50 }, data: { label: 'Command API' } },
        { id: 'cqrs-3', position: { x: 500, y: 50 }, data: { label: 'Write DB' } },
        { id: 'cqrs-4', position: { x: 300, y: 200 }, data: { label: 'Query API' } },
        { id: 'cqrs-5', position: { x: 500, y: 200 }, data: { label: 'Read DB' } },
        { id: 'cqrs-6', position: { x: 700, y: 125 }, data: { label: 'Sync Service' } },
      ],
      edges: [
        { id: 'e-c1-c2', source: 'cqrs-1', target: 'cqrs-2' },
        { id: 'e-c2-c3', source: 'cqrs-2', target: 'cqrs-3' },
        { id: 'e-c1-c4', source: 'cqrs-1', target: 'cqrs-4' },
        { id: 'e-c4-c5', source: 'cqrs-4', target: 'cqrs-5' },
        { id: 'e-c3-c6', source: 'cqrs-3', target: 'cqrs-6' },
        { id: 'e-c6-c5', source: 'cqrs-6', target: 'cqrs-5' },
      ],
    },
  },
  {
    name: 'Basic Microservices',
    design: {
        nodes: [
            { id: 'ms-1', position: { x: 100, y: 150 }, data: { label: 'API Gateway' } },
            { id: 'ms-2', position: { x: 300, y: 50 }, data: { label: 'Auth Service' } },
            { id: 'ms-3', position: { x: 300, y: 150 }, data: { label: 'Product Service' } },
            { id: 'ms-4', position: { x: 300, y: 250 }, data: { label: 'Order Service' } },
        ],
        edges: [
            { id: 'e-ms1-ms2', source: 'ms-1', target: 'ms-2' },
            { id: 'e-ms1-ms3', source: 'ms-1', target: 'ms-3' },
            { id: 'e-ms1-ms4', source: 'ms-1', target: 'ms-4' },
        ]
    }
  }
];
