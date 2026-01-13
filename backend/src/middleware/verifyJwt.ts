import jwt ,{JwtPayload} from "jsonwebtoken";
import { Request,Response,NextFunction } from "express";

interface AuthRequest extends Request{
    userId?:number;
    role?:string;
}

interface AuthPayload extends JwtPayload {
  id?: number;
  role?: string;
}

const verifyJWT=(req:AuthRequest,res:Response,next:NextFunction)=>{
    const authHeader=req.headers.authorization || req.headers.Authorization;
    
    if(!authHeader) return res.status(401).send("no auth header");//unauthorized
    
    console.log("authheaders",authHeader);

    const token =(authHeader as string).split(' ')[1];

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET as string,
        (err,decoded)=>{
            if(err) return res.status(403).send("expired or invalid token");//forbiden
            const payload = decoded as AuthPayload;
            req.userId=payload?.id;
            req.role=payload?.role;
            console.log('req.user',req.userId)
            console.log('req.role',req.role)
             
            next();
        }
    )
}

export default verifyJWT;

