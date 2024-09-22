import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { uploadOnCloudinary } from '../utils/cloudnary.js';


// Register a new user
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarlocalpath = req.file.path;
    const avatar = await uploadOnCloudinary(avatarlocalpath);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: avatar.url
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
 
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json({
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: 'User logged in successfully'
      });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Logout user
export const logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json({ message: 'User logged out' });
}

// Change password
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error });
  }
};

// Get current user details
export const getCurrentUserDetails = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId, 'username email avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error });
  }
};

// Get all users with query support
export const getUsers = async (req, res) => {
  const { username, email } = req.query;
  try {
    const query = {};
    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    const users = await User.find(query, 'username email avatar');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// Get user details
export const getUserDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId, 'username avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error });
  }
};
