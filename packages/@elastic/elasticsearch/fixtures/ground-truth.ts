/**
 * @elastic/elasticsearch Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the @elastic/elasticsearch contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - All contracted methods make HTTP requests and can throw ResponseError, ConnectionError, or TimeoutError
 *   - postcondition: api-error at severity:error requires a try-catch wrapper
 *   - try-finally WITHOUT catch does NOT satisfy the requirement
 *   - A .catch() chain on the promise SATISFIES the requirement
 *   - All methods are accessed via a Client instance (new Client(...))
 *
 * Contracted functions (all on Client class from '@elastic/elasticsearch'):
 *   - client.search()              postcondition: api-error
 *   - client.index()               postcondition: api-error
 *   - client.get()                 postcondition: api-error
 *   - client.delete()              postcondition: api-error
 *   - client.update()              postcondition: api-error
 *   - client.bulk()                postcondition: api-error
 *   - client.count()               postcondition: api-error
 *   - client.scroll()              postcondition: api-error
 *   - client.mget()                postconditions: mget-found-not-checked, mget-api-error
 *   - client.create()              postcondition: create-api-error (409 on duplicate ID)
 *   - client.deleteByQuery()       postconditions: deletebyquery-failures-not-checked, deletebyquery-api-error
 *   - client.updateByQuery()       postconditions: updatebyquery-failures-not-checked, updatebyquery-api-error
 *   - client.helpers.bulk()        postconditions: helpers-bulk-ondrop-not-provided, helpers-bulk-api-error
 *   - client.exists()              postcondition: exists-api-error
 *   - client.openPointInTime()     postconditions: openpit-api-error, openpit-not-closed
 *   - client.close()               postcondition: close-api-error
 *   - client.msearch()             postconditions: msearch-per-search-error-not-checked, msearch-api-error
 *   - client.closePointInTime()    postconditions: closepit-not-called, closepit-api-error
 *   - client.clearScroll()         postconditions: clearscroll-not-called, clearscroll-api-error
 *   - client.reindex()             postconditions: reindex-failures-not-checked, reindex-api-error
 *   - client.esql.query()          postconditions: esql-query-syntax-error, esql-query-api-error
 *   - client.helpers.scrollSearch() postcondition: helpers-scrollsearch-not-in-try-catch
 */

