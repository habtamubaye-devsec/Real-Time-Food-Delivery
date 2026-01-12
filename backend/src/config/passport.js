const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const crypto = require("crypto");
const User = require("../models/Users");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/api/delivery/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(new Error("Google account did not return an email"), null);
        }

        const requestedRoleRaw = req?.session?.oauthRole;
        const requestedRole =
          typeof requestedRoleRaw === "string" && requestedRoleRaw.trim()
            ? requestedRoleRaw.trim()
            : "customer";

        const allowedRoles = new Set([
          "customer",
          "restaurant",
          "driver",
          "admin",
        ]);

        if (!allowedRoles.has(requestedRole)) {
          return done(null, false, { message: "Invalid role" });
        }

        let user = await User.findOne({ email });

        // Role must match the login page (customer/admin/restaurant/driver)
        if (user && user.role !== requestedRole) {
          return done(null, false, { message: "Role mismatch" });
        }

        if (!user) {
          // Only customers can be auto-created via Google.
          if (requestedRole !== "customer") {
            return done(null, false, { message: "Account not found" });
          }

          // Users schema requires phone + password; Google doesn't provide phone.
          // Use a stable unique placeholder for phone.
          const randomPassword = crypto.randomBytes(32).toString("hex");
          user = await User.create({
            email,
            phone: `google_${profile.id}`,
            password: randomPassword,
            role: "customer",
            googleId: profile.id,
            isVerified: true,
          });
        } else {
          const updates = {};
          if (!user.googleId) updates.googleId = profile.id;
          if (!user.isVerified) updates.isVerified = true;
          if (Object.keys(updates).length) {
            user = await User.findByIdAndUpdate(
              user._id,
              { $set: updates },
              { new: true }
            );
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
