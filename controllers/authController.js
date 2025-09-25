const {JWT_SECRET,JWT_EXPIRES_IN ,NODE_ENV} = require("../config/config");
const jwt = require("jsonwebtoken");
const Authority = require("../models/Authority");


exports.signUp = async (req,res,next)=>{
    try {
    const { username, fullName, email, password, role, authorityId } = req.body;

    if (!username || !fullName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate role
    const allowedRoles = ["Police Officer", "Tourism Officer", "Emergency Responder", "System Administrator"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // If Police Officer, policeId is required
    if (role === "Police Officer" && !authorityId) {
      return res.status(400).json({ message: "Police ID is required for Police Officer" });
    }

    const existingUser = await Authority.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    const newUser = new Authority({ username, fullName, email, password, role, authorityId });
    await newUser.save();

    res.status(201).json({ 
      message: "Signup successful. Please login to continue.", 
      user: { username, fullName, email, role, authorityId } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.signIn = async (req,res,next)=>{
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await Authority.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax"
    });

    res.json({
      message: "Login successful",
      user: {
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        authorityId: user.authorityId || null
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}



