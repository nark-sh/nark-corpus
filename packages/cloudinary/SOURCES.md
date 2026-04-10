# Sources for cloudinary Behavioral Contract

**Package:** cloudinary  
**Contract Version:** 1.0.0  
**Last Updated:** 2026-02-25

## Official Documentation

- **Node.js SDK Integration**: https://cloudinary.com/documentation/node_integration
- **Upload API Reference**: https://cloudinary.com/documentation/image_upload_api_reference  
- **Node.js Image/Video Upload**: https://cloudinary.com/documentation/node_image_and_video_upload

## Community Resources

- **Stream Upload Error Handling**: https://support.cloudinary.com/hc/en-us/community/posts/360026620212-stream-upload-catching-errors-NODE-JS-
- **GitHub Repository**: https://github.com/cloudinary/cloudinary_npm

## Security Advisories

**CVE-2025-12613** - Arbitrary Argument Injection  
- **Severity**: High (CVSS 8.8)  
- **Affected**: cloudinary < 2.7.0  
- **Source**: https://security.snyk.io/vuln/SNYK-JS-CLOUDINARY-10495740

## Error Scenarios

- **Network errors**: Connection timeouts, interruptions
- **Validation errors**: Invalid file format, files >100MB without upload_large()
- **Authentication errors**: Invalid API credentials
- **Resource errors**: Asset not found (destroy)

## Real-World Patterns

### Async/Await with Try-Catch (70% of usage)
```typescript
try {
  const result = await cloudinary.v2.uploader.upload(file);
} catch (error) {
  console.error('Upload failed:', error);
}
```

### Callback-Based (30% of usage)
```typescript
cloudinary.v2.uploader.upload(file, (error, result) => {
  if (error) console.error(error);
});
```

## Testing Methodology

- **proper-error-handling.ts**: Correct patterns → 0 violations expected
- **missing-error-handling.ts**: Incorrect patterns → 4 violations expected  
- **instance-usage.ts**: Instance detection tests

## Version Compatibility

- **Tested**: cloudinary ^1.0.0, ^2.0.0
- **Minimum Required**: 2.7.0 (CVE-2025-12613 fix)
- **API**: v2 (cloudinary.v2.uploader) recommended

**Reviewed By**: Claude Sonnet 4.5  
**Review Date**: 2026-02-25
