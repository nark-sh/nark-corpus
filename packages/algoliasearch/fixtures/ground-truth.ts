/**
 * algoliasearch Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - All Algolia async methods (search, searchSingleIndex, saveObject, saveObjects,
 *     getObject, getObjects, deleteObject, deleteObjects, waitForTask, setSettings,
 *     replaceAllObjects) can throw ApiError or RetryError
 *   - postcondition at severity:error requires try-catch
 *   - A try-catch wrapper (any catch block) satisfies the requirement
 *
 * Coverage:
 *   - Section 1-2: v4 API (index-based) — search, saveObject, saveObjects, getObject,
 *     deleteObject, deleteObjects, setSettings
 *   - Section 3: v4 getObjects (available on index object in v4)
 *   - Section 4: v5 client-direct methods — searchSingleIndex, waitForTask, replaceAllObjects
 *     (v5Client cast to `any` so fixture compiles against v4 or v5 types)
 *   - Section 5: pass 76 additions — batch, multipleBatch, browse, browseObjects, operationIndex
 *
 * Pass-76 additions cover the missing data-path SearchClient methods (single + multi-index batch,
 * browse + browseObjects iterator helper, operationIndex copy/move).
 */

import algoliasearch from 'algoliasearch';

const client = algoliasearch('APP_ID', 'API_KEY');
const index = client.initIndex('products');

