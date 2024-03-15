import { User } from "../models/userModel.js";
import AppError from '../utlis/errorUtils.js';
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import sendEmail from "../utlis/sendEmail.js";
import crypto from 'crypto';

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure : true
}

const register = async (req, res, next) => {
   try {
    const {fullname, number, email, password} = req.body;

   if(!fullname || !number || !email || !password){
    return next(new AppError('All fields are required', 400))
   }

   const userExists = await User.findOne({email});
   if(userExists){
    return next(new AppError('User already exists!', 400));
   }

   const user = await User.create({
     fullname,
     number,
     email,
     password,
     avatar: {
        public_id: email,
        secure_url:' https://cloudinary-res.cloudinary.com/image/upload/website/cloudinary_web_favicon.png'
     }
   });

   if(!user){
     return next(new AppError('Unable to create User, please try again!', 400));
   }

   //file upload
   if(req.file){
    try {
        const result = await cloudinary.v2.uploader.upload(req.file.path,{
            folder: 'lms',
            width: 250,
            height: 250,
            gravity: 'faces',
            crop: 'fill',

        });
        if(result){
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url = result.secure_url;

            //remove file from server
           fs.rm(`uploads/${req.file.filename}`);
        }
    } catch (error) {
        return next(new AppError(error || 'Unable to upload file, please try again!', 500))
    }
   }

   await user.save();
   user.password = undefined;

   const token = await user.generateJWTToken();

   res.cookie('token', token, cookieOptions)

   res.status(200).send({
    message: "User created successfully",
    success: true,
    user,
   })
   } catch (error) {
      return next(new AppError(error.message, 500));
   }
};

const login = async (req, res, next) => {
        
    const {email, password} = req.body;

    if (!email || !password) {
        return next(new AppError('Email and Password are required', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    // If no user or sent password do not match then send generic response
    if (!(user && (await user.comparePassword(password)))) {
      return next(
        new AppError('Email or Password do not match or user does not exist', 401)
      );
    }

  // Generating a JWT token
  const token = await user.generateJWTToken();

  // Setting the password to undefined so it does not get sent in the response
  user.password = undefined;

  // Setting the token in the cookie with name token along with cookieOptions
  res.cookie('token', token, cookieOptions);

  // If all good send the response to the frontend
  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    user,
  });
};

const  logout = (req, res) => {
      res.cookie('token', null,{
         secure: true,
         maxAge: 0,
         httpOnly: true
      });

      res.status(200).send({
        message: "Logged out Successfully!",
        success: true,
      });
};

const getProfile = async (req, res, next) => {
     try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        res.status(200).send({
            success: true,
            message: 'User detials...',
            user
        });
     } catch (error) {
        return next(new AppError('Failed to fetch user detials', 500));
     }
};

const forgotPassword = async (req, res, next) => {
        const {email} = req.body;

        if(!email){
            return next(new AppError('Email is required!', 400));
        }

        const user = await User.findOne({email});
        if(!user){
            return next(new AppError("Email doesn't exists!", 400));
        }

        const resetToken = await user.generatePasswordResetToken();
        await user.save();

        const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log(resetPasswordURL)

        const subject = 'Reset Password'
        const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reser Your Password</a>\n If the above link doesn't works then copy paste the link in new tab ${resetPasswordURL}`

        try {
            await sendEmail(email, subject, message);

            res.status(200).send({
                message: `Reset Password Email has been sent to ${email}`,
                success: true
            })
        } catch (error) {

            user.forgotPasswordExpiry = undefined;
            user.forgotPasswordToken = undefined;

            await user.save();

            return next(new AppError(error.message, 500));
        }
};

const resetPassword = async (req, res, next) => {
   const {resetToken} = req.params;

   const {password} = req.body;

   const forgotPasswordToken = crypto
       .createHash('sha256')
       .update(resetToken)
       .digest('hex');

       const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: {$gt: Date.now()}
       });

       if(!user){
        return next (new AppError('Token is invalid or expired, please try again', 400 ));
       }

       user.password = password;

       user.save();

       res.status(200).send({
        message: "Password changed Successfully!",
        success: true
       })

};

const changePassword = async (req, res, next) => {
    const {oldPassword, newPassword} = req.body;
    const { id } = req.user;

    if(!oldPassword || !newPassword){
        return next(new AppError("All fields are required", 400));
    }

    const user = await User.findById(id).select('+password');

    if (!user){
        return next (new AppError("User does't exist.", 400));
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid){
        return next (new AppError("Old password doesn't match", 400));
    };

    user.password = newPassword;

    await user.save();

    user.password = undefined;

    res.status(200).send({
        message: "Password changed successfully!",
        success: true
    })
};

const updateProfile = async (req, res, next) => {
    const {fullname} = req.body;
    const {id} = req.user.id;

    const user = await User.findById(id);

    if(!user){
        return next (new AppError("User doesn't exist!", 400));
    }

    if(fullname){
        user.fullname = fullname;
    }

    if(req.file){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        if(req.file){
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path,{
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill',
        
                });
                if(result){
                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;
        
                    //remove file from server
                   fs.rm(`uploads/${req.file.filename}`);
                }
            } catch (error) {
                return next(new AppError(error || 'Unable to upload file, please try again!', 500))
            }
           }
    }
    await user.save();

    res.status(200).json({
        message: 'Profile updated successfully!',
        success: true
    })

}




export { 
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
}
