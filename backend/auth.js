const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

function auth(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        return res.json({message: "unauthorized person"})
    }

    jwt.verify(token, process.env.jwt_Secret, (err, decoded) => {
        if(err){
            return res.json({message:"forbidden-authentication"})
        }
        req.user = decoded;
        next();
    })
}

function roleAuth(allowedRoles){
    return (req, res, next) => {
        const userRole = req.user.role;
        console.log(allowedRoles, userRole)
        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({message:"forbidden-authroization"})
        }
        next()
    }
}
module.exports = {auth,roleAuth};