import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env } from './env.js'
import * as authService from '../modules/auth/auth.service.js'

let googleConfigured = false

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          if (!email) return done(new Error('Google account has no email'))
          const user = await authService.findOrCreateGoogleUser({
            providerAccountId: profile.id,
            email: email.toLowerCase(),
            name: profile.displayName || email,
            avatarUrl: profile.photos?.[0]?.value ?? null,
          })
          done(null, user)
        } catch (err) {
          done(err)
        }
      },
    ),
  )
  googleConfigured = true
}

export function isGoogleConfigured() {
  return googleConfigured
}

export { passport }
