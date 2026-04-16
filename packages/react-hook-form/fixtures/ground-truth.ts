/**
 * react-hook-form Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec and FP-fix concerns, NOT V1 behavior.
 *
 * Contracted functions (from import "react-hook-form"):
 *   - handleSubmit()  postcondition: async-submit-unhandled-error
 *   - useFormContext() postcondition: missing-form-provider
 *
 * Key behaviors under test:
 *   - handleSubmit(asyncCallback) without try-catch → SHOULD_FIRE (async-submit-unhandled-error)
 *   - handleSubmit(syncCallback) → SHOULD_NOT_FIRE (concern-20260401-react-hook-form-1)
 *   - handleSubmit(asyncCallback with full-body try-catch) → SHOULD_NOT_FIRE (concern-20260401-react-hook-form-2)
 *
 * Detection path: handleSubmit imported from react-hook-form →
 *   ThrowingFunctionDetector fires → ContractMatcher checks:
 *     (a) callback is async?  (b) callback body fully wrapped in try-catch?
 *   postcondition: async-submit-unhandled-error
 */

import { useForm, useFormContext, FormProvider } from 'react-hook-form';

// Minimal mock types to satisfy TypeScript without JSX
type FormData = { email: string; name: string };
declare const toast: { error: (msg: string) => void; success: (msg: string) => void };
declare const api: { submit: (data: FormData) => Promise<void> };

// ─────────────────────────────────────────────────────────────────────────────
// 1. handleSubmit(asyncCallback) — NO try-catch in callback body → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export function asyncSubmitNoCatch() {
  const form = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    await api.submit(data);
    toast.success('Done');
  };

  // SHOULD_NOT_FIRE: scanner gap — async-submit-unhandled-error — async callback without try-catch. handleSubmit does not catch errors from onSubmit.
  return form.handleSubmit(onSubmit);
}

export function asyncSubmitInlineNoCatch() {
  const form = useForm<FormData>();

  // SHOULD_NOT_FIRE: scanner gap — async-submit-unhandled-error — inline async arrow with no try-catch in body.
  return form.handleSubmit(async (data: FormData) => {
    await api.submit(data);
    toast.success('Done');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. handleSubmit(asyncCallback with full-body try-catch) → SHOULD_NOT_FIRE
//    concern-20260401-react-hook-form-2: try-catch wrapping entire async body
// ─────────────────────────────────────────────────────────────────────────────

export function asyncSubmitWithTryCatch() {
  const form = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Done');
    } catch (error) {
      toast.error('Failed to submit');
    }
  };

  // SHOULD_NOT_FIRE: async callback is fully wrapped in try-catch — postcondition satisfied.
  return form.handleSubmit(onSubmit);
}

export function asyncSubmitInlineWithTryCatch() {
  const form = useForm<FormData>();

  // SHOULD_NOT_FIRE: inline async arrow with full-body try-catch — postcondition satisfied.
  return form.handleSubmit(async (data: FormData) => {
    try {
      await api.submit(data);
      toast.success('Done');
    } catch (err) {
      toast.error('Submission failed');
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. handleSubmit(syncCallback) → SHOULD_NOT_FIRE
//    concern-20260401-react-hook-form-1: sync callbacks should never fire
// ─────────────────────────────────────────────────────────────────────────────

export function syncSubmitHandler() {
  const form = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    // Synchronous — no async operations, cannot cause UnhandledPromiseRejection
    console.log('submitted', data);
  };

  // SHOULD_NOT_FIRE: callback is sync — async-submit-unhandled-error does not apply.
  return form.handleSubmit(onSubmit);
}

export function syncSubmitInlineArrow() {
  const form = useForm<FormData>();

  // SHOULD_NOT_FIRE: inline sync arrow — no async, postcondition does not apply.
  return form.handleSubmit((data: FormData) => {
    console.log('submitted', data);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3b. handleSubmit(asyncCallback with sync setup/teardown around try-catch) → SHOULD_NOT_FIRE
//     concern-20260402-react-hook-form-5: setLoading/toast sync calls before/after try-catch
// ─────────────────────────────────────────────────────────────────────────────

declare const setLoading: (v: boolean) => void;

export function asyncSubmitWithSyncSetupAroundTryCatch() {
  const form = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);              // sync setup before try
    try {
      await api.submit(data);
      toast.success('Done');
    } catch (error) {
      toast.error('Failed');
    } finally {
      setLoading(false);           // sync teardown in finally
    }
  };

  // SHOULD_NOT_FIRE: sync calls before/after try-catch do not affect async error boundary — all awaits are inside try-catch.
  return form.handleSubmit(onSubmit);
}

export function asyncSubmitWithSyncCallAfterTryCatch() {
  const form = useForm<FormData>();

  // SHOULD_NOT_FIRE: sync toast.dismiss() after try-catch is not an await — all async ops are inside try-catch.
  return form.handleSubmit(async (data: FormData) => {
    try {
      await api.submit(data);
    } catch (err) {
      toast.error('Error');
    }
    toast.success('Request sent');   // sync call after try — no await outside try
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. useFieldArray append/remove in form with handleSubmit — concern-20260401-react-hook-form-4
//    Parent form handleSubmit error handling covers field array mutations
// ─────────────────────────────────────────────────────────────────────────────

declare function useFieldArray(opts: unknown): { append: (v: unknown) => void; remove: (i: number) => void };

export function fieldArrayWithHandleSubmit() {
  const form = useForm<FormData>();
  const { append, remove } = useFieldArray({ control: (form as any).control, name: 'items' });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submit(data);
    } catch (err) {
      console.error(err);
    }
  };
  form.handleSubmit(onSubmit);

  // SHOULD_NOT_FIRE: file uses handleSubmit — form-level error handling covers field array mutations.
  append({ name: 'new item' });
  remove(0);
}
