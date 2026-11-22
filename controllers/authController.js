const {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken
} = require("../utils/generateTokens");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Signup Controller
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        // 3. Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        // 4. Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // 5. Check if user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // 6. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 7. Create new user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        // 8. Send response
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        // Handle duplicate email index race condition
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        console.error("Signup Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 2. Find user and explicitly retrieve password hash
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 3. Compare entered password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        

        const accessToken = generateAccessToken(user._id);

        // 5. Generate refresh token
        const refreshToken = generateRefreshToken();

        // 6. Store only the refresh token hash
        user.refreshTokenHash = hashRefreshToken(refreshToken);
        await user.save();

        // 7. Send response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        // Hash the incoming refresh token
        const oldTokenHash = hashRefreshToken(refreshToken);

        // Find user holding this refresh token
        const user = await User.findOne({
            refreshTokenHash: oldTokenHash
        }).select("+refreshTokenHash");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or revoked refresh token"
            });
        }

        // Generate replacement tokens
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken();
        const newTokenHash = hashRefreshToken(newRefreshToken);

        // Atomically replace old refresh token hash
        const result = await User.updateOne(
            {
                _id: user._id,
                refreshTokenHash: oldTokenHash
            },
            {
                $set: {
                    refreshTokenHash: newTokenHash
                }
            }
        );

        // Reject if token was already rotated or revoked
        if (result.modifiedCount !== 1) {
            return res.status(401).json({
                success: false,
                message: "Refresh token already used or revoked"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error("Refresh Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = { signup,login,getMe,refreshAccessToken};
