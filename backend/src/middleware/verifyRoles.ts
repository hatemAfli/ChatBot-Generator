import { Request,Response,NextFunction } from "express"

interface CustomRequest extends Request {
    role ?: string;
}

const verifyRole=(...allowedRoles:string[])=>{

    return (req:CustomRequest,res:Response,next:NextFunction) => {
    
        console.log("allowed roles ",allowedRoles)
        console.log("user Role ",req.role)

        const userRole=req.role;
        
        if(!userRole || !allowedRoles.includes(userRole))
        {
            res.status(403).send("not allowed")
        }
        
        next()

}

}


export default verifyRole ;