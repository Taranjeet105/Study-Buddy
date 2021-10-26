const express=require('express')
const mongoose=require('mongoose')
const User=mongoose.model('User')
const nodemailer=require("nodemailer")
const cron=require("node-cron")
const router=express.Router()
const jwt=require('jsonwebtoken')
const auth=require('../middleware/auth')
const bcrypt=require('bcryptjs')
app=express()
app.use(express.urlencoded({extended:false}))

router.get('/',async (req,res)=>{

    try{
        const token=req.cookies.jwt
        const verifyUser=jwt.verify(token,process.env.SECRET_KEY)
        if(verifyUser){
            res.redirect('/homepage')
        }else{
            res.render('firstpage')
        }
    }catch(e){
        res.render('firstpage')
    }

})


router.get('/homepage',auth,(req,res)=>{
    res.render("homepage",{userInfo:req.user})
})


 router.post("/signIn",async (req,res)=>{
  try{

  
    if(req.body.SignInpassword==req.body.cSignInpassword){
        const user=new User({
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
    
         // res.cookie() function is used to set the cookie name to value.
         // the value parameter may be a string or object converted to json.
         // res.cookie(name,value,{expires:new Date(Date.now()+3000), httpOnly:true,secure:true});
         if(resForToken.status){
            res.cookie('jwt',resForToken.token,{expires:new Date(Date.now()+600000000000000), httpOnly:true,secure: false});
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
            res.cookie('jwt',resForToken.token,{expires:new Date(Date.now()+600000000000000), httpOnly:true,secure: false});
        }
       
        if(isMatch){
            res.redirect('/homepage')
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
    const userInfo= await req.user.save()
    res.redirect('/')
 }catch(error){
  res.status(401).send(error)
 }
})


router.post('/setReminder',auth,(req,res)=>{

    let date=req.body.timedate.slice(0,10).split("-")  // year month date
    let time=req.body.timedate.slice(11,17).split(":")  //hour minute
    let message=req.body.message
    let hour=time[0]
    let minute=time[1]
    let month=date[1]
    let dom=date[2]
    
    var transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
         
        },
    });

    var mailOptions = {
        from: 'shantys502@gmail.com',
        to: req.user.email,
        subject: "Reminder from Study-buddy",
        html: `
        Message : ${message}
        `,
    };

   cron.schedule(`${minute} ${hour} ${dom} ${month} *`,()=>{
        
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.json({success:false,message:error})
            } else {
              console.log("Email sent: " + info.response);
            return res.json({success:true,message:"message sent"})
            }
        })
    },{
        scheduled: true,
        timezone: "Asia/Kolkata"
      }

    )
    res.redirect('/subjects')
})

router.get('/contactUs',(req,res)=>{
    res.render('contactUs')
})

router.post('/contactUs',(req,res)=>{
   
    let name=req.body.name
    let senderEmail=req.body.email
    let phone=req.body.phone
    let message=req.body.message
       
    var transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
         
        },
    });

    var mailOptions = {
        from: 'shantys502@gmail.com',
        to: 'shantys502@gmail.com',
        subject: "User Query on Study-buddy",
        html: `
        Name of the sender : ${name}
        <br/>
        Email of the sender : ${senderEmail}
        <br/>
        Phone number of the Sender : ${phone}
        Message : ${message}
        `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return res.json({success:false,message:error})
        } else {
          console.log("Email sent: " + info.response);
        return res.json({success:true,message:"message sent"})
        }
    });

})

router.get('/aboutUs',(req,res)=>{
    res.render('aboutUs')
})

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

router.get('/forgotPassword',(req,res)=>{
    res.render('forgotPassword')
})

router.put('/forgotPassword', async(req,res)=>{
    try{
        var userEmail = req.body.email
        var currentUser = await User.findOne({email:userEmail})
       
        if(!currentUser)
        {
            throw new Error('user not found')
        }

        // generating a random token 
        var randomToken = makeid(10)

        currentUser.forgotPassword = randomToken
        currentUser.save()
        .then(()=>{
            var transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASSWORD,
                 
                },
            });
        
            var mailOptions = {
                from: "shantys502@gmail.com",
                to: userEmail,
                subject: "Forgot password",
                html: `
                Message : You forgot your password
                <br/>
                No worries !! We have you covered
                <br/>
                <p>Proceed to this <a target="_blank" href="https://studdy-buddyy.herokuapp.com/resetPassword/${userEmail}/${randomToken}">link</a> to reset your password</p>
                `,
            };
            // https://studdy-buddyy.herokuapp.com/
            // http://localhost:3000/resetPassword
    
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Email sent: " + info.response);
                return res.json({message:"verification code sent to your email"})
                }
            });
        })

        
        res.status(200).json({status:true , message:'Check your mail for reset password link'})

    }catch(error){
        // console.log(error.message)
        res.status(400).json({status:false , message:error.message})
    }
})

router.get('/resetPassword/:email/:id',(req,res)=>{
    res.render('resetPassword')
})

router.put('/resetPassword',async(req,res)=>{
    try{
        var userEmail = req.body.email
        var userOTP =  req.body.otp
        var newPassword = req.body.newPassword
        var currentUser = await User.findOne({email:userEmail})

        if(!currentUser)
        {
            throw new Error('No user found')
        }

        if(!userOTP || userOTP == undefined ||  userOTP != currentUser.forgotPassword)
        {
            throw new Error('Invalid OTP');
        }

        if(!newPassword || newPassword.length == 0)
        {
            throw new Error('Please provide a valid password')
        }

        currentUser.password = newPassword
        var savedUser = await currentUser.save();
        
        res.status(200).json({status:true , message:"Password updated successfully"})
        

    }catch(error){
       
        return res.status(400).json({status:false, message:error.message})
    }
})

module.exports=router