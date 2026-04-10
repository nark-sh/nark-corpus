import { firstValueFrom, lastValueFrom, EMPTY } from "rxjs";

/**
 * Missing error handling for firstValueFrom.
 * Should trigger ERROR violation.
 */
async function badFirstValueNoTryCatch(source: any) {
  // ❌ No try-catch — if Observable errors, Promise rejects unhandled
  const value = await firstValueFrom(source);
  return value;
}

/**
 * EMPTY without defaultValue — will throw EmptyError.
 * Should trigger ERROR violation.
 */
async function badFirstValueEmpty() {
  // ❌ No defaultValue, EMPTY completes without emitting — throws EmptyError
  const value = await firstValueFrom(EMPTY);
  return value;
}

/**
 * Missing error handling for lastValueFrom.
 * Should trigger ERROR violation.
 */
async function badLastValueNoTryCatch(source: any) {
  // ❌ No try-catch — if Observable errors, Promise rejects unhandled
  const value = await lastValueFrom(source);
  return value;
}

/**
 * NestJS microservice pattern without error handling.
 * Should trigger ERROR violation.
 */
async function badMicroserviceCall(client: any) {
  // ❌ No try-catch — if microservice is down, throws unhandled
  const result = await lastValueFrom(client.send({ cmd: "sum" }, [1, 2, 3]));
  return result;
}
