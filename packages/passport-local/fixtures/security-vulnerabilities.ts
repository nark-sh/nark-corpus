import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

/**
 * Security vulnerability patterns in passport-local implementations
 * These demonstrate common security mistakes that should trigger warnings
 */

// VULNERABILITY 1: Timing Attack - Direct Password Comparison
passport.use('timing-attack', new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      // ❌ TIMING ATTACK: Direct string comparison leaks timing information
      if (user.password === password) {
        return done(null, user);
      }

      return done(null, false, { message: 'Invalid credentials' });
    } catch (err) {
      return done(err);
    }
  }
));

// VULNERABILITY 2: User Enumeration - Different Error Messages
passport.use('user-enumeration', new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ username });

      // ❌ USER ENUMERATION: Different messages reveal user existence
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return done(null, false, { message: 'Wrong password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// VULNERABILITY 3: Authentication Failure as Server Error
passport.use('wrong-error-type', new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ username });

      // ❌ WRONG: Treating authentication failure as server error (500)
      if (!user) {
        return done(new Error('User not found'));
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return done(new Error('Invalid password'));
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// VULNERABILITY 4: Missing Error Propagation
passport.use('missing-error-propagation', new LocalStrategy(
  function(username, password, done) {
    // ❌ CALLBACK STYLE: Doesn't check err parameter
    User.findOne({ username }, (err, user) => {
      if (user) { // Ignores err!
        user.comparePassword(password, (err2, isValid) => {
          if (isValid) { // Ignores err2!
            return done(null, user);
          }
          return done(null, false);
        });
      } else {
        return done(null, false);
      }
    });
  }
));

// VULNERABILITY 5: No Security Logging
passport.use('no-logging', new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        // ❌ NO LOGGING: Failed attempts not logged (can't detect brute-force)
        return done(null, false);
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        // ❌ NO LOGGING: Failed attempts not logged
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      // ❌ NO LOGGING: Errors not logged (difficult to debug)
      return done(err);
    }
  }
));

// VULNERABILITY 6: Multiple Issues Combined
passport.use('multiple-vulnerabilities', new LocalStrategy(
  async (username, password, done) => {
    // ❌ NO TRY-CATCH: Unhandled promise rejection
    const user = await User.findOne({ username });

    // ❌ USER ENUMERATION: Different messages
    if (!user) {
      return done(null, false, { message: 'Username does not exist' });
    }

    // ❌ TIMING ATTACK: Direct comparison
    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password' });
    }

    // ❌ NO LOGGING: No security monitoring
    return done(null, user);
  }
));

// Placeholder user model
class User {
  password?: string;

  static async findOne(query: any): Promise<User | null> {
    return null;
  }

  static findOne(query: any, callback: (err: any, user: User | null) => void): void {
    callback(null, null);
  }

  async comparePassword(password: string): Promise<boolean> {
    return false;
  }

  comparePassword(password: string, callback: (err: any, isValid: boolean) => void): void {
    callback(null, false);
  }
}
