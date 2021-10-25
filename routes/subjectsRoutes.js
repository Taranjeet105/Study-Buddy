const express=require('express')
const router=express.Router()
const auth=require('../middleware/auth')
const multer=require('multer')
const fs=require('fs')
const path=require('path')
const upload=require('../middleware/fileUploader')
app=express()
app.use(express.urlencoded({extended:false}))

router.get('/subjects',auth,(req,res)=>{   // auth is a middleware which verfies if user is authenticated or not
   
    res.render('subjects',{userInfo:req.user})
   })


   router.post('/addSubject',auth,async (req,res)=>{

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


router.post('/files/:id',auth,upload.single('userFile'), async (req,res)=>{
    try{
        let indices=req.params.id.split(',')
        let subjI=parseInt(indices[0])
        let chapI=parseInt(indices[1])
 
        req.user.subjects[subjI].subject.chapters[chapI].files=await req.user.subjects[subjI].subject.chapters[chapI].files.concat({
         name:req.body.documentName,
         location:( req.file.filename),
        
        })
        await req.user.save()
        res.redirect('/editChapter/'+subjI+","+chapI)
        //  res.json({status:true,msg:"succesfully uploaded",data:req.body})
    }catch(e){
        console.log(e)
        res.status(401).send(e)
    }
   
})

router.get('/delete_PDF_file/:id',auth,async (req,res)=>{
    try{

        let indices=req.params.id.split(',')
        let subjI=parseInt(indices[0])
        let chapI=parseInt(indices[1])
        let fileI=parseInt(indices[2])
        let loc=req.user.subjects[subjI].subject.chapters[chapI].files[fileI].location

    let filePath = path.join(__dirname,'../uploads') ////////////////////////
   
    fs.unlinkSync(filePath+"/"+loc);
    let editorFile={
        "time" : 1550476186479,
        "blocks" : [
        
        {
        "type" : "header",
        "data" : {
        "text" : "" }
        },
        {
            "type" : "paragraph",
            "data" : {
            "text" : ""
            }
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
        
        await req.user.subjects[subjI].subject.chapters[chapI].files.splice(fileI,1)
        await req.user.save()

       res.redirect('/editChapter/'+subjI+','+chapI)
    
    }catch(e){
        res.status(401).send(e)
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
