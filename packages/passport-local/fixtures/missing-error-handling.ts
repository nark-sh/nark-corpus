import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

// Missing error handling - database lookup could fail
passport.use(new LocalStrategy(
  async function(username, password, done) {
    // No try-catch around database lookup
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false);
    }
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return done(null, false);
    }
    return done(null, user);
  }
));

// Placeholder user model
class User {
  static async findOne(query: any) { return null; }
  async comparePassword(password: string) { return false; }
}
