const jwt=require('jsonwebtoken')
const mongoose=require('mongoose')     
const User=mongoose.model('User')   // usimg database by name but not by importing

const auth = async (req,res,next)=>{
    try{
        const token=req.cookies.jwt
        const verifyUser=jwt.verify(token,process.env.SECRET_KEY)
        const user= await User.findOne({_id:verifyUser._id})
        req.token=token
        req.user=user
        next()
    }catch(error){
       
        res.render('firstpage')
    }
}

module.exports=auth