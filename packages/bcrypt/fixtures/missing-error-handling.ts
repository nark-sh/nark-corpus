import bcrypt from "bcrypt"; async function hash(pwd: string) { await bcrypt.hash(pwd, 10); }
