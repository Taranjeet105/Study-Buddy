const express=require('express')
require('dotenv').config()
const path=require('path')
const cookieParser=require('cookie-parser')
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const {mongoUrl}=require('./config/keys')
const cors = require('cors');
const multer=require('multer')
const app=express()

const PORT= process.env.PORT || 3000
app.use(cookieParser())
require('./models/User')  // routes will come after this, because we are using models in routes
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))

const authRoutes=require('./routes/authRoutes')
const chapterRoutes=require('./routes/chapterRoutes')
const subjectRoutes=require('./routes/subjectsRoutes')
// const staticPath=path.join(__dirname,'./public/editorcontent')
const backgroundImgPath=path.join(__dirname,'./assets')
console.log(backgroundImgPath)
// app.use(express.static(staticPath))
app.use(express.static(backgroundImgPath))

app.use(cors())
app.set('view engine','ejs')



app.use(authRoutes)
app.use(chapterRoutes)
app.use(subjectRoutes)



mongoose.connect(mongoUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true

}).then(()=>{
    console.log("succes")
}).catch((e)=>{
    console.log(e)
})

app.listen(PORT,()=>{
    console.log("server running on PORT "+PORT)
})
