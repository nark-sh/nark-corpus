/**
 * Missing error handling patterns for react-hook-form
 * This file demonstrates INCORRECT usage - SHOULD trigger violations
 */

import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Mock API and toast
const api = {
  async submit(data: any) {
    // Simulates potential failure
    if (Math.random() > 0.5) {
      throw new Error('API Error');
    }
    return { success: true };
  },
  async submitWithValidation(data: any) {
    throw {
      validationErrors: {
        email: 'Email already exists'
      }
    };
  }
};

const toast = {
  error: (msg: string) => console.error(msg),
  success: (msg: string) => console.log(msg)
};

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8)
});

type FormData = z.infer<typeof formSchema>;

/**
 * ❌ VIOLATION: async-submit-unhandled-error
 * Async onSubmit with NO try-catch - error will be unhandled
 */
export function MissingTryCatchForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    // ❌ No error handling - this will cause UnhandledPromiseRejection
    await api.submit(data);
    toast.success('Success');
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
 * ❌ VIOLATION: empty-catch-block-silent-failure
 * Has try-catch but catch block is empty - silent failure
 */
export function EmptyCatchBlockForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      // ❌ Empty catch block - user gets no feedback if submission fails
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ❌ VIOLATION: empty-catch-block-silent-failure
 * Only logs error to console - no user feedback
 */
export function OnlyLoggingErrorForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      // ❌ Only logs - user doesn't know submission failed
      console.log('Error:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ❌ VIOLATION: empty-catch-block-silent-failure
 * Comment placeholder but no implementation
 */
export function TodoErrorHandlingForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      // ❌ TODO comment without implementation
      // TODO: Add proper error handling
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ❌ VIOLATION: server-validation-error-not-displayed
 * Server returns validation errors but they're not displayed via setError
 */
export function MissingSetErrorForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submitWithValidation(data);
      toast.success('Success');
    } catch (error: any) {
      // ❌ Generic error message - server validation errors not shown
      toast.error('Submission failed');
      // Missing: form.setError() calls to show field-specific errors
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {/* Error message won't show even though server returned validation error */}
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ❌ VIOLATION: missing-form-provider
 * useFormContext called without FormProvider wrapper
 */
export function MissingFormProviderForm() {
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

  // ❌ Missing FormProvider wrapper
  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <NestedComponentMissingProvider />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ❌ VIOLATION: useformcontext-property-access-error
 * useFormContext destructuring without FormProvider
 */
function NestedComponentMissingProvider() {
  // ❌ Will crash: Cannot destructure property 'register' as it is null
  const { register, formState } = useFormContext<FormData>();

  return (
    <div>
      <input {...register('email')} />
      {formState.errors.email && <span>{formState.errors.email.message}</span>}
    </div>
  );
}

/**
 * ❌ VIOLATION: async-submit-unhandled-error
 * Multiple async operations without error handling
 */
export function MultipleUnhandledOperations() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    // ❌ Multiple async calls without try-catch
    await api.submit(data);
    await fetch('/api/log', { method: 'POST', body: JSON.stringify(data) });
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('All done');
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ❌ VIOLATION: empty-catch-block-silent-failure
 * Catch block with only comment explaining intentional silence
 */
export function IntentionallySilentFailure() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      // ❌ Intentionally left blank - still a violation
      // Error handling intentionally left blank for production
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ❌ VIOLATION: async-submit-unhandled-error
 * Fetch without try-catch
 */
export function UnhandledFetchForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    // ❌ Fetch without error handling
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    toast.success('Submitted');
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ❌ VIOLATION: server-validation-error-not-displayed
 * Catches error but doesn't extract or display validation details
 */
export function IgnoresServerValidationErrors() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submitWithValidation(data);
      toast.success('Success');
    } catch (error: any) {
      // ❌ Has validationErrors but doesn't use setError to display them
      if (error.validationErrors) {
        toast.error('Validation failed');
        // Missing: Loop through errors and call form.setError()
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ❌ VIOLATION: async-submit-unhandled-error
 * Partial error handling - some operations unhandled
 */
export function PartialErrorHandling() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      toast.error('Main submission failed');
    }

    // ❌ This runs after try-catch - not protected
    await fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event: 'form_submit' })
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}
