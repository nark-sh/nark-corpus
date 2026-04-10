# Sources: chai

**Last Updated:** 2026-02-27
**Package Version:** >=4.0.0 <6.0.0
**Research Quality:** ⭐⭐⭐⭐ (comprehensive)

---

## Official Documentation

- **Chai Website**: [https://www.chaijs.com/](https://www.chaijs.com/)
- **BDD API**: [https://www.chaijs.com/api/bdd/](https://www.chaijs.com/api/bdd/) - expect() style
- **Assert API**: [https://www.chaijs.com/api/assert/](https://www.chaijs.com/api/assert/) - assert.* style
- **Should API**: [https://www.chaijs.com/api/should/](https://www.chaijs.com/api/should/) - should style
- **NPM Package**: [https://www.npmjs.com/package/chai](https://www.npmjs.com/package/chai)
- **GitHub Repository**: [https://github.com/chaijs/chai](https://github.com/chaijs/chai)

---

## Assertion Styles

Chai provides THREE assertion styles:

### 1. BDD Style (expect)

```javascript
const { expect } = require('chai');

expect(foo).to.equal('bar');
expect(foo).to.be.a('string');
expect(foo).to.have.lengthOf(3);
```

**Most popular style** - chainable, readable

### 2. TDD Style (assert)

```javascript
const { assert } = require('chai');

assert.equal(foo, 'bar');
assert.typeOf(foo, 'string');
assert.lengthOf(foo, 3);
```

**Classic assert style** - familiar to C/Java developers

### 3. Should Style

```javascript
const chai = require('chai');
chai.should();

foo.should.equal('bar');
foo.should.be.a('string');
foo.should.have.lengthOf(3);
```

**Least common** - modifies Object.prototype

---

## Error Handling

### AssertionError

**All failed assertions throw `AssertionError`:**

```javascript
const { expect } = require('chai');

try {
  expect(1).to.equal(2);
} catch (error) {
  console.log(error.name); // 'AssertionError'
  console.log(error.message); // 'expected 1 to equal 2'
}
```

### In Test Frameworks

**Mocha/Jest handle AssertionError automatically:**

```javascript
it('test', () => {
  expect(value).to.equal(expected); // No try-catch needed
});
```

### Outside Tests (Rare)

**Production validation requires try-catch:**

```javascript
function validateInput(data) {
  try {
    expect(data).to.be.an('object');
    expect(data.id).to.be.a('number');
    return true;
  } catch (error) {
    return false; // or log error
  }
}
```

**WARNING:** Don't use chai for production validation - use validator libraries instead.

---

## Common Patterns

### 1. Deep Equality

```javascript
expect(obj1).to.deep.equal(obj2);
expect(array).to.have.deep.members([1, 2, 3]);
```

### 2. Property Assertions

```javascript
expect(obj).to.have.property('name');
expect(obj).to.have.property('age', 25);
expect(obj).to.have.all.keys('name', 'age');
```

### 3. Type Assertions

```javascript
expect(value).to.be.a('string');
expect(value).to.be.an('array');
expect(value).to.be.null;
expect(value).to.be.undefined;
```

### 4. Existence Assertions

```javascript
expect(value).to.exist;
expect(value).to.not.exist;
expect(value).to.be.ok; // truthy
expect(value).to.be.empty; // array/string/object
```

### 5. Comparison Assertions

```javascript
expect(value).to.be.above(5);
expect(value).to.be.below(10);
expect(value).to.be.within(5, 10);
```

### 6. String/Array Contains

```javascript
expect('hello world').to.include('world');
expect([1, 2, 3]).to.include(2);
expect({ a: 1, b: 2 }).to.include({ a: 1 });
```

---

## Common Mistakes

### Mistake #1: Using Chai in Production Code

**Problem:** Chai is designed for testing, not production validation

**Example (WRONG):**
```javascript
// ❌ In production API
app.post('/api/users', (req, res) => {
  expect(req.body).to.have.property('email');
  expect(req.body.email).to.be.a('string');
  // Throws AssertionError → crashes server!
});
```

**Fix:** Use validation libraries (joi, yup, zod):
```javascript
// ✅ Production validation
const schema = Joi.object({
  email: Joi.string().required()
});
const { error } = schema.validate(req.body);
if (error) return res.status(400).json({ error });
```

### Mistake #2: Forgetting `.to` / `.be`

**Example (WRONG):**
```javascript
expect(value).equal(5); // ❌ Missing .to
expect(value).a('string'); // ❌ Missing .be
```

**Fix:**
```javascript
expect(value).to.equal(5); // ✅
expect(value).to.be.a('string'); // ✅
```

### Mistake #3: Confusing `.equal` vs `.eql`

**`.equal` - strict equality (===):**
```javascript
expect(obj1).to.equal(obj2); // ❌ Different references
```

**`.eql` / `.deep.equal` - deep equality:**
```javascript
expect(obj1).to.deep.equal(obj2); // ✅ Compare contents
```

---

## Best Practices

### 1. Prefer BDD Style (expect)

Most readable and chainable:
```javascript
expect(user).to.have.property('name').that.is.a('string');
```

### 2. Use Descriptive Messages

```javascript
expect(value, 'User age should be positive').to.be.above(0);
```

### 3. Chain Assertions

```javascript
expect(user)
  .to.be.an('object')
  .that.has.property('email')
  .that.is.a('string');
```

### 4. Only Use in Tests

Never use chai assertions in production code - use proper validation libraries.

---

## Integration with Test Frameworks

### Mocha

```javascript
const { expect } = require('chai');

describe('Math', () => {
  it('should add numbers', () => {
    expect(1 + 1).to.equal(2);
  });
});
```

### Jest

```javascript
// Jest has built-in assertions, but chai can be used:
const { expect } = require('chai');

test('adds numbers', () => {
  expect(1 + 1).to.equal(2);
});
```

---

## Contract Rationale

### Postconditions (assertion-failure)

All chai assertions throw `AssertionError` when they fail. This is **expected behavior in tests** but can crash applications if used outside test contexts.

**Evidence:**
- Chai documentation explicitly states assertions throw on failure
- AssertionError is the standard exception type for all assertion libraries
- Using chai in production is an anti-pattern

**Severity:** Warning (expected in tests, problematic in production)

**Citations:**
- [Chai BDD API](https://www.chaijs.com/api/bdd/)
- [Chai Assert API](https://www.chaijs.com/api/assert/)
- [Chai GitHub](https://github.com/chaijs/chai)

---

## Important Notes

- **Testing Library:** Chai is for tests only, not production validation
- **Security:** No CVEs - development tool
- **AssertionError:** All assertions throw on failure
- **Alternatives for Production:** joi, yup, zod, ajv

---

## Research Metadata

- **Research Date:** 2026-02-27
- **Researcher:** Claude Sonnet 4.5
- **Documentation Sources:** 6 URLs
- **Common Mistakes Documented:** 3
- **Line Count:** 200+ lines (target 100+ ✅)
