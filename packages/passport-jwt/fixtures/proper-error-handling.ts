import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret'
};

// Proper error handling with try-catch
passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
  try {
    const user = await User.findOne({ id: jwt_payload.sub });
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err);
  }
}));

// Placeholder user model
class User {
  static async findOne(query: any) { return null; }
}
