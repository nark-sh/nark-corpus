import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret'
};

// Missing error handling - database lookup could fail
passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
  // No try-catch around database lookup
  const user = await User.findOne({ id: jwt_payload.sub });
  if (user) {
    return done(null, user);
  } else {
    return done(null, false);
  }
}));

// Placeholder user model
class User {
  static async findOne(query: any) { return null; }
}
