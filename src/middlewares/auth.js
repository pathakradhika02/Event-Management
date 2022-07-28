const userModel = require('../models/userModel');
const validator = require('../utils/validators');
const jwt = require('jsonwebtoken')

const authentication = async (req, res, next) => {
    try{
        const token = req.cookies.jwt ;
        if(!token) return res.status(400).send({status:"failed",message: "Please provide jwt token in cookies"});

        const userId = req.params.userId;
        if(!userId) return res.status(400).send({status:"failed",message: "Please provide userId in params"});
        if(!validator.isValidID(userId)) return res.status(400).send({status:"failed",message: "Please provide valid userId"});

        const userExist = await userModel.findOne({_id: userId});
        if(!userExist) return res.status(400).send({status:"failed",message: "User Not Exist"});

        let decodedtoken = jwt.verify(token, process.env.SECURITY_KEY, { ignoreExpiration: true });
            
        let time = Math.floor(Date.now() / 1000)
        if (decodedtoken.exp < time) {
            return res.status(401).send({ status: false, message: "Token expired, please login again" });
        }

        req.user = decodedtoken.userId
        next();
    }
    catch(error) {
        console.log(error);
        return res.status(500).send({status:"failed",message: error.message});
    }
}


module.exports = { authentication }