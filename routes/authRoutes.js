const express=require('express')
const mongoose=require('mongoose')
const User=mongoose.model('User')
const router=express.Router()
const auth=require('../middleware/auth')
const bcrypt=require('bcryptjs')
app=express()
app.use(express.urlencoded({extended:false}))
router.get('/',(req,res)=>{
    res.render('firstpage')
})

router.get('/subjects',auth,(req,res)=>{   // auth is a middleware which verfies if user is authenticated or not
    
    res.render('subjects',{userInfo:req.user})
   })
   

router.post('/subjects',auth,(req,res)=>{
    console.log(req.body)
    res.render('subjects',{userInfo:req.user})
})

 router.post("/signIn",async (req,res)=>{
  try{

  
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

         const resForToken=await user.generateAuthToken()
         console.log("token response")
         console.log(resForToken)
         // res.cookie() function is used to set the cookie name to value.
         // the value parameter may be a string or object converted to json.
         // res.cookie(name,value,{expires:new Date(Date.now()+3000), httpOnly:true,secure:true});
         if(resForToken.status){
            res.cookie('jwt',resForToken.token,{expires:new Date(Date.now()+600000), httpOnly:true,secure: false});
            res.json({msg:"User Registered Succcessfully",status:true})
         }else{
             
            res.json({msg:resForToken.msg,status:false})
         }
         

    }else{
        res.json({msg:"Passwords are not matching",status:false})
    }
}catch(error){
   res.json({msg:error,status:false})
}
     
 })

 router.post('/login', async (req,res)=>{
     try{
        const verifyUser= await User.findOne({email:req.body.email})
        const isMatch= await bcrypt.compare(req.body.password,verifyUser.password)

        const resForToken=await verifyUser.generateAuthToken()  // must be await because returning promise
    
        if(resForToken.status){
            res.cookie('jwt',resForToken.token,{expires:new Date(Date.now()+600000), httpOnly:true,secure: false});
        }
       
        if(isMatch){

            res.render("homepage",{userInfo:verifyUser})
        }else{
            res.send("Invalid login hello Id and Passwword!!!")
        }
     }catch(error){ 
          res.send("Invalid Login Id  and password!!!")
     } 
 })

router.get('/logout',auth,async (req,res)=>{
 try{
     
    req.user.tokens=req.user.tokens.filter((currToken)=>{
        return currToken.token!=req.token
    })
    res.clearCookie("jwt")
    console.log("Successfully logged out")
    const userInfo= await req.user.save()
    res.render('firstpage')
 }catch(error){
  res.status(401).send(error)
 }
})

router.post('/updateData',(req,res)=>{
    console.log(req.body)
    res.json({msg:"updated"})
})

module.exports=router