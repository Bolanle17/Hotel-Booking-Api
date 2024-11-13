const userSchema = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const validatePassword = (password) => {
  const pass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return pass.test(password);
};

exports.register = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    console.log("Received password:", password);
  
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
  
    // if (!validatePassword(password)) {
    //   return res.json({ success: false, message: "Invalid password. It must be at least 8 characters long and contain at least one letter and one number." });
    // }
  
    try {
      let user = await userSchema.findOne({ email });
      if (user) {
        return res.json({ success: false, message: "User already exists" });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new userSchema({
        name,
        email,
        password: hashedPassword,
      });
  
      if (req.file) {
        user.img = `/uploads/${req.file.filename}`;
      }else{
        user.img = '/uploads/avater.png'; 
      }
  
      await user.save();
  
      const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
      res.json({
        success: true,
        message: "Registration Successful",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          image: user.img
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.json({ success: false, message: "An error occurred during registration" });
    }
  };

  exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await userSchema.findOne({ email });
      if (!user) {
        return res.json({ success: false, message: "Invalid Email/Password" });
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.json({ success: false, message: "Invalid Email/Password" });
      }
  
      const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
      console.log('Generated token:', token);
      res.json({ 
        success: true, 
        token, 
        user: { _id: user._id, name: user.name, email: user.email, image: user.img } 
        
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.json({ success: false, message: "An error occurred during login" });
    }
  };

exports.getUser = async (req, res) => {
  try {
    const user = await userSchema.findById(req.user._id).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.json({ success: false, message: "An error occurred while fetching user data" });
  }
};


