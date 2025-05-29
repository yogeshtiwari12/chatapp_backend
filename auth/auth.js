import jwt from "jsonwebtoken";
import User from "../models/user_model.js";
const jwtkey = "abcdefghijkdadaafbfasfsfjaf";


export const verifytoken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Token not found' });
        }
        const decoded = jwt.verify(token, jwtkey);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User is not valid' });
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({ message:error.message  });
    }
}

export const isadmin = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({error: "Not authorized to access this route"})
        }
        next();
    }
}