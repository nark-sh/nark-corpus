import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

/**
 * Instance-based usage patterns for passport-local
 * Tests detection of Strategy instances with various configurations
 */

// Pattern 1: Basic instance creation
const localStrategy = new LocalStrategy(
  async function(username, password, done) {
    // No try-catch - should trigger violation
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false);
    }
    const isValid = await user.comparePassword(password);
    return done(null, isValid ? user : false);
  }
);

passport.use(localStrategy);

// Pattern 2: Strategy with options
const customFieldStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'pass'
  },
  async (email, pass, done) => {
    // No try-catch - should trigger violation
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'User not found' }); // User enumeration
    }

    // Direct comparison - timing attack
    if (user.password === pass) {
      return done(null, user);
    }

    return done(null, false, { message: 'Wrong password' }); // User enumeration
  }
);

passport.use('custom-local', customFieldStrategy);

// Pattern 3: passReqToCallback option
const reqStrategy = new LocalStrategy(
  {
    passReqToCallback: true
  },
  async (req, username, password, done) => {
    // No try-catch - should trigger violation
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false);
    }
    const isValid = await user.comparePassword(password);
    if (isValid) {
      return done(null, user);
    }
    return done(null, false);
  }
);

passport.use('req-local', reqStrategy);

// Placeholder user model
class User {
  password?: string;
  static async findOne(query: any) { return null; }
  async comparePassword(password: string) { return false; }
}
