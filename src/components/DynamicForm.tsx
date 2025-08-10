import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { validateProperties } from '@/services/api';

interface DynamicFormProps {
  componentId: string;
  schema: z.ZodObject<any, any, any>;
  defaultValues: Record<string, any>;
  onSubmitSuccess: (values: Record<string, any>) => void;
}

export function DynamicForm({ componentId, schema, defaultValues, onSubmitSuccess }: DynamicFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const { setError, formState: { isSubmitting } } = form;

  const handleFormSubmit = async (values: Record<string, any>) => {
    const response = await validateProperties(componentId, values);

    if (!response.success && response.errors) {
      // Set errors on the corresponding fields
      for (const [fieldName, fieldErrors] of Object.entries(response.errors)) {
        if (fieldErrors) {
          setError(fieldName as any, {
            type: 'server',
            message: fieldErrors.join(', '),
          });
        }
      }
      return; // Stop submission
    }

    // If server validation is successful, call the passed-in submit handler
    onSubmitSuccess(values);
  };

  const shape = schema.shape;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {Object.keys(shape).map((key) => {
          const fieldSchema = shape[key];
          const fieldType = fieldSchema._def.typeName;

          return (
            <FormField
              key={key}
              control={form.control}
              name={key}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{key}</FormLabel>
                  <FormControl>
                    {fieldType === 'ZodString' ? (
                      <Input {...field} />
                    ) : fieldType === 'ZodNumber' ? (
                      <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                    ) : fieldType === 'ZodEnum' ? (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select a ${key}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fieldSchema._def.values.map((val: string) => (
                            <SelectItem key={val} value={val}>{val}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Validating...' : 'Save Properties'}
        </Button>
      </form>
    </Form>
  );
}
