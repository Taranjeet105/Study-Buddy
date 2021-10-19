const express=require('express')
const router=express.Router()
const auth=require('../middleware/auth')
app=express()
app.use(express.urlencoded({extended:false}))

router.post('/saveEditorData/:id',auth, async(req,res)=>{

    try{
        let editorFileIndices=req.params.id.split(",")
        let subjI=editorFileIndices[0]
        let chapI=editorFileIndices[1]
      
        console.log(req.body)
        req.user.subjects[subjI].subject.chapters[chapI].editorFiles=await req.user.subjects[subjI].subject.chapters[chapI].editorFiles.concat({
            name:req.body.name,
            content:JSON.stringify(req.body.code)
        })
        await req.user.save()
        res.json({message:"success"})
    }catch(e){
        console.log(e)
        res.json({message:"error"})
       
    }

    
})


router.post('/updateEditorData/:id',auth,async (req,res)=>{
    try{
        let indices=req.params.id.split(',')
        let subjI=parseInt(indices[0])
        let chapI=parseInt(indices[1])
        let fileI=parseInt(indices[2])
        console.log(req.body)
       req.user.subjects[subjI].subject.chapters[chapI].editorFiles[fileI].content= JSON.stringify(req.body)
        await req.user.save()
        res.json({message:"success"})
    }catch(e){
        res.status(401).send(e)
        res.json({message:"fail"})
    }
    })


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
        let editorFile={
            "time" : 1550476186479,
            "blocks" : [
            {
            "type" : "paragraph",
            "data" : {
            "text" : ""
            }
            },
            {
            "type" : "header",
            "data" : {
            "text" : "" }
            },
            {
            "type" : "paragraph",
            "data" : {
            "text" : "So what do we have?"
            }
            }
            ],
            "version" : "2.18.0"
            }
        
    res.render('editor',{userInfo:req.user,editorFile:
       JSON.stringify(editorFile) ,subjectNum:chapterToEdit[0],chapterNum:chapterToEdit[1],fileNumber:0})
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

router.get('/delete_Editor_File/:id',auth,async (req,res)=>{
    try{
        let indices=req.params.id.split(",")
        let subI=parseInt(indices[0])
        let chapI=parseInt(indices[1])
        let fileI=parseInt(indices[2])
        console.log(subI)
        console.log(chapI)
        console.log(fileI)
        await req.user.subjects[subI].subject.chapters[chapI].editorFiles.splice(fileI,1)
        await req.user.save()
        let editorFile={
            "time" : 1550476186479,
            "blocks" : [
            {
            "type" : "paragraph",
            "data" : {
            "text" : ""
            }
            },
            {
            "type" : "header",
            "data" : {
            "text" : "" }
            },
            {
            "type" : "paragraph",
            "data" : {
            "text" : "So what do we have?"
            }
            }
            ],
            "version" : "2.18.0"
            }
        console.log("editChapter")
    res.render('editor',{userInfo:req.user,editorFile:
       JSON.stringify(editorFile) ,subjectNum:subI,chapterNum:chapI,fileNumber:fileI})

    }catch(e){
        console.log(e)
        res.status(401).send(e)
    }
})



router.get('/specificFile/:id',auth,(req,res)=>{
    let indices=req.params.id.split(',')
    let subjI=parseInt(indices[0])
    let chapI=parseInt(indices[1])
    let fileI=parseInt(indices[2])
    let location=req.user.subjects[subjI].subject.chapters[chapI].files[fileI].location
    res.render('showRequestedFile',{userInfo:req.user,location:location,subjectNum:subjI,chapterNum:chapI,fileNumber:fileI})
})


router.get('/specificEditorFile/:id',auth,(req,res)=>{
    let indices=req.params.id.split(',')
    let subjI=parseInt(indices[0])
    let chapI=parseInt(indices[1])
    let fileI=parseInt(indices[2])
    let requestedEditorFile=req.user.subjects[subjI].subject.chapters[chapI].editorFiles[fileI].content
    res.render('editor',{userInfo:req.user,editorFile:requestedEditorFile,subjectNum:subjI,chapterNum:chapI,fileNumber:fileI})
})


module.exports=router