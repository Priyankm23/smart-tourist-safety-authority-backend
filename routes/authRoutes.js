const express = require("express");
const { signUp ,signIn} = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");
const Authority = require("../models/Authority");

const router = express.Router();

// Signup Route
router.post("/signup", signUp);
router.post("/login",signIn);

router.get('/me', verifyToken(), async (req, res, next) => {
  try {
    const user = await Authority.findById(req.authority.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        authorityId: user.authorityId || null,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Get /me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add logout route
router.post('/logout', (req, res) => {
  // Clear the auth cookie
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  return res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

module.exports = router;
