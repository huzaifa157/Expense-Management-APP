const crypto = require("crypto");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const { sendResetCodeEmail } = require("../utils/sendEmail");

const hashCode = (code) => crypto.createHash("sha256").update(code).digest("hex");


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always respond the same way whether or not the account exists, so
    // this endpoint can't be used to check which emails are registered.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists for that email, a reset code has been sent.",
      });
    }

    const code = String(crypto.randomInt(100000, 999999));

    user.resetPasswordCode = hashCode(code);
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendResetCodeEmail(user.email, code);

    res.status(200).json({
      success: true,
      message: "If an account exists for that email, a reset code has been sent.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user || user.resetPasswordCode !== hashCode(code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code.",
      });
    }

    user.password = newPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const savePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;

    await User.findByIdAndUpdate(req.user.id, { pushToken });

    res.status(200).json({
      success: true,
      message: "Push token saved",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  registerUser , loginUser , savePushToken , forgotPassword , resetPassword

};