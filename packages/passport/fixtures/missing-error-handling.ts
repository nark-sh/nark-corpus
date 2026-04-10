/**
 * Missing passport Error Handling
 * Should produce ERROR violations
 */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import express from 'express';

// ❌ No error handling in strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    const user = { id: 1, username };
    done(null, user); // No try-catch
  }
));

// ❌ No error handling in authenticate
const app = express();
app.post('/login',
  passport.authenticate('local'),
  (req, res) => {
    res.json({ user: req.user });
  }
);

// ❌ No callback error handling
app.post('/auth',
  (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      // ❌ Not checking err
      res.json({ user });
    })(req, res, next);
  }
);

export { app };
