import { z } from 'zod';

// Define the Zod schemas for our components' properties
const LambdaSchema = z.object({
  functionName: z.string().min(1, 'Function name is required.'),
  memorySize: z.number().positive('Memory size must be positive.'),
});

const EC2Schema = z.object({
  instanceType: z.enum(['t2.micro', 't3.small', 'm5.large']),
  ami: z.string().startsWith('ami-', 'Must be a valid AMI ID.'),
});

const DynamoDBSchema = z.object({
  tableName: z.string().min(3, 'Table name must be at least 3 characters.'),
  primaryKey: z.string().min(1, 'Primary key is required.'),
});

const SQSSchema = z.object({
  queueName: z.string().min(1, 'Queue name is required.'),
  visibilityTimeout: z.number().int().min(0).max(43200),
});

const APIGatewaySchema = z.object({
  apiName: z.string().min(1, 'API name is required.'),
});

// Define a general type for our component data, using the Zod schemas
export interface ComponentData {
  id: string;
  name: string;
  category: 'Compute' | 'Database' | 'Messaging' | 'API';
  schema: z.ZodObject<any>;
  defaultProps: z.infer<this['schema']>;
  iacSnippet: string;
  docs: string;
}

export const MOCK_COMPONENTS: ComponentData[] = [
  {
    id: 'compute.lambda.v1',
    name: 'AWS Lambda',
    category: 'Compute',
    schema: LambdaSchema,
    defaultProps: {
      functionName: 'my-lambda-function',
      memorySize: 512,
    },
    iacSnippet: `resource "aws_lambda_function" "example" { ... }`,
    docs: '## AWS Lambda\n\nRuns your code without provisioning or managing servers.',
  },
  {
    id: 'compute.ec2.v1',
    name: 'EC2 Instance',
    category: 'Compute',
    schema: EC2Schema,
    defaultProps: {
      instanceType: 't2.micro',
      ami: 'ami-0c55b159cbfafe1f0',
    },
    iacSnippet: `resource "aws_instance" "example" { ... }`,
    docs: '## EC2 Instance\n\nProvides secure, resizable compute capacity in the cloud.',
  },
  {
    id: 'db.dynamodb.v1',
    name: 'DynamoDB Table',
    category: 'Database',
    schema: DynamoDBSchema,
    defaultProps: {
      tableName: 'my-table',
      primaryKey: 'id',
    },
    iacSnippet: `resource "aws_dynamodb_table" "example" { ... }`,
    docs: '## DynamoDB\n\nA key-value and document database...',
  },
  {
    id: 'msg.sqs.v1',
    name: 'SQS Queue',
    category: 'Messaging',
    schema: SQSSchema,
    defaultProps: {
      queueName: 'my-queue',
      visibilityTimeout: 30,
    },
    iacSnippet: `resource "aws_sqs_queue" "example" { ... }`,
    docs: '## Amazon SQS\n\nA fully managed message queuing service.',
  },
  {
    id: 'api.gateway.v1',
    name: 'API Gateway',
    category: 'API',
    schema: APIGatewaySchema,
    defaultProps: {
      apiName: 'my-api',
    },
    iacSnippet: `resource "aws_api_gateway_rest_api" "example" { ... }`,
    docs: '## API Gateway\n\nCreate, publish, maintain, monitor, and secure APIs...',
  },
];
