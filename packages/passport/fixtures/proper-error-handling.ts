/**
 * Proper passport Usage
 * Should produce 0 violations
 */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import express from 'express';

// ✅ Error handling in strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      // Authenticate logic
      const user = { id: 1, username };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
));

// ✅ Error handling in authenticate callback
const app = express();
app.post('/login',
  (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (\!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ user });
      });
    })(req, res, next);
  }
);

export { app };