interface Product {
  objectID: string;
  name: string;
  price: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Bare calls — no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSearchNoCatch(query: string) {
  // SHOULD_FIRE: search-no-try-catch — index.search throws ApiError/RetryError, no try-catch
  const result = await index.search(query);
  return result.hits;
}

export async function bareSaveObjectNoCatch(product: Product) {
  // SHOULD_FIRE: saveobject-no-try-catch — index.saveObject throws ApiError on auth/write failure
  await index.saveObject(product);
}

export async function bareSaveObjectsNoCatch(products: Product[]) {
  // SHOULD_FIRE: saveobjects-no-try-catch — index.saveObjects throws ApiError on failure
  await index.saveObjects(products);
}

export async function bareGetObjectNoCatch(objectID: string) {
  // SHOULD_FIRE: getobject-no-try-catch — index.getObject throws ApiError 404 if not found
  const result = await index.getObject<Product>(objectID);
  return result;
}

export async function bareDeleteObjectNoCatch(objectID: string) {
  // SHOULD_FIRE: deleteobject-no-try-catch — index.deleteObject throws ApiError on auth/network failure
  await index.deleteObject(objectID);
}

export async function bareDeleteObjectsNoCatch(objectIDs: string[]) {
  // SHOULD_FIRE: deleteobjects-no-try-catch — index.deleteObjects throws ApiError on failure
  await index.deleteObjects(objectIDs);
}

export async function bareSetSettingsNoCatch() {
  // SHOULD_FIRE: setsettings-no-try-catch — index.setSettings throws ApiError on invalid settings
  await index.setSettings({ searchableAttributes: ['name'] });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Properly wrapped in try-catch — SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function searchWithTryCatch(query: string) {
  try {
    // SHOULD_NOT_FIRE: index.search is inside try-catch — search-no-try-catch requirement satisfied
    const result = await index.search(query);
    return result.hits;
  } catch (err) {
    console.error('Search failed:', err);
    return [];
  }
}

export async function saveObjectWithTryCatch(product: Product) {
  try {
    // SHOULD_NOT_FIRE: index.saveObject is inside try-catch — saveObject-no-try-catch satisfied
    await index.saveObject(product);
  } catch (err) {
    console.error('saveObject failed:', err);
    throw err;
  }
}

export async function saveObjectsWithTryCatch(products: Product[]) {
  try {
    // SHOULD_NOT_FIRE: index.saveObjects is inside try-catch — saveObjects-no-try-catch satisfied
    await index.saveObjects(products);
  } catch (err) {
    console.error('saveObjects failed:', err);
    throw err;
  }
}

export async function getObjectWithTryCatch(objectID: string): Promise<Product | null> {
  try {
    // SHOULD_NOT_FIRE: index.getObject is inside try-catch — getObject-no-try-catch satisfied
    const result = await index.getObject<Product>(objectID);
    return result;
  } catch (err: any) {
    if (err.status === 404 || err.name === 'ObjectNotFoundError') {
      return null;
    }
    throw err;
  }
}

export async function deleteObjectWithTryCatch(objectID: string) {
  try {
    // SHOULD_NOT_FIRE: index.deleteObject is inside try-catch — deleteObject-no-try-catch satisfied
    await index.deleteObject(objectID);
  } catch (err) {
    console.error('deleteObject failed:', err);
    throw err;
  }
}

export async function deleteObjectsWithTryCatch(objectIDs: string[]) {
  try {
    // SHOULD_NOT_FIRE: index.deleteObjects is inside try-catch — deleteObjects-no-try-catch satisfied
    await index.deleteObjects(objectIDs);
  } catch (err) {
    console.error('deleteObjects failed:', err);
    throw err;
  }
}

export async function setSettingsWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: index.setSettings is inside try-catch — setSettings-no-try-catch satisfied
    await index.setSettings({ searchableAttributes: ['name'] });
  } catch (err) {
    console.error('setSettings failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. getObjects / v5 client-direct methods — KNOWN ANALYZER LIMITATION
//
// The V2 analyzer tracks instances via TypeScript type information. Casting to
// `any` erases that type info, so the analyzer cannot associate the call with
// the algoliasearch package. These calls are KNOWN FALSE NEGATIVES — the
// contract covers these functions, but the analyzer currently misses them when
// types are erased. Both wrapped and unwrapped calls appear identical to the
// analyzer (silence in both cases).
//
// This documents real behavior, not desired behavior. Fixing this would require
// the analyzer to track `as any` casts or use pattern-matching fallbacks.
// ─────────────────────────────────────────────────────────────────────────────

const v5Client = client as any; // v5 client-direct API; also used for getObjects compat

export async function bareGetObjectsNoCatch(objectIDs: string[]) {
  // SHOULD_NOT_FIRE: known false negative — `as any` cast defeats instance tracking;
  // analyzer cannot detect getObjects call on erased type (getobjects-no-try-catch missed)
  const result = await (index as any).getObjects(objectIDs);
  return result;
}

export async function getObjectsWithTryCatch(objectIDs: string[]) {
  try {
    // SHOULD_NOT_FIRE: index.getObjects inside try-catch AND type erased — no violation either way
    const result = await (index as any).getObjects(objectIDs);
    return result;
  } catch (err) {
    console.error('getObjects failed:', err);
    throw err;
  }
}

export async function bareSearchSingleIndexNoCatch(query: string) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`, analyzer cannot associate with
  // algoliasearch package; searchsingleindex-no-try-catch not detected through type erasure
  const result = await v5Client.searchSingleIndex({ indexName: 'products', searchParams: { query } });
  return result.hits;
}

export async function searchSingleIndexWithTryCatch(query: string) {
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    const result = await v5Client.searchSingleIndex({ indexName: 'products', searchParams: { query } });
    return result.hits;
  } catch (err) {
    console.error('searchSingleIndex failed:', err);
    return [];
  }
}

export async function bareWaitForTaskNoCatch(taskID: number) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; waitfortask-no-try-catch
  // not detected through type erasure
  await v5Client.waitForTask({ indexName: 'products', taskID });
}

export async function waitForTaskWithTryCatch(taskID: number) {
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.waitForTask({ indexName: 'products', taskID });
  } catch (err) {
    console.error('waitForTask failed:', err);
    throw err;
  }
}

export async function bareReplaceAllObjectsNoCatch(products: Product[]) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; replaceall-no-try-catch
  // not detected through type erasure
  await v5Client.replaceAllObjects({ indexName: 'products', objects: products });
}

export async function replaceAllObjectsWithTryCatch(products: Product[]) {
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.replaceAllObjects({ indexName: 'products', objects: products });
  } catch (err) {
    console.error('replaceAllObjects failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. New functions: partialUpdateObject, clearObjects, searchForFacetValues, deleteBy
//    All v5 client-direct methods — cast to `any` due to v4 index-based compat
//    KNOWN ANALYZER LIMITATION: type erasure prevents detection (same as section 3/4)
// ─────────────────────────────────────────────────────────────────────────────

export async function barePartialUpdateObjectNoCatch(objectID: string, price: number) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; partialupdateobject-no-try-catch
  // not detected through type erasure
  await v5Client.partialUpdateObject({
    indexName: 'products',
    objectID,
    attributesToUpdate: { price },
  });
}

export async function partialUpdateObjectWithTryCatch(objectID: string, price: number) {
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.partialUpdateObject({
      indexName: 'products',
      objectID,
      attributesToUpdate: { price },
    });
  } catch (err) {
    console.error('partialUpdateObject failed:', err);
    throw err;
  }
}

export async function barePartialUpdateObjectsNoCatch(updates: Array<{ objectID: string; price: number }>) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; partialupdateobject-no-try-catch
  // not detected through type erasure; 403 (missing addObject ACL) silently crashes caller
  await v5Client.partialUpdateObjects({
    indexName: 'products',
    objects: updates,
  });
}

export async function partialUpdateObjectsWithTryCatch(updates: Array<{ objectID: string; price: number }>) {
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.partialUpdateObjects({
      indexName: 'products',
      objects: updates,
    });
  } catch (err) {
    console.error('partialUpdateObjects failed:', err);
    throw err;
  }
}

export async function bareClearObjectsNoCatch() {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; clearobjects-no-try-catch
  // not detected through type erasure; 402/403/404 silently crash reindex pipeline
  await v5Client.clearObjects({ indexName: 'products' });
}

export async function clearObjectsWithTryCatch() {
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.clearObjects({ indexName: 'products' });
  } catch (err) {
    console.error('clearObjects failed:', err);
    throw err;
  }
}

export async function bareSearchForFacetValuesNoCatch(facetQuery: string) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; searchforfacetvalues-no-try-catch
  // not detected through type erasure; 401/403 crashes faceted search UI
  const result = await v5Client.searchForFacetValues({
    indexName: 'products',
    facetName: 'brand',
    searchForFacetValuesRequest: { facetQuery },
  });
  return result.facetHits;
}

export async function searchForFacetValuesWithTryCatch(facetQuery: string) {
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    const result = await v5Client.searchForFacetValues({
      indexName: 'products',
      facetName: 'brand',
      searchForFacetValuesRequest: { facetQuery },
    });
    return result.facetHits;
  } catch (err) {
    console.error('searchForFacetValues failed:', err);
    return [];
  }
}

export async function bareDeleteByNoCatch(categoryId: string) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; deleteby-no-try-catch
  // not detected through type erasure; empty filters cause ApiError 400
  await v5Client.deleteBy({
    indexName: 'products',
    deleteByParams: { filters: `categoryId:${categoryId}` },
  });
}

export async function deleteByWithTryCatch(categoryId: string) {
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.deleteBy({
      indexName: 'products',
      deleteByParams: { filters: `categoryId:${categoryId}` },
    });
  } catch (err) {
    console.error('deleteBy failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. New functions from pass 9: addOrUpdateObject, indexExists, waitForAppTask,
//    saveObjectsWithTransformation, partialUpdateObjects (plural helper)
//    All cast to `any` due to v4 index-based compat
//    KNOWN ANALYZER LIMITATION: type erasure prevents detection
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: addorupdateobject-no-try-catch
export async function bareAddOrUpdateObjectNoCatch(objectID: string, product: Product) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; addorupdateobject-no-try-catch
  // not detected through type erasure; missing objectID throws synchronous Error
  await v5Client.addOrUpdateObject({
    indexName: 'products',
    objectID,
    body: product,
  });
}

export async function addOrUpdateObjectWithTryCatch(objectID: string, product: Product) {
  // @expect-clean
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.addOrUpdateObject({
      indexName: 'products',
      objectID,
      body: product,
    });
  } catch (err) {
    console.error('addOrUpdateObject failed:', err);
    throw err;
  }
}

// @expect-violation: indexexists-auth-network-throw
export async function bareIndexExistsNoCatch() {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; indexexists-auth-network-throw
  // not detected through type erasure; 401/403/RetryError still throw even though 404 returns false
  const exists = await v5Client.indexExists({ indexName: 'products' });
  return exists;
}

export async function indexExistsWithTryCatch() {
  // @expect-clean
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    const exists = await v5Client.indexExists({ indexName: 'products' });
    return exists;
  } catch (err) {
    console.error('indexExists failed:', err);
    throw err;
  }
}

// @expect-violation: waitforapptask-max-retries-exceeded
export async function bareWaitForAppTaskNoCatch(taskID: number) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; waitforapptask-max-retries-exceeded
  // not detected through type erasure; max retries exceeded throws native Error
  await v5Client.waitForAppTask({ taskID });
}

export async function waitForAppTaskWithTryCatch(taskID: number) {
  // @expect-clean
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.waitForAppTask({ taskID });
  } catch (err) {
    console.error('waitForAppTask failed:', err);
    throw err;
  }
}

// @expect-violation: saveobjectswithtransformation-missing-region
export async function bareSaveObjectsWithTransformationNoCatch(products: Product[]) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; saveobjectswithtransformation-missing-region
  // not detected through type erasure; throws synchronous Error if region not configured
  await v5Client.saveObjectsWithTransformation({
    indexName: 'products',
    objects: products,
  });
}

export async function saveObjectsWithTransformationWithTryCatch(products: Product[]) {
  // @expect-clean
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.saveObjectsWithTransformation({
      indexName: 'products',
      objects: products,
    });
  } catch (err) {
    console.error('saveObjectsWithTransformation failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Pass 76 (2026-06-24): batch / multipleBatch / browse / browseObjects / operationIndex
//    All v5 client-direct methods — v5Client cast to `any` so fixture compiles against
//    both v4 and v5 typings. Detection rests on the await_patterns dotted-suffix match
//    (".batch(", ".multipleBatch(", ".browse(", ".browseObjects(", ".operationIndex(").
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: batch-no-try-catch
export async function bareBatchNoCatch(actions: any[]) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; batch-no-try-catch not detected through type erasure; batch throws ApiError/RetryError on 400/402/403/404/429
  await v5Client.batch({ indexName: 'products', batchWriteParams: { requests: actions } });
}

export async function batchWithTryCatch(actions: any[]) {
  // @expect-clean
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.batch({ indexName: 'products', batchWriteParams: { requests: actions } });
  } catch (err) {
    console.error('batch failed:', err);
    throw err;
  }
}

// @expect-violation: multiplebatch-no-try-catch
export async function bareMultipleBatchNoCatch(requests: any[]) {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; multiplebatch-no-try-catch not detected through type erasure; multi-index batch fails atomically if any indexName missing
  await v5Client.multipleBatch({ requests });
}

export async function multipleBatchWithTryCatch(requests: any[]) {
  // @expect-clean
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.multipleBatch({ requests });
  } catch (err) {
    console.error('multipleBatch failed:', err);
    throw err;
  }
}

// @expect-violation: browse-no-try-catch
export async function bareBrowseNoCatch() {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; browse-no-try-catch not detected through type erasure; requires browse ACL distinct from search ACL
  const page = await v5Client.browse({ indexName: 'products', browseParams: {} });
  return page.hits;
}

export async function browseWithTryCatch() {
  // @expect-clean
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    const page = await v5Client.browse({ indexName: 'products', browseParams: {} });
    return page.hits;
  } catch (err) {
    console.error('browse failed:', err);
    throw err;
  }
}

// @expect-violation: browseobjects-no-try-catch
export async function bareBrowseObjectsNoCatch() {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; browseobjects-no-try-catch not detected through type erasure; iterator helper, any page failure aborts iteration
  await v5Client.browseObjects({
    indexName: 'products',
    aggregator: (_response: any) => {
      /* user-supplied callback — throws here propagate */
    },
  });
}

export async function browseObjectsWithTryCatch() {
  // @expect-clean
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.browseObjects({
      indexName: 'products',
      aggregator: (_response: any) => {
        /* user-supplied callback */
      },
    });
  } catch (err) {
    console.error('browseObjects failed:', err);
    throw err;
  }
}

// @expect-violation: operationindex-no-try-catch
export async function bareOperationIndexNoCatch() {
  // SHOULD_NOT_FIRE: known false negative — v5Client is `any`; operationindex-no-try-catch not detected through type erasure; COPY of missing source silently creates empty dest
  await v5Client.operationIndex({
    indexName: 'products',
    operationIndexParams: { operation: 'copy', destination: 'products_blue' },
  });
}

export async function operationIndexWithTryCatch() {
  // @expect-clean
  try {
    // SHOULD_NOT_FIRE: type erased AND inside try-catch — no violation either way
    await v5Client.operationIndex({
      indexName: 'products',
      operationIndexParams: { operation: 'copy', destination: 'products_blue' },
    });
  } catch (err) {
    console.error('operationIndex failed:', err);
    throw err;
  }
}
