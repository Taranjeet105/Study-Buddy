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
    // console.log(req.user.subjects)
    res.render('subjects',{userInfo:req.user})
   })
   


router.get('/homepage',auth,(req,res)=>{

    res.render("homepage",{userInfo:req.user})
})

router.get('/subjects',auth, (req,res)=>{
   
    res.render('subjects',{userInfo:req.user})
   
})

router.post('/addSubject',auth,async (req,res)=>{
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
    res.render('firstpage')
 }catch(error){
  res.status(401).send(error)
 }
})

router.post('/updateData',auth,(req,res)=>{
    console.log(req.body)
    res.json({msg:"updated"})
})

module.exports=router