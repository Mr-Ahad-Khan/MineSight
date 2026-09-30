const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const EmailOtp = require("../models/EmailOtp");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { randomInt } = require("crypto");
const generateToken = require("../utils/generateToken");
const { getStoredMediaPath } = require("../utils/mediaStorage");

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const verifyRecaptcha = async (token, res) => {
  const secret =
    process.env.RECAPTCHA_SECRET_KEY ||
    (process.env.NODE_ENV === "development"
      ? "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
      : "");
  if (!secret) {
    res.status(503);
    throw new Error("reCAPTCHA verification is not configured on the server");
  }

  if (!token) {
    res.status(400);
    throw new Error("Please complete the reCAPTCHA");
  }

  let verification;
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    verification = await response.json();
  } catch {
    res.status(503);
    throw new Error("Unable to verify reCAPTCHA. Please try again");
  }

  if (!verification.success) {
    const errorCodes = verification["error-codes"] || [];
    console.warn("Google reCAPTCHA verification failed:", errorCodes.join(", "));

    if (errorCodes.includes("invalid-input-secret") || errorCodes.includes("missing-input-secret")) {
      res.status(503);
      throw new Error("The reCAPTCHA secret key is invalid or missing on the backend.");
    }

    if (errorCodes.includes("timeout-or-duplicate")) {
      res.status(400);
      throw new Error("The reCAPTCHA expired. Complete the checkbox again and retry.");
    }

    res.status(400);
    if (errorCodes.includes("invalid-input-response")) {
      throw new Error("The reCAPTCHA token was rejected. Check that both keys belong to the same v2 checkbox and that localhost is allowed.");
    }
    throw new Error("reCAPTCHA verification failed. Please try again");
  }
};

const getEmailTransport = () => {
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  )
    return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
};

const sendOtpEmail = async (email, code) => {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [email],
        subject: "Coal Governance email verification code",
        text: `Your Coal Governance verification code is ${code}. It expires in 10 minutes.`,
      }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(result.message || "Email provider rejected the request");
      error.statusCode = 502;
      throw error;
    }
    return;
  }

  const transport = getEmailTransport();
  if (!transport) {
    const error = new Error(
      "Email verification is not configured. Set RESEND_API_KEY or add SMTP settings.",
    );
    error.statusCode = 503;
    throw error;
  }
  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Coal Governance email verification code",
    text: `Your Coal Governance verification code is ${code}. It expires in 10 minutes.`,
  });
};

const requestEmailOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error("Enter a valid email address");
  }

  const code = String(randomInt(100000, 1000000));
  const codeHash = await bcrypt.hash(code, 10);
  await EmailOtp.deleteMany({ email });
  await EmailOtp.create({
    email,
    codeHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  try {
    await sendOtpEmail(email, code);
  } catch (error) {
    await EmailOtp.deleteMany({ email });
    res.status(error.statusCode || 502);
    throw new Error(error.message || "Unable to send verification email");
  }

  res.json({ success: true, message: "Verification code sent" });
});

const verifyEmailOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const code = String(req.body.code || "").trim();
  const otp = email
    ? await EmailOtp.findOne({ email, verifiedAt: null }).sort({
        createdAt: -1,
      })
    : null;

  if (!otp || otp.expiresAt < new Date()) {
    res.status(400);
    throw new Error("Code expired. Request a new verification code");
  }
  if (otp.attempts >= 5) {
    res.status(429);
    throw new Error("Too many incorrect attempts. Request a new code");
  }

  const matches = await bcrypt.compare(code, otp.codeHash);
  if (!matches) {
    otp.attempts += 1;
    await otp.save();
    res.status(400);
    throw new Error("Incorrect verification code");
  }

  otp.verifiedAt = new Date();
  await otp.save();
  res.json({
    success: true,
    email,
    emailVerificationToken: generateToken(email, "10m"),
  });
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (or Admin only in production)
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    mineId,
    phone,
    employeeId,
    department,
    recaptchaToken,
  } = req.body;

  await verifyRecaptcha(recaptchaToken, res);

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "mine_official",
    mineId: mineId || null,
    phone,
    employeeId,
    department,
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mineId: user.mineId,
        phone: user.phone,
        employeeId: user.employeeId,
        department: user.department,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  await verifyRecaptcha(recaptchaToken, res);

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (user && (await user.matchPassword(password))) {
    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mineId: user.mineId,
        phone: user.phone,
        employeeId: user.employeeId,
        department: user.department,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "mineId",
    "name code",
  );

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (name !== undefined) user.name = name.trim();
  if (email !== undefined) user.email = email.trim().toLowerCase();
  if (phone !== undefined) user.phone = phone.trim();
  if (req.file) user.profilePicture = getStoredMediaPath(req.file);
  if (password) user.password = password;

  if (!user.name || !user.email) {
    res.status(400);
    throw new Error("Name and email are required");
  }

  if (password && password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  try {
    await user.save();
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("That email is already in use");
    }
    throw error;
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mineId: user.mineId,
      phone: user.phone,
      profilePicture: user.profilePicture,
    },
  });
});

module.exports = {
  requestEmailOtp,
  verifyEmailOtp,
  registerUser,
  loginUser,
  getMe,
  updateProfile,
};
