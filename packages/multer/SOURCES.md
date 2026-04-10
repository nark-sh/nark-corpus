# Sources: multer

**Package:** `multer`
**Version:** 2.x
**Category:** middleware (File upload handling)
**Status:** ✅ Complete

---

## Official Documentation

- **Main Docs:** https://github.com/expressjs/multer#readme
- **Error Handling:** https://github.com/expressjs/multer#error-handling
- **Limits:** https://github.com/expressjs/multer#limits
- **File Filter:** https://github.com/expressjs/multer#filefilter
- **Storage Engine:** https://github.com/expressjs/multer#storage
- **npm:** https://www.npmjs.com/package/multer

## Behavioral Requirements

**Upload Errors:** MulterError for size limits, file count, unexpected field
**Disk Errors:** ENOSPC, EACCES when writing files
**Must add error handling middleware after multer**
**Should configure limits to prevent DoS**
**Should use fileFilter to validate file types**

## Contract Rationale

**Unlimited uploads cause DoS:** Disk space exhaustion, memory exhaustion

**Malicious file uploads:** Executables, scripts can be uploaded without fileFilter

**MulterError class:** Contains code field (LIMIT_FILE_SIZE, LIMIT_UNEXPECTED_FILE)

**Error middleware required:** Multer errors need explicit handling in Express

**Created:** 2026-02-26
**Status:** ✅ COMPLETE
