const express=require('express')
const router=express.Router()
const auth=require('../middleware/auth')
app=express()
app.use(express.urlencoded({extended:false}))

router.get('/chapters/:id',auth,async (req,res)=>{
    try{
   
    res.render('chapters',{userInfo:req.user,subjectNumber:parseInt(req.params.id)})
    }catch(e){
        res.status(401).send(e)
    }
    
})

router.post('/addChapter/:id',auth,async (req,res)=>{
    
    try{
       
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
        res.render('readChapter',{userInfo:req.user,editorHtml:""})
    }

})
module.exports=router