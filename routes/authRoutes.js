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

    console.log("home")
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

// router.get('/',(req,res)=>{
   
//     res.render('firstpage')
// })

router.get('/subjects',auth,(req,res)=>{   // auth is a middleware which verfies if user is authenticated or not
    // console.log(req.user.subjects)
    console.log("subjects")
    res.render('subjects',{userInfo:req.user})
   })
   


router.get('/homepage',auth,(req,res)=>{
    console.log("homepage")
    res.render("homepage",{userInfo:req.user})
})

// router.get('/subjects',auth, (req,res)=>{
   
//     res.render('subjects',{userInfo:req.user})
   
// })

router.post('/addSubject',auth,async (req,res)=>{
    console.log("addSubject")
    try{
        // console.log(req.body)
       req.user.subjects= await req.user.subjects.concat({
            subject:{
                name:req.body.subject_name,
                description:req.body.subject_description,
                chapters:[]
            }
        })
        await req.user.save()
        res.redirect('/subjects')
    }catch(error){
        res.status(401).send(error)
    }     
})


router.get('/deleteSubject/:id',auth,async (req,res)=>{
    try{
        let subI=parseInt(req.params.id)
        await req.user.subjects.splice(subI,1)
        await req.user.save()
        res.render('subjects',{userInfo:req.user})
    }catch(e){
        res.status(401).send(e)
    }
})

router.get('/chapters/:id',auth,async (req,res)=>{
    try{
   
    let subjectNumber=parseInt(req.params.id);
   
    res.render('chapters',{userInfo:req.user,subjectNumber:parseInt(req.params.id)})
    }catch(e){
        res.status(401).send(e)
    }
    
})

router.post('/addChapter/:id',auth,async (req,res)=>{
    
    try{
        console.log(req.params.id)
        let subjectId=parseInt(req.params.id)
        console.log(req.user.subjects[subjectId])
        req.user.subjects[subjectId].subject.chapters=await req.user.subjects[subjectId].subject.chapters.concat({
            name:req.body.chapter_name,
            content:""
        })
        await req.user.save()
        res.redirect('/chapters/'+req.params.id)
    }catch(error){
        res.status(401).send(error)
    }


})

router.get('/editChapter/:id',auth,(req,res)=>{
       
        let chapterToEdit=req.params.id.split(",")
        console.log(chapterToEdit[0])
        console.log(chapterToEdit[1])
    res.render('editor',{userInfo:req.user,subjectNum:chapterToEdit[0],chapterNum:chapterToEdit[1]})
})

router.post('/saveChapter/:id',auth, async (req,res)=>{
    try{

        let chapterToEdit=req.params.id.split(",") // subject number , chapter number
        req.user.subjects[parseInt(chapterToEdit[0])].subject.chapters[parseInt(chapterToEdit[1])].content=JSON.stringify(req.body)
        await req.user.save()

        res.render("readChapter",{userInfo:req.user,editorHtml:req.body.data})
    }catch(e){
        console.log(e)
        res.status(401).send(e)
    }
   
})

router.get('/deleteChapter/:id',auth,async (req,res)=>{
    try{
        let chapterToDelete=req.params.id.split(",")
        let subI=parseInt(chapterToDelete[0])
        let chapI=parseInt(chapterToDelete[1])
        console.log(subI)
        console.log(chapI)
        await req.user.subjects[subI].subject.chapters.splice(chapI,1)
        await req.user.save()
        res.render('chapters',{userInfo:req.user,subjectNumber:subI})
    }catch(e){
        console.log(e)
        res.status(401).send(e)
    }
})

router.get('/readChapter/:id',auth, async (req,res)=>{
    try{

        let chapterToRead=req.params.id.split(",") // subject number , chapter number
        let html=await req.user.subjects[parseInt(chapterToRead[0])].subject.chapters[parseInt(chapterToRead[1])].content
        html=JSON.parse(html)
        res.render("readChapter",{userInfo:req.user,editorHtml:html.data})
    }catch(e){
        res.render('NotFound')
        console.log(e)
        res.status(401).send(e)
    }
   
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
    console.log("Successfully logged out")
    const userInfo= await req.user.save()
    res.redirect('/')
 }catch(error){
  res.status(401).send(error)
 }
})

router.post('/updateData',auth,(req,res)=>{
    console.log(req.body)
    res.json({msg:"updated"})
})

// router.get('/plan',auth,(req,res)=>{

//     res.render('plan',{userInfo:req.user})
// })

router.post('/setReminder',auth,(req,res)=>{

    let date=req.body.timedate.slice(0,10).split("-")  // year month date
    let time=req.body.timedate.slice(11,17).split(":")  //hour minute
    let message=req.body.message
    let hour=time[0]
    let minute=time[1]
    let month=date[1]
    let dom=date[2]
    console.log(date)
    console.log(time)
    console.log(req.body)
    // let date=req.body.phone
    // let month=req.body.month
       
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
        subject: "Reminder from Study-buddy",
        html: `
        Message : ${message}
        `,
    };

   cron.schedule(`${minute} ${hour} ${dom} ${month} *`,()=>{
        console.log("sent")
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
    console.log(req.body)
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


    // res.redirect('contactUs')
})

router.get('/aboutUs',(req,res)=>{
    res.render('aboutUs')
})
module.exports=router