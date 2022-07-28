const userModel = require("../models/userModel");
const validator = require("../utils/validators");
const otpModel = require("../models/otpModel");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


//  Function to register user
const registerUser = async (req, res) => {
    try {
        const reqBody = req.body;

        // CHECK: reqbody must contain data
        if (Object.keys(reqBody).length == 0) return res.status(400).send({ status: "failed", message: "Please provide data in request body" });
        let { name, email, password, cpassword } = reqBody;

        // CHECK: All fields are present
        if (!validator.isMissingOrEmpty(name)) return res.status(400).send({ status: "failed", message: "Please enter name" });
        if (!validator.isMissingOrEmpty(email)) return res.status(400).send({ status: "failed", message: "Please enter emailId" });
        if (!validator.isMissingOrEmpty(password)) return res.status(400).send({ status: "failed", message: "Please enter password" });
        if (!validator.isMissingOrEmpty(cpassword)) return res.status(400).send({ status: "failed", message: "Please enter confirm password" });

        // CHECK: password and confirm password must be same
        if (password != cpassword) return res.status(400).send({ status: "failed", message: "Password and confirm password must be same" });

        // CHECK : email is valid email and unique
        if (!validator.isValidEmail(email)) return res.status(400).send({ status: "failed", message: "Please enter valid emailId" });
        const isUniqueMail = await userModel.findOne({ email: email });
        if (isUniqueMail) return res.status(400).send({ status: "failed", message: "This emailId is already in use, please enter another emailId" });

        // ENCRYPTING PASSWORD
        let saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);
        reqBody.password = await bcrypt.hash(password, salt);

        const newUser = await userModel.create(reqBody);
        return res.status(201).send({ status: "success", message: "User registered successfully", data: newUser });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: "failed", message: error.message });
    }
}


//  Function to login user
const loginUser = async (req, res) => {
    try {
        const reqBody = req.body;

        // CHECK: reqbody must contain data
        if (Object.keys(reqBody).length == 0) return res.status(400).send({ status: "failed", message: "Please provide data in request body" });
        let { email, password } = reqBody;

        // CHECK: All fields are present
        if (!validator.isMissingOrEmpty(email)) return res.status(400).send({ status: "failed", message: "Please enter emailId" });
        if (!validator.isMissingOrEmpty(password)) return res.status(400).send({ status: "failed", message: "Please enter password" });

        // CHECK : email is valid email 
        if (!validator.isValidEmail(email)) return res.status(400).send({ status: "failed", message: "Please enter valid emailId" });

        //  CHECK : user with entered email is exist or not
        let user = await userModel.findOne({ email: email });
        if (!user) return res.status(400).send({ status: false, message: "No user found...." });

        // DECRYPTING PASSWORD
        let validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).send({ status: false, message: "Wrong password ,please enter correct password..." });

        // Generate : JWT token
        const token = jwt.sign({
            userId: user._id.toString(),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 120 * 60
        }, process.env.SECURITY_KEY);

        res.cookie('jwt',token)
        return res.status(200).send({ status: "success", message: "User loged-in successfully", data: {user: user, authenticationToken: token} });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: "failed", message: error.message });
    }
}


//  Function to login user
const logoutUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if(userId!=req.user) return res.status(403).send({status:"failed", message: "You haven'e right to perform the task"});

        res.clearCookie('jwt');

        return res.status(200).send({ status: "success", message: "User loged-out successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: "failed", message: error.message });
    }
}


//  Function to Changed password
const changePassword = async (req, res) => {
    try {
        const reqBody = req.body;
        const userId = req.params.userId;

        // CHECK: reqbody must contain data
        if (Object.keys(reqBody).length == 0) return res.status(400).send({ status: "failed", message: "Please provide data in request body" });
        let { password, newPassword } = reqBody;

        // CHECK: All fields are present
        if (!validator.isMissingOrEmpty(password)) return res.status(400).send({ status: "failed", message: "Please enter password" });
        if (!validator.isMissingOrEmpty(newPassword)) return res.status(400).send({ status: "failed", message: "Please enter new password" });

        // Fetch : user details
        const user = await userModel.findOne({_id: userId});

        // CHECK: authorization
        if(req.user!=userId) return res.status(403).send({ status: false, message: "You haven't right to change password" });

        // CHECK : entered password is right password
        let validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).send({ status: false, message: "Wrong password ,please enter correct password..." });
        
        // ENCRYPTING NEW PASSWORD
        let saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);
        newPassword = await bcrypt.hash(password, salt);

        // Upadating : password
        await userModel.updateOne({_id: userId}, {password: newPassword}, {new: true})
        return res.status(200).send({ status: "success", message: "Password Changed successfully"});
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: "failed", message: error.message });
    }
}


