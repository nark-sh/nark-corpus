import bcrypt from "bcrypt"; async function hash(pwd: string) { try { await bcrypt.hash(pwd, 10); } catch(e) { throw e; } }
