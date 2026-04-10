# Sources — rxjs

## Official Documentation

- https://rxjs.dev/api/index/function/firstValueFrom — firstValueFrom API reference
- https://rxjs.dev/api/index/function/lastValueFrom — lastValueFrom API reference
- https://rxjs.dev/guide/observable — Observable notifications (next/error/complete)
- https://rxjs.dev/guide/operators — Error handling operators (catchError, retry)
- https://rxjs.dev/deprecations/to-promise — toPromise() deprecation notes

## Error Handling Guide

- https://rxjs.dev/guide/operators (error handling section)
- https://rxjs.dev/api/operators/catchError
- https://rxjs.dev/api/operators/retry

## Security Advisories

- https://github.com/ReactiveX/rxjs/security/advisories/GHSA-fpfv-jqm9-f5jm — CVE-2021-23438 Prototype Pollution (fixed in 6.6.7)

## Real-World Evidence

Observed in corpus:
- nestjs/nest — 15+ uses of `await lastValueFrom(...)` without try-catch in microservice controllers
- ionic-team/ionic-conference-app — `await firstValueFrom(...)` without try-catch
- apitable/apitable — `await lastValueFrom(...)` without try-catch
- getsentry/sentry-javascript — `await firstValueFrom(...)` without try-catch
- scullyio/scully — `await firstValueFrom(this.http.get(...))` without try-catch (HTTP error unhandled)
