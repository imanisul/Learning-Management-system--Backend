import AppError from "../utlis/errorUtils.js";
import jwt from 'jsonwebtoken';

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if(!token){
        return next (new AppError('Unauthorized! please login!', 401));
    }

    const userDetials = await jwt.verify(token, process.env.JWT_SECRET)

    req.user = userDetials;
    next();
};

const authorizedRole = (...roles) => async (req, res, next) =>  {
    const currentUserRole = req.user.role;

    if(!roles.includes(currentUserRole)){
         return next (new AppError("You do not have the authority to access this page", 400));
    }
    next();
}

const authorizedsubscriber = async(req, res, next) => {
    const subscription = req.user.subscription;
    const currentUserRole = req.user.role;

    if(currentUserRole !== 'ADMIN' && subscription.status !== 'active'){
        return next(new AppError('Please subscribe to access this course!', 400));
    }

    next();
}

export {
    isLoggedIn,
    authorizedRole,
    authorizedsubscriber
}