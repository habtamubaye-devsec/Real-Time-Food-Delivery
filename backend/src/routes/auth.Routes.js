const express = require("express");
const validate = require("../middlewares/validate");
const passport = require("../config/passport");
const {
  registerUserSchema,
  loginSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/userValidator");

const {
  register,
  login,
  verifyOTP,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  googleCallback,
} = require("../controllers/auth.controller");

const router = express.Router();

const loginPathByRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin/login";
    case "restaurant":
      return "/restaurant/login";
    case "driver":
      return "/driver/login";
    case "customer":
    default:
      return "/login";
  }
};


// Start Google Auth
router.get(
  "/google",
  (req, res, next) => {
    // role comes from the login page (customer/admin/restaurant/driver)
    req.session.oauthRole = (req.query.role || "customer").toString();
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: true,
  })
);

// Google Callback
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: true }, (err, user) => {
      if (err) return next(err);

      if (!user) {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const role = req.session?.oauthRole || "customer";
        return res.redirect(`${clientUrl}${loginPathByRole(role)}?error=google`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        return googleCallback(req, res);
      });
    })(req, res, next);
  }
);

router.post("/register", validate(registerUserSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/verify-otp", validate(otpSchema), verifyOTP);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
module.exports = router;
