/**
 * Proper error handling patterns for react-hook-form
 * This file demonstrates CORRECT usage - should NOT trigger violations
 */

import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Mock API and toast for demonstration
const api = {
  async submit(data: any) {
    return { success: true };
  },
  async submitWithValidation(data: any) {
    // Simulates server returning validation errors
    throw {
      validationErrors: {
        email: 'Email already exists',
        username: 'Username taken'
      }
    };
  }
};

const toast = {
  error: (msg: string) => console.error(msg),
  success: (msg: string) => console.log(msg)
};

// Schema for validation
const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8)
});

type FormData = z.infer<typeof formSchema>;

/**
 * ✅ CORRECT: Async onSubmit with proper try-catch
 * Handles errors and provides user feedback
 */
export function ProperAsyncForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      username: '',
      password: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Form submitted successfully');
    } catch (error) {
      // Proper error handling with user feedback
      toast.error('Failed to submit form');
      console.error('Submission error:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <input {...form.register('username')} />
      <input {...form.register('password')} type="password" />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ✅ CORRECT: Server validation errors properly displayed via setError
 */
export function ProperServerValidationForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submitWithValidation(data);
      toast.success('Form submitted');
    } catch (error: any) {
      // Properly display server validation errors
      if (error.validationErrors) {
        Object.entries(error.validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof FormData, {
            type: 'manual',
            message: message as string
          });
        });
        toast.error('Please fix validation errors');
      } else {
        toast.error('Submission failed');
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
      <input {...form.register('username')} />
      {form.formState.errors.username && <span>{form.formState.errors.username.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ✅ CORRECT: useFormContext with FormProvider wrapper
 */
export function ProperContextUsage() {
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      toast.error('Failed');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <NestedFieldComponent />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

/**
 * ✅ CORRECT: Nested component safely using useFormContext
 * FormProvider is present in parent, so this is safe
 */
function NestedFieldComponent() {
  const { register, formState } = useFormContext<FormData>();

  return (
    <div>
      <input {...register('email')} />
      {formState.errors.email && <span>{formState.errors.email.message}</span>}
    </div>
  );
}

/**
 * ✅ CORRECT: Defensive useFormContext with null check
 */
function DefensiveNestedComponent() {
  const methods = useFormContext<FormData>();

  if (!methods) {
    throw new Error('Component must be used within FormProvider');
  }

  const { register, formState } = methods;

  return (
    <div>
      <input {...register('username')} />
      {formState.errors.username && <span>{formState.errors.username.message}</span>}
    </div>
  );
}

/**
 * ✅ CORRECT: Using onError callback for validation failures
 */
export function ProperValidationErrorHandling() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      toast.error('Submission failed');
    }
  };

  const onError = (errors: any) => {
    // Handle validation errors
    toast.error('Please fix form errors');
    console.log('Validation errors:', errors);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onError)}>
      <input {...form.register('email')} />
      <input {...form.register('username')} />
      <input {...form.register('password')} type="password" />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ✅ CORRECT: Multiple error scenarios handled
 */
export function ComprehensiveErrorHandling() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error: any) {
      // Handle different error types
      if (error.response?.status === 400) {
        toast.error('Invalid data');
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized');
      } else if (error.response?.status === 500) {
        toast.error('Server error');
      } else if (error.validationErrors) {
        // Server validation errors
        Object.entries(error.validationErrors).forEach(([field, message]) => {
          form.setError(field as keyof FormData, {
            type: 'manual',
            message: message as string
          });
        });
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <input {...form.register('username')} />
      <input {...form.register('password')} type="password" />
      <button type="submit">Submit</button>
    </form>
  );
}
