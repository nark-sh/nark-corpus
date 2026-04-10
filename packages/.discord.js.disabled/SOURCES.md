# Sources for discord.js Contract

**Package:** discord.js
**Version:** >=14.0.0
**Contract Created:** 2026-02-25

---

## Official Documentation

### Primary Documentation
- [discord.js Official Documentation](https://discord.js.org/docs) - Main API reference
- [discord.js Guide - Error Handling](https://discordjs.guide/legacy/popular-topics/errors) - Official error handling guide
- [discord.js Guide - Interaction Response Methods](https://discordjs.guide/slash-commands/response-methods) - Interaction timing and error handling

### API Class Documentation
- [Client Class](https://discord.js.org/docs/packages/discord.js/main/Client:class) - Client connection and lifecycle methods
- [Message Class](https://discord.js.org/docs/packages/discord.js/main/Message:Class) - Message manipulation methods
- [Guild Class](https://discord.js.org/docs/packages/discord.js/main/Guild:Class) - Guild/server management methods
- [TextChannel Class](https://discord.js.org/docs/packages/discord.js/main/TextChannel:Class) - Channel messaging methods

### GitHub Repository
- [discord.js GitHub](https://github.com/discordjs/discord.js) - Official repository

---

## Security & CVE Analysis

### CVE Research
- [CVE-2024-21521: @discordjs/opus DoS](https://github.com/advisories/GHSA-43wq-xrcm-3vgr) - Denial of Service vulnerability in opus package (not core library)
- [Snyk Advisory SNYK-JS-DISCORDJSOPUS-6370643](https://security.snyk.io/vuln/SNYK-JS-DISCORDJSOPUS-6370643) - Details on opus DoS vulnerability
- [Discord CVEs - CVE Details](https://www.cvedetails.com/vendor/23159/Discord.html) - Comprehensive CVE database for Discord products

**Finding:** No CVEs specific to error handling in core discord.js library. The library itself is well-maintained and secure when proper error handling is implemented.

---

## Error Handling Documentation

### Error Types
From [discord.js Guide - Error Handling](https://discordjs.guide/legacy/popular-topics/errors):

1. **DiscordAPIError** - Errors from Discord API
   - Properties: `message`, `code`, `path`, `method`
   - Example codes: 50035 (Invalid Form Body), UnknownMessage
   - Use `RESTJSONErrorCodes` constants for checking specific errors

2. **WebSocket/Network Errors** - System-level errors
   - ECONNRESET (connection closed)
   - ETIMEDOUT (timeout)
   - EPIPE (remote closed)
   - ENOTFOUND (DNS failure)
   - ECONNREFUSED (connection rejected)

3. **JavaScript Errors** - Standard JS errors
   - TypeError, ReferenceError, etc.

### Best Practices
From official documentation:
- Use try-catch blocks with async/await
- Use `.catch()` for promise chains
- Listen to `shardError` event for WebSocket errors
- Use `RESTJSONErrorCodes` constants for error checking
- Handle permission errors gracefully
- Implement unhandled rejection listeners

---

## Behavioral Rationale

### Why These Functions Require Error Handling

#### Client Operations
- **Client.login()** - Authentication can fail with:
  - Invalid token format
  - Revoked/expired tokens
  - Network connectivity issues
  - Rate limiting

#### Message Operations
All message operations can fail with:
- **Missing Permissions** - Bot lacks `SEND_MESSAGES`, `MANAGE_MESSAGES`, etc.
- **Rate Limiting** - Discord enforces rate limits on all API operations
- **Unknown Message** - Message deleted before operation
- **Network Errors** - Connection issues

Critical methods:
- `Message.delete()` - Fails if already deleted or lacking permissions
- `Message.edit()` - Fails if not owned by bot
- `Message.reply()` - Fails with permissions or rate limits
- `Message.react()` - Fails with invalid emoji or permissions

#### Interaction Operations
Interactions have **strict timing constraints**:
- Initial token valid for **3 seconds** only
- Extended token valid for **15 minutes**
- Cannot reply twice
- Cannot change ephemeral state after reply

From [Interaction Response Methods](https://discordjs.guide/slash-commands/response-methods):
> "Initially an interaction token is only valid for three seconds, so that's the timeframe in which you are able to use the ChatInputCommandInteraction#reply() method."

Critical methods:
- `CommandInteraction.reply()` - Must respond within 3 seconds
- `CommandInteraction.deferReply()` - Extends token to 15 minutes
- `CommandInteraction.followUp()` - Must have replied first
- `CommandInteraction.editReply()` - Must have replied first

#### Channel Operations
- **send()** - Most common operation, fails with permissions or rate limits
- **bulkDelete()** - Fails if messages > 14 days old or lacking permissions
- **createInvite()** - Fails with missing invite permissions

#### Guild Operations
All guild operations require specific permissions:
- **Guild.edit()** - Requires `MANAGE_GUILD` permission
- **Guild.fetchAuditLogs()** - Requires `VIEW_AUDIT_LOG` permission
- **Guild.fetchWebhooks()** - Requires `MANAGE_WEBHOOKS` permission

#### Member Operations
Member operations involve role hierarchy:
- **GuildMember.ban()** - Cannot ban members with higher roles
- **GuildMember.kick()** - Cannot kick members with higher roles
- **GuildMember.timeout()** - Cannot timeout members with higher roles

All require appropriate permissions (`BAN_MEMBERS`, `KICK_MEMBERS`, `MODERATE_MEMBERS`).

---

## Common Error Scenarios

### From Official Documentation

1. **Permission Errors**
   - Bot lacks required permission
   - Bots cannot DM users who block them
   - Solution: Check permissions before operation, handle gracefully

2. **Unknown Message/Channel/Guild**
   - Resource deleted before operation
   - Bot removed from guild
   - Solution: Use `RESTJSONErrorCodes.UnknownMessage` to ignore gracefully

3. **Rate Limiting**
   - Discord enforces rate limits on all endpoints
   - Solution: Implement rate limit handling and backoff

4. **Token Issues**
   - Invalid token format
   - Token revoked
   - Solution: Validate token before login, handle login failures

5. **Interaction Timeouts**
   - Reply not sent within 3 seconds
   - Token expired (15 minutes)
   - Solution: Use deferReply for long operations

---

## Testing Methodology

### Fixture Strategy

**proper-error-handling.ts:**
- All operations wrapped in try-catch
- Use deferReply for interactions
- Check permissions before operations
- Handle specific error codes with RESTJSONErrorCodes

**missing-error-handling.ts:**
- No try-catch blocks
- Direct await without error handling
- Should trigger violations

**instance-usage.ts:**
- Test detection via Client instance
- Test detection via channel.send()
- Test detection via interaction.reply()

---

## References

### Discord.js Ecosystem
- [discord.js NPM](https://www.npmjs.com/package/discord.js)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [Discord API Status Codes](https://discord.com/developers/docs/topics/opcodes-and-status-codes)

### Community Resources
- [discord.js Guide](https://discordjs.guide/) - Comprehensive community guide
- [Discord API Server](https://discord.gg/discord-api) - Official Discord API community

---

## Contract Version History

- **v1.0.0** (2026-02-25) - Initial contract covering discord.js v14.x
  - 44 functions requiring error handling
  - Categories: Client, Message, Channel, Interaction, Guild, Member, Role
  - Focus: Permissions, rate limits, timing constraints, network errors
