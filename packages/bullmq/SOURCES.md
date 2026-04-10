# Sources: bullmq

**Package:** `bullmq`
**Version:** 5.70.1
**Category:** queue (Redis-based job queue and message queue)

---

## Official Documentation

**Homepage:** [https://bullmq.io/](https://bullmq.io/)
**Repository:** [https://github.com/taskforcesh/bullmq](https://github.com/taskforcesh/bullmq)
**npm:** [https://www.npmjs.com/package/bullmq](https://www.npmjs.com/package/bullmq)

### Key Documentation Sections

- **Quick Start:** [https://docs.bullmq.io/readme-1](https://docs.bullmq.io/readme-1)
- **Queues:** [https://docs.bullmq.io/guide/queues](https://docs.bullmq.io/guide/queues)
- **Workers:** [https://docs.bullmq.io/guide/workers](https://docs.bullmq.io/guide/workers)
- **Connections:** [https://docs.bullmq.io/guide/connections](https://docs.bullmq.io/guide/connections)
- **Retrying Failing Jobs:** [https://docs.bullmq.io/guide/retrying-failing-jobs](https://docs.bullmq.io/guide/retrying-failing-jobs)
- **Failing Fast When Redis is Down:** [https://docs.bullmq.io/patterns/failing-fast-when-redis-is-down](https://docs.bullmq.io/patterns/failing-fast-when-redis-is-down)
- **Going to Production:** [https://docs.bullmq.io/guide/going-to-production](https://docs.bullmq.io/guide/going-to-production)

---

## Behavioral Requirements

### Error Handling

**Redis Connection Errors:**
- Queue.add() can fail if Redis is down or connection is lost
- Must wrap Queue operations in try-catch blocks
- Use `enableOfflineQueue: false` to fail fast instead of queuing commands
- Set `maxRetriesPerRequest: 1` for faster failure detection

**Job Processing Errors:**
- Worker automatically moves jobs to "failed" status if processor throws
- Unhandled errors can cause worker to stop processing jobs
- Must handle errors in worker processor to keep queue running
- Default retry: 3 times, then moves to dead letter queue

**Error Events:**
- Attach handlers for `error` event on Queue and Worker instances
- Listen to `failed` event with `worker.on('failed', (job, err) => {...})`

**Sources:**
- [Workers Documentation](https://docs.bullmq.io/guide/workers)
- [Retrying Failing Jobs](https://docs.bullmq.io/guide/retrying-failing-jobs)
- [Failing Fast When Redis is Down](https://docs.bullmq.io/patterns/failing-fast-when-redis-is-down)

### Resource Management

**Connection Cleanup:**
- Every BullMQ class consumes at least one Redis connection
- Must call `.close()` on Queue and Worker instances to release connections
- Connection leaks can exhaust Redis max clients limit
- Cleanup is especially important in HTTP endpoints that create queues

**Connection Reuse:**
- Queue and Worker can accept existing ioredis instances
- QueueScheduler and QueueEvents require blocking connections (cannot reuse)
- Shared connections improve resource utilization

**Sources:**
- [Connections Documentation](https://docs.bullmq.io/guide/connections)
- [Going to Production](https://docs.bullmq.io/guide/going-to-production)

### Common Mistakes

**1. Not Handling Redis Disconnections:**
- Assuming Redis is always available
- Solution: Wrap Queue.add() in try-catch, handle connection errors

**2. Ignoring Worker Error Events:**
- Worker stops processing when error event is not handled
- Solution: Always attach error event handlers

**3. Not Closing Connections:**
- Creating Queue instances in HTTP endpoints without cleanup
- Solution: Reuse Queue instances or always call .close()

**4. Improper Error Handling in Processors:**
- Try-catch in processor prevents automatic retry mechanism
- Solution: Let errors throw naturally unless you need custom handling

**5. Missing Retry Configuration:**
- Not configuring retry attempts for critical jobs
- Solution: Set retry options when adding jobs

**Sources:**
- [Going to Production](https://docs.bullmq.io/guide/going-to-production)
- [Common Issues on GitHub](https://github.com/taskforcesh/bullmq/issues)

---

## CVE Analysis

**No known behavioral CVEs** as of 2026-02-25.

Checked: [CVE Database](https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=bullmq)

BullMQ is actively maintained with regular security updates. Primary risks are:
- Operational: Redis connection failures
- Misconfiguration: Improper error handling leading to queue blocking

---

## Real-World Examples

**Real-world examples of proper usage:**

1. **GitHub Code Search:** [bullmq examples](https://github.com/search?q=bullmq+try+catch&type=code)
2. **Official Examples:** [BullMQ Examples Repository](https://github.com/taskforcesh/bullmq/tree/master/docs/gitbook/guide)
3. **Medium Articles:** [Message Queue in Node.js with BullMQ and Redis](https://medium.com/@techsuneel99/message-queue-in-node-js-with-bullmq-and-redis-7fe5b8a21475)
4. **Production Patterns:** [How to Process Scheduled Queue Jobs](https://www.lirantal.com/blog/how-to-process-scheduled-queue-jobs-in-nodejs-with-bullmq-and-redis-on-heroku)

---

## Contract Rationale

**Why these contracts matter:**

### Problem Prevention

1. **Application Crashes from Redis Failures:**
   - Without error handling, Redis connection failures crash the entire application
   - Jobs queued via HTTP endpoints need immediate failure feedback
   - Contract ensures graceful degradation when Redis is unavailable

2. **Queue Blocking from Worker Errors:**
   - Unhandled errors in worker processors can stop the entire queue
   - Other jobs wait indefinitely while worker is stuck
   - Contract ensures workers handle errors and continue processing

3. **Connection Leaks:**
   - Creating Queue/Worker instances in HTTP endpoints without cleanup
   - Exhausts Redis connection pool over time
   - Contract enforces proper connection management

### Consequences of Violations

**Severity: ERROR (Redis Connection Failures)**
- **Impact:** Immediate application crash
- **Frequency:** Common in production (network issues, Redis restarts)
- **Cost:** Service outages, lost user requests
- **Example:** HTTP endpoint creating queue without try-catch → 500 error cascade

**Severity: WARNING (Worker Error Handling)**
- **Impact:** Queue stops processing, jobs pile up
- **Frequency:** Moderate (depends on job complexity)
- **Cost:** Delayed processing, SLA violations
- **Example:** Email worker crashes → thousands of undelivered emails

**Severity: WARNING (Connection Cleanup)**
- **Impact:** Gradual resource exhaustion
- **Frequency:** High in microservices with many queue instances
- **Cost:** Redis connection limit reached, new connections fail
- **Example:** 1000 requests/minute × unclosed connections → Redis maxed out in 10 minutes

### Why Critical for Production

BullMQ is typically used for:
- **Critical background jobs** (payments, emails, notifications)
- **High-throughput systems** (thousands of jobs per minute)
- **Distributed systems** (multiple workers, multiple queues)
- **User-facing features** (job status tracking, real-time updates)

Production characteristics:
- **Redis failures are inevitable** (network issues, maintenance, scaling)
- **Worker errors will happen** (external API failures, data issues)
- **Connection management at scale** (100+ instances in microservices)

Without these contracts:
- ❌ Application becomes fragile to Redis issues
- ❌ Queue processing can halt unexpectedly
- ❌ Resource leaks degrade system over time
- ❌ Recovery requires manual intervention

With these contracts:
- ✅ Graceful degradation during Redis failures
- ✅ Workers continue processing despite individual job errors
- ✅ Clean resource management at scale
- ✅ Self-healing system design

---

**Created:** 2026-02-25
**Status:** ✅ COMPLETE - Ready for production use
