const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    phonenumber:{
        type:String,
        unique:true,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})


// generating jwt token
userSchema.methods.generateAuthToken = function(){     // name can be anything
        // console.log("hi")
        // console.log(process.env.SECRET_KEY)
        const token=jwt.sign({_id:this._id},process.env.SECRET_KEY)
        this.tokens=this.tokens.concat({token:token})
        
        return token
    
   
}   


// password hashing
userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password,10)
    }
    
    next();
})

mongoose.model('User',userSchema)