//  Function to reset password ( generate OTP )
const generateOTP = async (req,res) => {
    try{
        
        const email =  req.body.email

        if (!validator.isMissingOrEmpty(email)) return res.status(400).send({ status: "failed", message: "Please enter emailId" })

        // CHECK : USER EXIST
        const userExist = await userModel.findOne({email: email});
        if(!userExist) return res.status(400).send({status: false, message: "User doesn't exist"})

        // CHECK : OTP EXIST FOR USER
        const otpExist = await otpModel.findOne({email: email})
        if(otpExist) {
            //  Dleting previous OTP details
            await otpModel.deleteOne({email: email})
        }

        let otp = [];
        for(let i=0 ; i<4 ; i++){
            const random = Math.ceil( Math.random() * 9);
            otp.push(random)
        }
        otp = otp.join('');
        // Sending Email
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.MAIL,
              pass: process.env.MAIL_PASSWORD
            }
          });

        const mailOptions = {
            from: "Event Management",
            to: email,
            subject: 'login OTP',
            text: `Hello ${userExist.name}, 
            Your one time password (OTP) is ${otp} , valid for only 5 minutes.`        
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            }
          });

        //  generate token
        const token = jwt.sign({
            email: email,
            otp : otp,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 5 * 60
        }, process.env.SECURITY_KEY);

        //  encrypt otp
        let saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);
        otp = await bcrypt.hash(otp, salt);
        
        let result = {
            email: email,
            otp: otp,
            otpToken : token
        }   
        await otpModel.create(result);
        return res.status(200).send({status: "success", message: "OTP generated successfully, check your mail..."});
    }
    catch(error) {
        console.log(error);
        return res.status(500).send({status: "failed", message: error.message});
    }
}


//  Function to verify password
const verifyOTP = async (req,res) => {
    try{
        const email = req.body.email
        const otp = req.body.otp

        // CHECK : USER EXIST
        const userExist = await userModel.findOne({email: email})
        if(!userExist) return res.status(400).send({status: false, message: "User doesn't exist"})

        // CHECK : OTP EXIST FOR USER
        const otpExist = await otpModel.findOne({email: email})
        if(!otpExist) return res.status(400).send({status: false, message: "PLEASE REQUEST FOR OTP FIRST"})

        // CHECK EXP OF TOKEN
        let decodedtoken = jwt.verify(otpExist.otpToken, process.env.SECURITY_KEY, { ignoreExpiration: true })
            
        let time = Math.floor(Date.now() / 1000)
        if (decodedtoken.exp < time) {
            // DELETING OTP DETAILS IS EXPIRED
            await otpModel.deleteOne({email: email})
            return res.status(401).send({ status: false, message: "OTP EXPIRED, REQUEST AGAIN" });
        }

        // VERIFY TOKEN
        let isValidOtp = await bcrypt.compare(otp, otpExist.otp);
        if (!isValidOtp) return res.status(400).send({ status: false, message: "Incorrect OTP, Please Enter Correct OTP..." });

        // DELETING OTP DETAILS AFTER SUCCESSFUL VERIFICATION
        await otpModel.deleteOne({email: email})
        res.status(200).send({status: true, message: "OTP VERIFIED SUCCESSFULLY..."})
    }
    catch(error) {
        console.log(error);
        return res.status(200).send({status: true, message: error.message});
    }
}


//  Function to update password
const updatePassword = async (req, res) => {
    try {
        const reqBody = req.body;

        // CHECK: reqbody must contain data
        if (Object.keys(reqBody).length == 0) return res.status(400).send({ status: "failed", message: "Please provide data in request body" });
        let { email, newPassword, cNewPassword } = reqBody;

        // CHECK: All fields are present
        if (!validator.isMissingOrEmpty(email)) return res.status(400).send({ status: "failed", message: "Please enter emailId"});
        if (!validator.isMissingOrEmpty(newPassword)) return res.status(400).send({ status: "failed", message: "Please enter new password"});
        if (!validator.isMissingOrEmpty(cNewPassword)) return res.status(400).send({ status: "failed", message: "Please enter confirm password"});

        // Fetch : user details
        const user = await userModel.findOne({email: email});

        // CHECK : new password and confirm new password is same
        if(newPassword!=cNewPassword) return res.status(400).send({ status: "failed", message: "New password and confrim password must be same"});
        
        // ENCRYPTING NEW PASSWORD
        let saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);
        newPassword = await bcrypt.hash(newPassword, salt);

        // Upadating : password
        await userModel.updateOne({email: email}, {password: newPassword}, {new: true})
        return res.status(200).send({ status: "success", message: "Password Updated successfully"});
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: "failed", message: error.message });
    }
}





module.exports = { registerUser, loginUser, logoutUser, changePassword, resetPassword: generateOTP, verifyOTP, updatePassword };