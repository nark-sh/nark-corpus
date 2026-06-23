/**
 * Test Fixture: Prisma v7 newly-contracted API surface
 * Covers: findMany, count, aggregate, groupBy, createManyAndReturn,
 *         updateManyAndReturn, $queryRawUnsafe, $executeRawUnsafe
 *
 * Mix of proper handling and intentionally missing handling — see
 * v7-new-surface.expected.ts for which functions should fire violations.
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// --- findMany ---

/**
 * VIOLATION: findMany without empty-array check + no connection error handling
 */
async function listOrdersBad(userId: string) {
  const orders = await prisma.order.findMany({ where: { userId } });
  return orders[0].id; // crashes when no orders match
}

/**
 * CLEAN: findMany with empty-result check inside try/catch
 */
async function listOrdersGood(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
    if (orders.length === 0) {
      return { ok: false, reason: 'NO_ORDERS' as const };
    }
    return { ok: true, orders };
  } catch (error: any) {
    if (error.code === 'P1001' || error.code === 'P1002') {
      throw new Error('DB_UNAVAILABLE');
    }
    throw error;
  }
}

// --- count ---

/**
 * VIOLATION: count consumed directly without zero-check / no error handling
 */
async function getOrderCountBad(userId: string) {
  const total = await prisma.order.count({ where: { userId } });
  const pages = 100 / total; // divides by zero if user has no orders
  return pages;
}

/**
 * CLEAN: count with zero-check + connection error handling
 */
async function getOrderCountGood(userId: string) {
  try {
    const total = await prisma.order.count({ where: { userId } });
    if (total === 0) {
      return { pages: 0 };
    }
    return { pages: Math.ceil(total / 10) };
  } catch (error: any) {
    if (error.code === 'P1001') throw new Error('DB_UNAVAILABLE');
    throw error;
  }
}

// --- aggregate ---

/**
 * VIOLATION: aggregate _sum used without null-check (silent crash on no-rows)
 */
async function getRevenueBad(userId: string) {
  const result = await prisma.order.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  // _sum.amount is null when user has no orders — this throws
  return result._sum.amount + 100;
}

/**
 * CLEAN: aggregate with null-check + error handling
 */
async function getRevenueGood(userId: string) {
  try {
    const result = await prisma.order.aggregate({
      where: { userId },
      _sum: { amount: true },
      _count: true,
    });
    const total = result._sum.amount ?? 0;
    return { total, count: result._count };
  } catch (error: any) {
    if (error.code === 'P1001') throw new Error('DB_UNAVAILABLE');
    throw error;
  }
}

// --- groupBy ---

/**
 * VIOLATION: groupBy result indexed without empty-check
 */
async function topCustomersBad() {
  const groups = await prisma.order.groupBy({
    by: ['userId'],
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 5,
  });
  return groups[0].userId; // crashes if no groups
}

/**
 * CLEAN: groupBy with empty-result check + error handling
 */
async function topCustomersGood() {
  try {
    const groups = await prisma.order.groupBy({
      by: ['userId'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });
    if (groups.length === 0) {
      return [];
    }
    return groups.map((g) => ({ userId: g.userId, total: g._sum.amount ?? 0 }));
  } catch (error: any) {
    if (error.code === 'P1001') throw new Error('DB_UNAVAILABLE');
    throw error;
  }
}

// --- createManyAndReturn ---

/**
 * VIOLATION: createManyAndReturn without P2002 handling
 */
async function importUsersBad(records: Array<{ email: string; name: string }>) {
  const created = await prisma.user.createManyAndReturn({ data: records });
  return created;
}

/**
 * CLEAN: createManyAndReturn with skipDuplicates + error handling
 */
async function importUsersGood(records: Array<{ email: string; name: string }>) {
  try {
    const created = await prisma.user.createManyAndReturn({
      data: records,
      skipDuplicates: true,
    });
    return { ok: true, created };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { ok: false, reason: 'DUPLICATE' as const };
    }
    if (error.code === 'P2003') {
      return { ok: false, reason: 'FOREIGN_KEY' as const };
    }
    throw error;
  }
}

// --- updateManyAndReturn ---

/**
 * VIOLATION: updateManyAndReturn empty-result not checked, no error handling
 */
async function bulkActivateBad(ids: string[]) {
  const updated = await prisma.user.updateManyAndReturn({
    where: { id: { in: ids } },
    data: { isActive: true },
  });
  return updated[0]; // crashes if no users matched
}

/**
 * CLEAN: updateManyAndReturn with zero-match handling + connection error catch
 */
async function bulkActivateGood(ids: string[]) {
  try {
    const updated = await prisma.user.updateManyAndReturn({
      where: { id: { in: ids } },
      data: { isActive: true },
    });
    if (updated.length === 0) {
      return { ok: false, reason: 'NO_MATCH' as const };
    }
    return { ok: true, updated };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { ok: false, reason: 'UNIQUE_VIOLATION' as const };
    }
    if (error.code === 'P1001') throw new Error('DB_UNAVAILABLE');
    throw error;
  }
}

// --- $queryRawUnsafe ---

/**
 * VIOLATION: $queryRawUnsafe called with no error handling
 * (Note: severe security risk if userInput were concatenated;
 *  fixture only exercises the missing-try-catch case.)
 */
async function rawCountBad() {
  const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
    'SELECT COUNT(*) as count FROM "Order"'
  );
  return rows[0].count;
}

/**
 * CLEAN: $queryRawUnsafe with parameterized inputs + error handling
 */
async function rawCountGood(status: string) {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      'SELECT COUNT(*) as count FROM "Order" WHERE status = $1',
      status
    );
    if (rows.length === 0) return 0;
    return rows[0].count;
  } catch (error: any) {
    if (error.code === 'P1001') throw new Error('DB_UNAVAILABLE');
    throw error;
  }
}

// --- $executeRawUnsafe ---

/**
 * VIOLATION: $executeRawUnsafe with no error handling
 */
async function purgeBad() {
  await prisma.$executeRawUnsafe('DELETE FROM "Order" WHERE status = \'expired\'');
}

/**
 * CLEAN: $executeRawUnsafe with parameterized values + error handling
 */
async function purgeGood(status: string) {
  try {
    const affected = await prisma.$executeRawUnsafe(
      'DELETE FROM "Order" WHERE status = $1',
      status
    );
    if (affected === 0) {
      return { ok: false, reason: 'NO_MATCH' as const };
    }
    return { ok: true, affected };
  } catch (error: any) {
    if (error.code === 'P1001') throw new Error('DB_UNAVAILABLE');
    throw error;
  }
}

export {
  listOrdersBad,
  listOrdersGood,
  getOrderCountBad,
  getOrderCountGood,
  getRevenueBad,
  getRevenueGood,
  topCustomersBad,
  topCustomersGood,
  importUsersBad,
  importUsersGood,
  bulkActivateBad,
  bulkActivateGood,
  rawCountBad,
  rawCountGood,
  purgeBad,
  purgeGood,
};
