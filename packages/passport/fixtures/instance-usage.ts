/**
 * Instance Usage for passport
 */

import passport from 'passport';
import express from 'express';

class AuthService {
  setupPassport() {
    // ❌ No error handling in strategy
    passport.use(/* strategy */);
  }
  
  authenticate(app: express.Application) {
    // ❌ No error handling
    app.post('/login', passport.authenticate('local'));
  }
}

export { AuthService };
