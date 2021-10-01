const express=require('express')
const router=express.Router()
const auth=require('../middleware/auth')
app=express()
app.use(express.urlencoded({extended:false}))

router.get('/subjects',auth,(req,res)=>{   // auth is a middleware which verfies if user is authenticated or not
    console.log("subjects")
    res.render('subjects',{userInfo:req.user})
   })


   router.post('/addSubject',auth,async (req,res)=>{
    console.log("addSubject")
    try{
       
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
module.exports=router
