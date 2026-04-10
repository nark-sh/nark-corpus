# Sources: sharp

**Package:** sharp
**Category:** image-processing
**Last Updated:** 2026-02-27
**Status:** ✅ COMPLETE

---

## Official Documentation

- **Main Docs:** https://sharp.pixelplumbing.com/
- **API Reference:** https://sharp.pixelplumbing.com/api-constructor
- **Output Methods:** https://sharp.pixelplumbing.com/api-output
- **npm:** https://www.npmjs.com/package/sharp
- **GitHub:** https://github.com/lovell/sharp

---

## Behavioral Requirements

**Error Pattern:** Promise-based async operations that reject on errors

**Key Methods:**
- `toFile()` - Rejects on file system errors or invalid image data
- `toBuffer()` - Rejects on processing errors or invalid input

**Required Handling:** Always use try-catch or .catch() for Promise rejections

---

## Contract Rationale

Sharp methods return Promises that reject when:
- File system operations fail (ENOENT, EACCES, ENOMEM)
- Image data is invalid or corrupted
- Processing operations fail (unsupported format, memory limits)

Without proper error handling, these rejections cause application crashes.

---

## Security Considerations

### Vulnerability History

**CVE-2023-4863** (HIGH SEVERITY - CVSS 8.8)
- **Affected Versions:** sharp < 0.32.6
- **Component:** libwebp dependency
- **Vulnerability:** Heap buffer overflow
- **Attack Vector:** Malicious WebP images
- **Impact:** Arbitrary code execution, denial of service
- **Mitigation:** Upgrade to sharp >=0.32.6 + proper error handling
- **Source:** https://security.snyk.io/vuln/SNYK-JS-SHARP-2848109

**CVE-2023-40032** (MEDIUM SEVERITY)
- **Affected Versions:** libvips 8.12.0 - 8.14.3
- **Component:** SVG loader (svgload)
- **Vulnerability:** NULL pointer dereference
- **Attack Vector:** Crafted SVG files
- **Impact:** Application crash, denial of service
- **Mitigation:** Upgrade libvips >=8.14.4 + error handling prevents crash
- **Source:** https://www.cvedetails.com/cve/CVE-2023-40032/

**CVE-2025-29769** (MEDIUM-HIGH SEVERITY)
- **Affected Versions:** libvips < 8.16.1
- **Component:** HEIF save operation
- **Vulnerability:** Heap buffer overflow
- **Attack Vector:** 4-channel TIFF images during HEIC conversion
- **Impact:** Process crash, potential code execution
- **Mitigation:** Upgrade libvips >=8.16.1 + handle conversion errors
- **Source:** https://nvd.nist.gov/vuln/detail/cve-2025-29769

**CVE-2025-59933** (MEDIUM SEVERITY)
- **Affected Versions:** libvips <=8.17.1 (when compiled with PDF support)
- **Component:** PDF parser (via poppler)
- **Vulnerability:** Buffer read overflow
- **Attack Vector:** Crafted PDF with missing height definition
- **Impact:** Process crash, potential information disclosure
- **Mitigation:** Upgrade libvips >=8.17.2
- **Note:** Most sharp installations don't include PDF support

### Error Handling as Security Defense

Proper error handling provides critical security benefits:

1. **Prevents Crashes** - Try-catch blocks prevent malicious images from crashing the application
2. **Enables Logging** - Catch blocks allow logging of potential attack attempts
3. **Isolates Failures** - Error handling in batch operations prevents one bad file from crashing entire process
4. **Graceful Degradation** - Application continues running instead of complete failure

### Recommended Minimum Version

**sharp >= 0.32.6** (fixes CVE-2023-4863 - high severity WebP vulnerability)

### Best Practices for Secure Image Processing

1. **Always wrap user-provided image inputs in try-catch**
   ```typescript
   try {
     await sharp(userUploadedBuffer).toBuffer();
   } catch (error) {
     logger.warn('Invalid or malicious image detected');
     throw new Error('Invalid image file');
   }
   ```

2. **Validate image dimensions before processing** (prevent memory exhaustion)
   ```typescript
   const metadata = await sharp(buffer).metadata();
   if (metadata.width > 4096 || metadata.height > 4096) {
     throw new Error('Image dimensions exceed limits');
   }
   ```

3. **Implement rate limiting** for image processing endpoints

4. **Log processing failures** (may indicate attack attempts)
   ```typescript
   } catch (error) {
     logger.warn('Image processing failed', {
       error: error.message,
       userId,
       timestamp: Date.now()
     });
   }
   ```

5. **Isolate failures in batch operations**
   ```typescript
   for (const file of files) {
     try {
       await sharp(file).resize(800, 600).toFile(`out/${file}`);
     } catch (error) {
       // Log but continue processing other files
       logger.error(`Failed to process ${file}:`, error);
     }
   }
   ```

### Example: Secure Upload Handler

```typescript
async function processUserUpload(buffer: Buffer) {
  try {
    // Step 1: Validate metadata (fail fast on invalid images)
    const metadata = await sharp(buffer).metadata();

    // Step 2: Check size limits (prevent memory exhaustion)
    if (metadata.width > 4096 || metadata.height > 4096) {
      throw new Error('Image dimensions exceed limits');
    }

    // Step 3: Process with error handling
    const processed = await sharp(buffer)
      .resize(800, 600, { fit: 'inside' })
      .jpeg({ quality: 85 })
      .toBuffer();

    return processed;
  } catch (error) {
    // Step 4: Log potential attack
    logger.warn('Malicious or invalid image detected', {
      error: error.message,
      bufferSize: buffer.length
    });

    throw new Error('Invalid image file');
  }
}
```

### Real-World Attack Scenarios

**Scenario 1: API Endpoint Without Error Handling**
```typescript
// ❌ VULNERABLE - One malicious image crashes the entire API
app.post('/upload', async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize(800, 600)
    .toBuffer();  // CVE-2023-4863 can crash here
  res.send(buffer);
});

// ✅ PROTECTED - Error handling prevents crash
app.post('/upload', async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize(800, 600)
      .toBuffer();
    res.send(buffer);
  } catch (error) {
    logger.warn('Upload processing failed', { error });
    res.status(400).json({ error: 'Invalid image file' });
  }
});
```

**Scenario 2: Batch Processing**
```typescript
// ❌ VULNERABLE - First malicious image crashes entire batch
async function processBatch(files: string[]) {
  for (const file of files) {
    await sharp(file).resize(800, 600).toFile(`out/${file}`);
  }
}

// ✅ PROTECTED - Continues processing after errors
async function processBatch(files: string[]) {
  const results = [];
  for (const file of files) {
    try {
      await sharp(file).resize(800, 600).toFile(`out/${file}`);
      results.push({ file, status: 'success' });
    } catch (error) {
      logger.error(`Failed to process ${file}:`, error);
      results.push({ file, status: 'failed', error: error.message });
    }
  }
  return results;
}
```

---

**Created:** 2026-02-26
**Enhanced:** 2026-02-27
**Research:** `dev-notes/package-onboarding/sharp/`
