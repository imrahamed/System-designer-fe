import { render, screen, fireEvent, act } from '@testing-library/react';
import { DynamicForm } from './DynamicForm';
import { z } from 'zod';
import { vi } from 'vitest';
import * as api from '@/services/api';
import userEvent from '@testing-library/user-event';

vi.mock('@/services/api');

describe('DynamicForm', () => {
  it('should submit the form with the correct values', async () => {
    const onSubmitSuccess = vi.fn();
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const defaultValues = {
      name: 'John Doe',
      age: 30,
    };

    vi.spyOn(api, 'validateProperties').mockResolvedValue({ success: true });

    render(
      <DynamicForm
        componentId="1"
        schema={schema}
        defaultValues={defaultValues}
        onSubmitSuccess={onSubmitSuccess}
      />
    );

    const nameInput = screen.getByLabelText('name');
    const ageInput = screen.getByLabelText('age');
    const submitButton = screen.getByRole('button');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');
    await userEvent.clear(ageInput);
    await userEvent.type(ageInput, '25');
    await userEvent.click(submitButton);

    await vi.waitFor(() => {
      console.log('onSubmitSuccess calls:', onSubmitSuccess.mock.calls);
      expect(onSubmitSuccess).toHaveBeenCalledWith({
        name: 'Jane Doe',
        age: 25,
      });
    });
  });
});