import { Client, errors } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200',
  auth: { apiKey: 'test-key' },
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. search() — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function searchNoCatch(indexName: string) {
  // SHOULD_FIRE: api-error — client.search makes HTTP request, no try-catch
  const result = await client.search({ index: indexName, query: { match_all: {} } });
  return result.hits.hits;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. search() — inside try-catch, no violation
// ─────────────────────────────────────────────────────────────────────────────

export async function searchWithCatch(indexName: string) {
  try {
    // SHOULD_NOT_FIRE: client.search inside try-catch satisfies api-error requirement
    const result = await client.search({ index: indexName, query: { match_all: {} } });
    return result.hits.hits;
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      console.error('Search failed:', err.meta.statusCode);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. search() — try-finally without catch, violation fires
// ─────────────────────────────────────────────────────────────────────────────

export async function searchTryFinallyNoCatch(indexName: string) {
  try {
    // SHOULD_FIRE: api-error — try-finally has no catch clause, error propagates uncaught
    const result = await client.search({ index: indexName, query: { match_all: {} } });
    return result.hits.hits;
  } finally {
    console.log('search complete');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. search() — with .catch() chain, satisfies requirement
// ─────────────────────────────────────────────────────────────────────────────

export function searchWithCatchChain(indexName: string) {
  // SHOULD_NOT_FIRE: .catch() chain satisfies error handling requirement
  return client.search({ index: indexName, query: { match_all: {} } })
    .catch(err => {
      console.error('Search error:', err);
      throw err;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. index() — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function indexNoCatch(id: string, doc: object) {
  // SHOULD_FIRE: api-error — client.index makes HTTP request, no try-catch
  const result = await client.index({ index: 'my-index', id, document: doc });
  return result._id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. index() — inside try-catch, no violation
// ─────────────────────────────────────────────────────────────────────────────

export async function indexWithCatch(id: string, doc: object) {
  try {
    // SHOULD_NOT_FIRE: client.index inside try-catch satisfies api-error requirement
    const result = await client.index({ index: 'my-index', id, document: doc });
    return result._id;
  } catch (err) {
    console.error('Index failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. get() — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function getNoCatch(id: string) {
  // SHOULD_FIRE: api-error — client.get throws ResponseError(404) when doc absent, no try-catch
  const doc = await client.get({ index: 'my-index', id });
  return doc._source;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. get() — inside try-catch, no violation
// ─────────────────────────────────────────────────────────────────────────────

export async function getWithCatch(id: string) {
  try {
    // SHOULD_NOT_FIRE: client.get inside try-catch satisfies api-error requirement
    const doc = await client.get({ index: 'my-index', id });
    return doc._source;
  } catch (err) {
    if (err instanceof errors.ResponseError && err.meta.statusCode === 404) {
      return null;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. delete() — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteNoCatch(id: string) {
  // SHOULD_FIRE: api-error — client.delete throws on 404 and network errors, no try-catch
  await client.delete({ index: 'my-index', id });
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. delete() — inside try-catch, no violation
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteWithCatch(id: string) {
  try {
    // SHOULD_NOT_FIRE: client.delete inside try-catch satisfies api-error requirement
    await client.delete({ index: 'my-index', id });
  } catch (err) {
    if (err instanceof errors.ResponseError && err.meta.statusCode === 404) {
      return; // Idempotent delete
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. update() — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function updateNoCatch(id: string, partialDoc: object) {
  // SHOULD_FIRE: api-error — client.update throws on 404/409 and network errors, no try-catch
  const result = await client.update({ index: 'my-index', id, doc: partialDoc });
  return result.result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. update() — inside try-catch, no violation
// ─────────────────────────────────────────────────────────────────────────────

export async function updateWithCatch(id: string, partialDoc: object) {
  try {
    // SHOULD_NOT_FIRE: client.update inside try-catch satisfies api-error requirement
    const result = await client.update({ index: 'my-index', id, doc: partialDoc });
    return result.result;
  } catch (err) {
    console.error('Update failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. bulk() — bare call, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function bulkNoCatch(docs: object[]) {
  const operations = docs.flatMap(doc => [{ index: { _index: 'my-index' } }, doc]);
  // SHOULD_FIRE: api-error — client.bulk throws on connection/HTTP failure, no try-catch
  const response = await client.bulk({ operations });
  return response.items.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. bulk() — inside try-catch, no violation
// ─────────────────────────────────────────────────────────────────────────────

export async function bulkWithCatch(docs: object[]) {
  const operations = docs.flatMap(doc => [{ index: { _index: 'my-index' } }, doc]);
  try {
    // SHOULD_NOT_FIRE: client.bulk inside try-catch satisfies api-error requirement
    const response = await client.bulk({ operations });
    if (response.errors) {
      console.warn('Some bulk operations failed');
    }
    return response.items.length;
  } catch (err) {
    console.error('Bulk failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. mget() — bare call, no try-catch, found not checked
// ─────────────────────────────────────────────────────────────────────────────

export async function mgetNoCatch(ids: string[]) {
  // SHOULD_FIRE: mget-api-error — client.mget makes HTTP request, no try-catch
  const result = await client.mget({ index: 'my-index', ids });
  // SHOULD_FIRE: mget-found-not-checked — result.docs[].found not checked
  return result.docs.map((doc: any) => doc._source);
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. mget() — with try-catch and found check, satisfies both postconditions
// ─────────────────────────────────────────────────────────────────────────────

export async function mgetWithCatchAndFoundCheck(ids: string[]) {
  try {
    // SHOULD_NOT_FIRE: client.mget inside try-catch satisfies mget-api-error
    const result = await client.mget({ index: 'my-index', ids });
    // SHOULD_NOT_FIRE: found checked before accessing _source
    return result.docs
      .filter((doc: any) => doc.found)
      .map((doc: any) => doc._source);
  } catch (err) {
    console.error('mget failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. create() — bare call, no try-catch (409 conflict uncaught)
// ─────────────────────────────────────────────────────────────────────────────

export async function createNoCatch(id: string, doc: object) {
  // SHOULD_FIRE: create-api-error — client.create throws 409 on duplicate, no try-catch
  const result = await client.create({ index: 'my-index', id, document: doc });
  return result._id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. create() — with try-catch handling 409 conflict
// ─────────────────────────────────────────────────────────────────────────────

export async function createWithCatch(id: string, doc: object) {
  try {
    // SHOULD_NOT_FIRE: client.create inside try-catch satisfies create-api-error
    const result = await client.create({ index: 'my-index', id, document: doc });
    return result._id;
  } catch (err) {
    if (err instanceof errors.ResponseError && err.meta.statusCode === 409) {
      // Document already exists — idempotent create pattern
      return id;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. deleteByQuery() — no try-catch, failures not checked
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteByQueryNoCatch(field: string, value: string) {
  // SHOULD_FIRE: deletebyquery-api-error — no try-catch
  // SHOULD_FIRE: deletebyquery-failures-not-checked — response.failures not checked
  const response = await client.deleteByQuery({
    index: 'my-index',
    query: { term: { [field]: value } },
  });
  return response.deleted;
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. deleteByQuery() — with try-catch and failures check
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteByQueryWithCatch(field: string, value: string) {
  try {
    // SHOULD_NOT_FIRE: deletebyquery-api-error satisfied by try-catch
    const response = await client.deleteByQuery({
      index: 'my-index',
      query: { term: { [field]: value } },
    });
    // SHOULD_NOT_FIRE: deletebyquery-failures-not-checked — failures checked
    if (response.failures && response.failures.length > 0) {
      console.error('Some deletions failed:', response.failures);
    }
    return response.deleted;
  } catch (err) {
    console.error('deleteByQuery failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. updateByQuery() — no try-catch, failures not checked
// ─────────────────────────────────────────────────────────────────────────────

export async function updateByQueryNoCatch(field: string, value: string, newValue: string) {
  // SHOULD_FIRE: updatebyquery-api-error — no try-catch
  // SHOULD_FIRE: updatebyquery-failures-not-checked — response.failures not checked
  const response = await client.updateByQuery({
    index: 'my-index',
    script: { source: `ctx._source.${field} = params.value`, params: { value: newValue } },
    query: { term: { [field]: value } },
  });
  return response.updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. updateByQuery() — with try-catch and failures check
// ─────────────────────────────────────────────────────────────────────────────

export async function updateByQueryWithCatch(field: string, value: string, newValue: string) {
  try {
    // SHOULD_NOT_FIRE: updatebyquery-api-error satisfied by try-catch
    const response = await client.updateByQuery({
      index: 'my-index',
      script: { source: `ctx._source.${field} = params.value`, params: { value: newValue } },
      query: { term: { [field]: value } },
    });
    // SHOULD_NOT_FIRE: updatebyquery-failures-not-checked — failures checked
    if (response.failures && response.failures.length > 0) {
      console.error('Some updates failed:', response.failures);
    }
    return response.updated;
  } catch (err) {
    console.error('updateByQuery failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. helpers.bulk() — no onDrop handler (silent document loss)
// ─────────────────────────────────────────────────────────────────────────────

export async function helpersBulkNoDrop(docs: object[]) {
  // SHOULD_FIRE: helpers-bulk-ondrop-not-provided — no onDrop callback
  // SHOULD_FIRE: helpers-bulk-api-error — no try-catch for connection errors
  const stats = await client.helpers.bulk({
    datasource: docs,
    onDocument: (doc: any) => ({ index: { _index: 'my-index' } }),
  });
  return stats.successful;
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. helpers.bulk() — with onDrop and try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function helpersBulkWithDrop(docs: object[]) {
  const dropped: object[] = [];
  try {
    // SHOULD_NOT_FIRE: helpers-bulk-api-error satisfied by try-catch
    // SHOULD_NOT_FIRE: helpers-bulk-ondrop-not-provided — onDrop provided
    const stats = await client.helpers.bulk({
      datasource: docs,
      onDocument: (doc: any) => ({ index: { _index: 'my-index' } }),
      onDrop: (droppedDoc: any) => {
        dropped.push(droppedDoc.document);
        console.error('Document dropped:', droppedDoc.error);
      },
    });
    if (stats.failed > 0) {
      console.error(`${stats.failed} documents dropped permanently`);
    }
    return { successful: stats.successful, failed: stats.failed, dropped };
  } catch (err) {
    console.error('helpers.bulk connection error:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 25. exists() — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function existsNoCatch(id: string) {
  // SHOULD_FIRE: exists-api-error — no try-catch for connection/auth errors
  const docExists = await client.exists({ index: 'my-index', id });
  return docExists;
}

// ─────────────────────────────────────────────────────────────────────────────
// 26. exists() — with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function existsWithCatch(id: string) {
  try {
    // SHOULD_NOT_FIRE: exists-api-error satisfied by try-catch
    const docExists = await client.exists({ index: 'my-index', id });
    return docExists;
  } catch (err) {
    console.error('exists check failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 27. openPointInTime() — no try-catch, not closed
// ─────────────────────────────────────────────────────────────────────────────

export async function openPitNoCatch() {
  // SHOULD_FIRE: openpit-api-error — no try-catch
  // SHOULD_FIRE: openpit-not-closed — PIT never closed with closePointInTime()
  const { id: pitId } = await client.openPointInTime({ index: 'my-index', keep_alive: '1m' });
  const result = await client.search({
    pit: { id: pitId, keep_alive: '1m' },
    query: { match_all: {} },
  });
  return result.hits.hits;
}

// ─────────────────────────────────────────────────────────────────────────────
// 28. openPointInTime() — with try-catch and finally close
// ─────────────────────────────────────────────────────────────────────────────

export async function openPitWithClose() {
  let pitId: string | undefined;
  try {
    // SHOULD_NOT_FIRE: openpit-api-error satisfied by try-catch
    const pitResponse = await client.openPointInTime({ index: 'my-index', keep_alive: '1m' });
    pitId = pitResponse.id;
    const result = await client.search({
      pit: { id: pitId, keep_alive: '1m' },
      query: { match_all: {} },
    });
    return result.hits.hits;
  } catch (err) {
    console.error('PIT search failed:', err);
    throw err;
  } finally {
    // SHOULD_NOT_FIRE: openpit-not-closed — PIT closed in finally block
    if (pitId) {
      await client.closePointInTime({ id: pitId }).catch(console.error);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 29. msearch() — no try-catch, per-search errors not checked
// ─────────────────────────────────────────────────────────────────────────────

export async function msearchNoCatch() {
  // SHOULD_FIRE: msearch-api-error — no try-catch for connection errors
  // SHOULD_FIRE: msearch-per-search-error-not-checked — responses[] not inspected for errors
  const response = await client.msearch({
    searches: [
      { index: 'products' }, { query: { match: { name: 'shoe' } } },
      { index: 'orders' }, { query: { match: { status: 'pending' } } },
    ] as any,
  });
  return response.responses.map((r: any) => r.hits?.hits ?? []);
}

// ─────────────────────────────────────────────────────────────────────────────
// 30. msearch() — with try-catch and per-search error check
// ─────────────────────────────────────────────────────────────────────────────

export async function msearchWithCatchAndErrorCheck() {
  try {
    // SHOULD_NOT_FIRE: msearch-api-error satisfied by try-catch
    const response = await client.msearch({
      searches: [
        { index: 'products' }, { query: { match: { name: 'shoe' } } },
        { index: 'orders' }, { query: { match: { status: 'pending' } } },
      ] as any,
    });
    // SHOULD_NOT_FIRE: msearch-per-search-error-not-checked — error field checked per response
    const results: any[] = [];
    for (const result of response.responses) {
      if ('error' in result) {
        console.error('Search failed:', (result as any).status, (result as any).error.type);
      } else {
        results.push((result as any).hits.hits);
      }
    }
    return results;
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      console.error('msearch failed:', err.meta.statusCode);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 31. closePointInTime() — not called in finally (PIT leak)
// ─────────────────────────────────────────────────────────────────────────────

export async function pitNotClosed() {
  // SHOULD_FIRE: closepit-not-called — openPointInTime used but no closePointInTime in finally
  const { id: pitId } = await client.openPointInTime({ index: 'my-index', keep_alive: '1m' });
  try {
    const result = await client.search({
      pit: { id: pitId, keep_alive: '1m' },
      query: { match_all: {} },
      sort: [{ _shard_doc: 'asc' } as any],
    });
    return result.hits.hits;
  } catch (err) {
    // closePointInTime not called on error path — PIT leaks
    throw err;
  }
  // closePointInTime not called on success path — PIT leaks
}

// ─────────────────────────────────────────────────────────────────────────────
// 32. closePointInTime() — properly called in finally
// ─────────────────────────────────────────────────────────────────────────────

export async function pitProperlyClosedInFinally() {
  let pitId: string | undefined;
  try {
    const pitResponse = await client.openPointInTime({ index: 'my-index', keep_alive: '1m' });
    pitId = pitResponse.id;
    const result = await client.search({
      pit: { id: pitId, keep_alive: '1m' },
      query: { match_all: {} },
      sort: [{ _shard_doc: 'asc' } as any],
    });
    return result.hits.hits;
  } catch (err) {
    throw err;
  } finally {
    // SHOULD_NOT_FIRE: closepit-not-called — closed in finally
    if (pitId) {
      try {
        await client.closePointInTime({ id: pitId });
      } catch (closeErr) {
        console.error('Failed to close PIT:', closeErr);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 33. clearScroll() — scroll used without clearScroll
// ─────────────────────────────────────────────────────────────────────────────

export async function scrollNoClear() {
  // SHOULD_FIRE: clearscroll-not-called — scroll context never cleared after pagination
  const initialResponse = await client.search({ index: 'my-index', scroll: '1m', size: 100, query: { match_all: {} } });
  let scrollId = initialResponse._scroll_id!;
  const allDocs = [...initialResponse.hits.hits];

  while (true) {
    const response = await client.scroll({ scroll_id: scrollId, scroll: '1m' });
    scrollId = response._scroll_id!;
    if (!response.hits.hits.length) break;
    allDocs.push(...response.hits.hits);
  }
  // clearScroll not called — scroll context leaks
  return allDocs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 34. clearScroll() — scroll used with clearScroll in finally
// ─────────────────────────────────────────────────────────────────────────────

export async function scrollWithClear() {
  let scrollId: string | undefined;
  try {
    const initialResponse = await client.search({ index: 'my-index', scroll: '1m', size: 100, query: { match_all: {} } });
    scrollId = initialResponse._scroll_id;
    const allDocs = [...initialResponse.hits.hits];

    while (true) {
      const response = await client.scroll({ scroll_id: scrollId, scroll: '1m' });
      scrollId = response._scroll_id;
      if (!response.hits.hits.length) break;
      allDocs.push(...response.hits.hits);
    }
    return allDocs;
  } catch (err) {
    throw err;
  } finally {
    // SHOULD_NOT_FIRE: clearscroll-not-called — cleared in finally
    if (scrollId) {
      try {
        await client.clearScroll({ scroll_id: scrollId });
      } catch (err) {
        console.error('Failed to clear scroll:', err);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 35. reindex() — no try-catch, failures not checked
// ─────────────────────────────────────────────────────────────────────────────

export async function reindexNoCatch() {
  // SHOULD_FIRE: reindex-api-error — no try-catch
  // SHOULD_FIRE: reindex-failures-not-checked — response.failures not checked
  const response = await client.reindex({
    source: { index: 'old-index' },
    dest: { index: 'new-index' },
    conflicts: 'proceed',
  });
  return response.created;
}

// ─────────────────────────────────────────────────────────────────────────────
// 36. reindex() — with try-catch and failures check
// ─────────────────────────────────────────────────────────────────────────────

export async function reindexWithCatchAndFailureCheck() {
  try {
    // SHOULD_NOT_FIRE: reindex-api-error satisfied by try-catch
    const response = await client.reindex({
      source: { index: 'old-index' },
      dest: { index: 'new-index' },
      conflicts: 'proceed',
    });
    // SHOULD_NOT_FIRE: reindex-failures-not-checked — failures checked
    if (response.failures && response.failures.length > 0) {
      console.error(`Reindex had ${response.failures.length} failures`);
      for (const failure of response.failures) {
        console.error('Failed doc:', (failure as any).id);
      }
    }
    return { created: response.created, failures: response.failures?.length ?? 0 };
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      console.error('Reindex failed:', err.meta.statusCode);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 37. esql.query() — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function esqlQueryNoCatch() {
  // SHOULD_FIRE: esql-query-syntax-error — no try-catch for syntax/400 errors
  // SHOULD_FIRE: esql-query-api-error — no try-catch for connection errors
  const response = await client.esql.query({
    query: 'FROM logs-* | WHERE @timestamp > NOW() - 1 hour | LIMIT 100',
  });
  return response.values;
}

// ─────────────────────────────────────────────────────────────────────────────
// 38. esql.query() — with try-catch handling syntax and auth errors
// ─────────────────────────────────────────────────────────────────────────────

export async function esqlQueryWithCatch() {
  try {
    // SHOULD_NOT_FIRE: esql-query-syntax-error satisfied by try-catch
    // SHOULD_NOT_FIRE: esql-query-api-error satisfied by try-catch
    const response = await client.esql.query({
      query: 'FROM logs-* | WHERE @timestamp > NOW() - 1 hour | LIMIT 100',
    });
    return response.values;
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      if (err.meta.statusCode === 400) {
        console.error('ES|QL syntax error:', err.meta.body);
      } else if (err.meta.statusCode === 403) {
        console.error('Missing index read privilege');
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 39. helpers.scrollSearch() — for-await loop without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function helpersScrollSearchNoCatch() {
  const allDocs: any[] = [];
  // SHOULD_FIRE: helpers-scrollsearch-not-in-try-catch — loop not wrapped in try-catch
  for await (const result of client.helpers.scrollSearch({ index: 'my-index', size: 100 })) {
    allDocs.push(...result.documents);
  }
  return allDocs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 40. helpers.scrollSearch() — for-await loop with try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function helpersScrollSearchWithCatch() {
  const allDocs: any[] = [];
  try {
    // SHOULD_NOT_FIRE: helpers-scrollsearch-not-in-try-catch satisfied by try-catch wrapper
    for await (const result of client.helpers.scrollSearch({ index: 'my-index', size: 100 })) {
      allDocs.push(...result.documents);
    }
  } catch (err) {
    if (err instanceof errors.ResponseError) {
      console.error('Scroll search failed:', err.meta.statusCode);
    }
    throw err;
  }
  return allDocs;
}
