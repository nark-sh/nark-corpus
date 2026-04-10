# Sequelize Error Handling Reference

**Package:** sequelize
**Type:** ORM (Object-Relational Mapping)
**Official Docs:** https://sequelize.org/
**GitHub:** https://github.com/sequelize/sequelize
**npm:** https://www.npmjs.com/package/sequelize

---

## Overview

Sequelize is a promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite, and Microsoft SQL Server. It features solid transaction support, relations, eager and lazy loading, read replication, and more. As an ORM that interacts with databases, Sequelize throws numerous error types that require proper handling.

---

## Error Hierarchy

All Sequelize errors inherit from `BaseError`, which extends the native JavaScript `Error` object.

**Complete Error Hierarchy:**

```
BaseError (extends Error)
├── AggregateError
├── AssociationError
├── BulkRecordError
├── ConnectionError
│   ├── AccessDeniedError
│   ├── ConnectionAcquireTimeoutError
│   ├── ConnectionRefusedError
│   ├── ConnectionTimedOutError
│   ├── HostNotFoundError
│   ├── HostNotReachableError
│   └── InvalidConnectionError
├── DatabaseError
│   ├── ForeignKeyConstraintError
│   ├── TimeoutError
│   └── UniqueConstraintError
├── EagerLoadingError
├── EmptyResultError
├── InstanceError
├── OptimisticLockError
├── QueryError
├── SequelizeScopeError
└── ValidationError
    ├── UniqueConstraintError
    └── ValidationErrorItem
```

**Reference:** https://sequelize.org/api/v7/hierarchy

---

## Connection Errors

### ConnectionError (Base Class)

Thrown when a connection to the database cannot be established.

**Subclasses:**
- `AccessDeniedError` - Invalid credentials
- `ConnectionAcquireTimeoutError` - Connection pool timeout
- `ConnectionRefusedError` - Database refused connection
- `ConnectionTimedOutError` - Connection attempt timed out
- `HostNotFoundError` - Database host not found
- `HostNotReachableError` - Database host unreachable
- `InvalidConnectionError` - Invalid connection configuration

**Example:**
```javascript
try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  if (error instanceof ConnectionError) {
    console.error('Unable to connect to the database:', error);
  }
}
```

**Configuration for Connection Pool:**
```javascript
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
```

**Reference:** https://sequelize.org/docs/v6/other-topics/connection-pool/

---

## Database Errors

### DatabaseError

Generic SQL errors thrown by the database.

**Key Subclasses:**
- `ForeignKeyConstraintError`
- `TimeoutError`
- `UniqueConstraintError`

### ForeignKeyConstraintError

Thrown when a foreign key constraint is violated in the database.

**Properties:**
- `fields` - Array of field names involved
- `index` - Name of the constraint
- `message` - Error message
- `original` - Original database error

**Example:**
```javascript
try {
  await Order.create({
    userId: 99999, // Non-existent user ID
    product: 'Widget'
  });
} catch (error) {
  if (error instanceof ForeignKeyConstraintError) {
    console.error('Foreign key violation:', error.fields);
    // Handle invalid reference
  }
}
```

**Reference:** https://sequelize.org/api/v7/classes/_sequelize_core.index.foreignkeyconstrainterror

### TimeoutError

Thrown when a database query times out, typically due to a deadlock.

**Properties:**
- `sql` - The SQL query that timed out
- `parameters` - Query parameters
- `cause` - Underlying error cause

**Deadlock Example:**
```javascript
try {
  await sequelize.transaction(async (t) => {
    // Complex transaction that might deadlock
  });
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('Transaction deadlock detected');
    // Retry logic
  }
}
```

**Reference:** https://sequelize.org/api/v7/classes/_sequelize_core.index.timeouterror

---

## Validation Errors

### ValidationError

Thrown when validation fails on model fields. Contains an `errors` property with an array of `ValidationErrorItem` objects.

