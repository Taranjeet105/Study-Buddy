const express=require('express')
require('dotenv').config()
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const {mongoUrl}=require('./config/keys')
const cors = require('cors');
const app=express()
const PORT= process.env.PORT || 3000

require('./models/User')  // routes will come after this, because we are using models in routes

console.log(process.env.SECRET_KEY)
const authRoutes=require('./routes/authRoutes')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
app.set('view engine','ejs')
app.use(authRoutes)

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
