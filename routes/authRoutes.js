const express=require('express')
const mongoose=require('mongoose')
const User=mongoose.model('User')
const router=express.Router()
const bcrypt=require('bcryptjs')
app=express()
app.use(express.urlencoded({extended:false}))
router.get('/',(req,res)=>{
    res.render('firstpage')
})

router.get('/secret',(req,res)=>{
       console.log(req.cookies.jwt)
       res.render('secret')
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
         const token=user.generateAuthToken()

         // res.cookie() function is used to set the cookie name to value.
         // the value parameter may be a string or object converted to json.
         // res.cookie(name,value,{expires:new Date(Date.now()+3000), httpOnly:true,secure:true});
         res.cookie('jwt',token,{expires:new Date(Date.now()+600000), httpOnly:true,secure: false});
        //  res.cookie("jwt",token)
        
         user.save()
         .then(()=>{
            // console.log("User Registered Succcessfully")
            res.json({msg:"User Registered Succcessfully",status:true})
         }).catch((e)=>{
            //  console.log(e)
             res.json({msg:"Email or phone already registered",status:false})
         })

    }else{
        res.json({msg:"Passwords are not matching",status:false})
    }
   
     
 })

 router.post('/login', async (req,res)=>{
     try{
        const verifyUser= await User.findOne({email:req.body.email})
        const isMatch= await bcrypt.compare(req.body.password,verifyUser.password)

        const token=verifyUser.generateAuthToken()
        res.cookie('jwt',token,{expires:new Date(Date.now()+600000), httpOnly:true,secure: false});
        
        if(isMatch){
            res.render("homepage")
        }else{
            res.send("Invalid login hello Id and Passwword!!!")
        }
     }catch(error){
         console.log(error)    
          res.send("Invalid Login Id  and password!!!")
     } 
 })


module.exports=router