**Structure:**
```javascript
ValidationError {
  name: 'SequelizeValidationError',
  errors: [
    ValidationErrorItem {
      message: 'Validation notEmpty on email failed',
      type: 'Validation error',
      path: 'email',
      value: '',
      origin: 'FUNCTION',
      instance: User {},
      validatorKey: 'notEmpty',
      validatorName: 'notEmpty',
      validatorArgs: []
    }
  ]
}
```

**Example:**
```javascript
try {
  await User.create({
    email: '', // Violates notEmpty validation
    age: -5    // Violates min validation
  });
} catch (error) {
  if (error instanceof ValidationError) {
    error.errors.forEach(e => {
      console.error(`${e.path}: ${e.message}`);
    });
  }
}
```

**Reference:** https://sequelize.org/api/v7/classes/_sequelize_core.index.validationerror

### UniqueConstraintError

Thrown when a unique constraint is violated in the database. Extends both `ValidationError` and `DatabaseError`.

**Properties:**
- `errors` - Array of ValidationErrorItem objects
- `fields` - Object mapping field names to values
- `parent` - Original database error
- `original` - Original database error
- `sql` - SQL query that caused the error

**Example:**
```javascript
try {
  await User.create({
    email: 'existing@example.com' // Email already exists
  });
} catch (error) {
  if (error instanceof UniqueConstraintError) {
    console.error('Duplicate entry for:', Object.keys(error.fields));
    // error.fields = { email: 'existing@example.com' }
  }
}
```

**Reference:** https://sequelize.org/api/v7/classes/_sequelize_core.index.uniqueconstrainterror

---

## Transaction Errors

Sequelize supports both **managed** and **unmanaged** transactions.

### Managed Transactions (Recommended)

Automatically commit on success or rollback on error.

**Pattern:**
```javascript
try {
  const result = await sequelize.transaction(async (t) => {
    const user = await User.create({ name: 'Alice' }, { transaction: t });
    const account = await Account.create({ userId: user.id }, { transaction: t });

    // If any error is thrown, transaction automatically rolls back
    return { user, account };
  });

  console.log('Transaction committed:', result);
} catch (error) {
  console.error('Transaction rolled back:', error);
}
```

### Unmanaged Transactions

Manual commit/rollback control.

**Pattern:**
```javascript
const t = await sequelize.transaction();

try {
  const user = await User.create({ name: 'Alice' }, { transaction: t });
  const account = await Account.create({ userId: user.id }, { transaction: t });

  await t.commit();
  console.log('Transaction committed');
} catch (error) {
  await t.rollback();
  console.error('Transaction rolled back:', error);
}
```

**Reference:** https://sequelize.org/docs/v6/other-topics/transactions/

### Deadlock Handling

**Configuration-Based Retry:**
```javascript
const sequelize = new Sequelize('database', 'username', 'password', {
  retry: {
    match: [
      Sequelize.ConnectionError,
      Sequelize.ConnectionTimedOutError,
      Sequelize.TimeoutError,
      /Deadlock/i,
      'SQLITE_BUSY'
    ],
    max: 3
  }
});
```

**Manual Retry Pattern:**
```javascript
async function retryTransaction(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sequelize.transaction(fn);
    } catch (error) {
      if (error instanceof TimeoutError && i < maxRetries - 1) {
        console.warn(`Deadlock detected, retry ${i + 1}/${maxRetries}`);
        continue;
      }
      throw error;
    }
  }
}
```

**Reference:** https://dev.to/anonyma/how-to-retry-transactions-in-sequelize-5h5c

---

## Other Important Errors

### EmptyResultError

Thrown when `rejectOnEmpty` mode is enabled and no record is found.

**Example:**
```javascript
try {
  const user = await User.findOne({
    where: { id: 99999 },
    rejectOnEmpty: true
  });
} catch (error) {
  if (error instanceof EmptyResultError) {
    console.error('No user found');
  }
}
```

**Reference:** https://sequelize.org/api/v7/classes/_sequelize_core.index.emptyresulterror

### AggregateError

Wrapper for multiple errors that occurred during bulk operations.

**Example:**
```javascript
try {
  await User.bulkCreate([
    { email: 'user1@example.com' },
    { email: 'invalid-email' }, // Validation fails
    { email: 'user2@example.com' }
  ], { validate: true });
} catch (error) {
  if (error instanceof AggregateError) {
    error.errors.forEach(e => console.error(e.message));
  }
}
```

