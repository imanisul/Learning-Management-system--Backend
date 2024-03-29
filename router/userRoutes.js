import { Router } from "express";
import { changePassword, forgotPassword, getProfile, login, logout, register, resetPassword, updateProfile } from "../controllers/userController.js";
import {isLoggedIn }from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multermiddleware.js";

const router = Router();

router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn, getProfile);
router.post('/reset', forgotPassword);
router.post('/reset/:resetToken', resetPassword);
router.post('/change-password', isLoggedIn, changePassword);
router.put('/updateprofile/:id', isLoggedIn,upload.single('avatar'), updateProfile)

export default router;
