const express=require('express')
const mongoose=require('mongoose')
const User=mongoose.model('User')
const router=express.Router()
const bcrypt=require('bcryptjs')
router.get('/',(req,res)=>{
    res.render('firstpage')
})

 router.post("/signIn",(req,res)=>{
  
    if(req.body.SignInpassword==req.body.cSignInpassword){
        const  user=new User({
            firstname:req.body.SignInUserName,
            lastname: req.body.SignInLUserName,
            age: req.body.SignInUserAge,
            phonenumber: req.body.SignInUserPhone,
            gender:req.body.SignInUserGender,
            email: req.body.SignInEmail,
            password: req.body.SignInpassword,
         })
    
         // middleware is set between getting data and saving data in models
    
         user.save()
         .then(()=>{
            console.log("User Registered Succcessfully")
            res.json({msg:"User Registered Succcessfully",status:true})
         }).catch((e)=>{
             console.log(e)
             res.json({msg:"Email or phone already registered",status:e})
         })

    }else{
        res.send("Passwords are not matching")
    }
   
     
 })

 router.post('/login', async (req,res)=>{
     try{
        const verifyUser= await User.findOne({email:req.body.email})
        const isMatch= await bcrypt.compare(req.body.password,verifyUser.password)
        if(isMatch){
            res.render("homepage")
        }else{
            res.send("Invalid login Id and Passwword!!!")
        }
     }catch(error){
         console.log(error)
          res.send("Invalid Login Id  and password!!!")
     } 
 })

module.exports=router