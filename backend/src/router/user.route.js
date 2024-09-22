import express from 'express';
import { upload } from '../middleware/multer.js';
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUserDetails,
  getUserDetails,
  getUsers,
  changePassword,

} from '../controller/user.controller.js';
import { VerifyJWT } from '../middleware/auth.middleware.js';
import { getChatHistory } from '../controller/message.controller.js';

const router = express.Router();

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', loginUser);
router.post('/logout', VerifyJWT, logoutUser);
router.put('/change-password', VerifyJWT, changePassword);
router.get('/current-user', VerifyJWT, getCurrentUserDetails);
router.get('/users', VerifyJWT, getUsers);
router.get('/u/:userId', VerifyJWT, getUserDetails);

router.get('/c/:senderId', VerifyJWT, getChatHistory)

export default router;