**Reference:** https://sequelize.org/api/v7/classes/_sequelize_core.index.aggregateerror

---

## Dangerous Operations

### sync() - Production Warning

**DO NOT use `sync()` in production!**

- `sync()` - Syncs all models to database
- `sync({ force: true })` - **DROPS ALL TABLES** then recreates
- `sync({ alter: true })` - Alters tables to fit models (data loss risk)

**Production Impact:**
```javascript
// ⚠️ DANGEROUS - Drops all tables and data!
await sequelize.sync({ force: true });

// ⚠️ DANGEROUS - May delete columns and data!
await sequelize.sync({ alter: true });
```

**Recommended:** Use **Migrations** for production schema changes.

**Reference:** https://sequelize.org/docs/v7/models/model-synchronization/

---

## Common Pitfalls

### 1. Not Checking error.errors Array

**Bad:**
```javascript
catch (error) {
  console.error(error.message); // Loses validation details
}
```

**Good:**
```javascript
catch (error) {
  if (error instanceof ValidationError) {
    error.errors.forEach(e => {
      console.error(`${e.path}: ${e.message}`);
    });
  }
}
```

### 2. Forgetting Transaction Rollback

**Bad (Unmanaged):**
```javascript
const t = await sequelize.transaction();
try {
  await User.create({ name: 'Alice' }, { transaction: t });
  // Error occurs, transaction never rolled back!
} catch (error) {
  console.error(error); // Missing t.rollback()
}
```

**Good:**
```javascript
const t = await sequelize.transaction();
try {
  await User.create({ name: 'Alice' }, { transaction: t });
  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

### 3. Using sync() in Production

**Bad:**
```javascript
// Development
await sequelize.sync({ force: true }); // OK

// Production
await sequelize.sync({ force: true }); // ⚠️ DATA LOSS!
```

**Good:**
```javascript
// Use migrations instead
npx sequelize-cli db:migrate
```

### 4. Not Handling Deadlocks

**Bad:**
```javascript
await sequelize.transaction(async (t) => {
  // Complex transaction
}); // No retry on deadlock
```

**Good:**
```javascript
const sequelize = new Sequelize('db', 'user', 'pass', {
  retry: {
    match: [/Deadlock/i],
    max: 3
  }
});
```

---

## Security Considerations

### SQL Injection via Replacements

**CVE-2023-25813** (CVSS 10.0) - Parameters in replacements are not properly escaped.

**Affected:** All versions < 6.19.1
**Fixed:** 6.19.1+

**Vulnerable Code:**
```javascript
// ⚠️ VULNERABLE in versions < 6.19.1
await sequelize.query(
  'SELECT * FROM users WHERE id = :id',
  {
    replacements: { id: userInput },
    where: { status: 'active' }
  }
);
```

**Workaround:** Don't use `replacements` and `where` in the same query.

**Reference:** https://github.com/advisories/GHSA-wrh9-cjv3-2hpw

---

## Best Practices

1. **Always use try-catch** around database operations
2. **Check error types** using instanceof
3. **Use managed transactions** when possible (auto-rollback)
4. **Configure retry logic** for deadlocks
5. **Validate error.errors array** for ValidationError/UniqueConstraintError
6. **Use migrations** for production schema changes
7. **Never use sync({ force: true })** in production
8. **Update to latest version** (6.19.1+ for security)

---

## Minimum Safe Version

**Recommended:** `sequelize@6.19.1` or later

This version fixes critical SQL injection vulnerability CVE-2023-25813.

---

## Additional Resources

- **Official Documentation:** https://sequelize.org/docs/v6/
- **Transactions Guide:** https://sequelize.org/docs/v6/other-topics/transactions/
- **Validations & Constraints:** https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/
- **Error API Reference:** https://sequelize.org/api/v7/hierarchy
- **Security Advisories:** https://github.com/sequelize/sequelize/security/advisories
- **Migration Guide:** https://sequelize.org/docs/v6/other-topics/migrations/
