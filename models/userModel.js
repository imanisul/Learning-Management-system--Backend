import mongoose, { Schema, model} from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
   fullname : {
    type: String,
    required: [true, 'Name is required']

   },
   number: {
    type: Number,
    unique: true,
    minLength: [10, "Please enter your 10 digit phone number"],
    maxLength:  [10, 'Please enter your 10 digit phone number'],
    required: [true, 'Phone number is required']
   },
   email:{
    type:String,
    unique: true,
    trim: true, 
    lowercase: true,
    required: [true, 'Email is required'],
    match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please enter vaild email id '
    ] 
    // regex expression for using vaild email address

   },
   password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'Password must be of 8 charcter'],
    select: false
   },
   avatar: {
    public_id:{
        type: 'String',
    },
    secure_url: {
        type: 'String'
    }
},
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default:'USER'
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    subscription: {
        id: String,
        status: String
    },
   },
   {timestamps: true});

   //password ercyption
   userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
   });

   userSchema.methods = {
    generateJWTToken:  async function(){
        return jwt.sign(
            { id: this._id, email: this.email, subscription: this.subscription, role: this.role },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY,
            }
        )
    },
    comparePassword: async function(plainTextPassword){
      return await bcrypt.compare(plainTextPassword, this.password)
    },
    generatePasswordResetToken : async function() {
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')
        ;    
        this.forgotPasswordExpiry = Date.now() + 5 * 60 * 1000; //5 min from now

        return resetToken;
    }

   }

export const User = mongoose.model("User", userSchema)