/**
 * Instance usage patterns for react-hook-form
 * Tests various patterns of form instance creation and usage
 */

import { useForm, UseFormReturn, FormProvider, useFormContext, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const api = {
  async submit(data: any) {
    if (Math.random() > 0.5) throw new Error('API Error');
    return { success: true };
  }
};

const toast = {
  error: (msg: string) => console.error(msg),
  success: (msg: string) => console.log(msg)
};

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  bio: z.string().optional(),
  urls: z.array(z.object({ value: z.string().url() })).optional()
});

type ProfileData = z.infer<typeof profileSchema>;

/**
 * ✅ CORRECT: Form instance stored and used properly
 */
export function FormInstanceProperUsage() {
  const form: UseFormReturn<ProfileData> = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: ''
    }
  });

  const onSubmit = async (data: ProfileData) => {
    try {
      await api.submit(data);
      form.reset(); // ✅ Safe to use form instance methods
      toast.success('Success');
    } catch (error) {
      toast.error('Failed');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      <input {...form.register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ✅ CORRECT: useFieldArray with proper error handling
 */
export function FieldArrayProperUsage() {
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      urls: [{ value: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'urls'
  });

  const onSubmit = async (data: ProfileData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      toast.error('Failed');
    }
  };

  const handleAddUrl = () => {
    try {
      append({ value: '' });
    } catch (error) {
      toast.error('Cannot add more URLs');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...form.register(`urls.${index}.value` as const)} />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={handleAddUrl}>Add URL</button>
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ✅ CORRECT: Form instance passed through props
 */
interface FormSectionProps {
  form: UseFormReturn<ProfileData>;
}

export function FormWithPropsPattern() {
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema)
  });

  const onSubmit = async (data: ProfileData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      toast.error('Failed');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormSection form={form} />
      <button type="submit">Submit</button>
    </form>
  );
}

function FormSection({ form }: FormSectionProps) {
  return (
    <div>
      <input {...form.register('name')} />
      <input {...form.register('email')} />
    </div>
  );
}

/**
 * ✅ CORRECT: FormProvider pattern for deeply nested components
 */
export function FormProviderPattern() {
  const methods = useForm<ProfileData>({
    resolver: zodResolver(profileSchema)
  });

  const onSubmit = async (data: ProfileData) => {
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
        <DeeplyNestedComponent />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

function DeeplyNestedComponent() {
  return (
    <div>
      <AnotherNestedLevel />
    </div>
  );
}

function AnotherNestedLevel() {
  // ✅ Safe because FormProvider is in ancestor
  const { register, formState } = useFormContext<ProfileData>();

  return (
    <div>
      <input {...register('name')} />
      {formState.errors.name && <span>{formState.errors.name.message}</span>}
    </div>
  );
}

/**
 * ❌ VIOLATION: useFieldArray operations without error handling
 */
export function FieldArrayMissingErrorHandling() {
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      urls: []
    }
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'urls'
  });

  const onSubmit = async (data: ProfileData) => {
    // ❌ No error handling
    await api.submit(data);
    toast.success('Success');
  };

  const handleAddUrl = () => {
    // ❌ No error handling if append fails
    append({ value: '' });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...form.register(`urls.${index}.value` as const)} />
        </div>
      ))}
      <button type="button" onClick={handleAddUrl}>Add</button>
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ❌ VIOLATION: Form instance used but async onSubmit unhandled
 */
export function FormInstanceUnhandledAsync() {
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema)
  });

  const onSubmit = async (data: ProfileData) => {
    // ❌ No try-catch
    await api.submit(data);
    form.reset(); // Might not run if api.submit throws
    toast.success('Success');
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      <button type="submit">Submit</button>
    </form>
  );
}

/**
 * ✅ CORRECT: Multiple forms on same page
 */
export function MultipleFormsPage() {
  const loginForm = useForm({
    defaultValues: { email: '', password: '' }
  });

  const signupForm = useForm({
    defaultValues: { email: '', password: '', confirmPassword: '' }
  });

  const handleLogin = async (data: any) => {
    try {
      await api.submit(data);
      toast.success('Logged in');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleSignup = async (data: any) => {
    try {
      await api.submit(data);
      toast.success('Signed up');
    } catch (error) {
      toast.error('Signup failed');
    }
  };

  return (
    <div>
      <form onSubmit={loginForm.handleSubmit(handleLogin)}>
        <input {...loginForm.register('email')} />
        <input {...loginForm.register('password')} type="password" />
        <button type="submit">Login</button>
      </form>

      <form onSubmit={signupForm.handleSubmit(handleSignup)}>
        <input {...signupForm.register('email')} />
        <input {...signupForm.register('password')} type="password" />
        <input {...signupForm.register('confirmPassword')} type="password" />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

/**
 * ✅ CORRECT: Form with mode configuration
 */
export function FormWithValidationMode() {
  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange', // Validate on change
    defaultValues: {
      name: '',
      email: ''
    }
  });

  const onSubmit = async (data: ProfileData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      toast.error('Failed');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
      <input {...form.register('email')} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
      <button type="submit" disabled={!form.formState.isValid}>Submit</button>
    </form>
  );
}

/**
 * ✅ CORRECT: Form with custom validation resolver
 */
export function FormWithCustomResolver() {
  const form = useForm<ProfileData>({
    resolver: async (data, context, options) => {
      // Custom validation logic
      const errors: any = {};

      if (!data.name || data.name.length < 2) {
        errors.name = { type: 'manual', message: 'Name too short' };
      }

      if (!data.email || !data.email.includes('@')) {
        errors.email = { type: 'manual', message: 'Invalid email' };
      }

      return {
        values: data,
        errors: errors
      };
    }
  });

  const onSubmit = async (data: ProfileData) => {
    try {
      await api.submit(data);
      toast.success('Success');
    } catch (error) {
      toast.error('Failed');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      <input {...form.register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}
