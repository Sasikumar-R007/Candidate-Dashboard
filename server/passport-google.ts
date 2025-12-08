import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { storage } from "./storage";

export function setupGoogleAuth() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientID || !clientSecret) {
    console.warn('Google OAuth not configured. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required.');
    return false;
  }

  const callbackURL = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/google/callback`
    : process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          let candidate = await storage.getCandidateByGoogleId(profile.id);
          
          if (candidate) {
            return done(null, candidate);
          }

          candidate = await storage.getCandidateByEmail(email);
          
          if (candidate) {
            await storage.updateCandidate(candidate.id, { googleId: profile.id });
            const updatedCandidate = await storage.getCandidateByEmail(email);
            return done(null, updatedCandidate);
          }

          const candidateId = await storage.generateNextCandidateId();
          const newCandidate = await storage.createCandidateWithGoogle({
            candidateId,
            fullName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'User',
            email,
            googleId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            isActive: true,
            isVerified: true,
            createdAt: new Date().toISOString()
          });

          return done(null, newCandidate);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, { id: user.candidateId, type: 'candidate' });
  });

  passport.deserializeUser(async (data: { id: string; type: string }, done) => {
    try {
      if (data.type === 'candidate') {
        const candidate = await storage.getCandidateByCandidateId(data.id);
        done(null, candidate);
      } else {
        done(null, null);
      }
    } catch (error) {
      done(error, null);
    }
  });

  return true;
}
