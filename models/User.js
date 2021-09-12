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
    subjects:[{subject:{
            name:{
                type:String,
            },
            description:{
                type:String,
            },
           chapters:[{
            name:{
                type:String,
            },
            content:{
                type:String
            }
           }]
    }
    }],
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})


// generating jwt token
userSchema.methods.generateAuthToken = async function(){     // name can be anything
        // console.log("hi")
        // console.log(process.env.SECRET_KEY)
        try{
            const token=await jwt.sign({_id:this._id},process.env.SECRET_KEY)
            this.tokens=await this.tokens.concat({token:token})
            await this.save()
           
            return {token:token,msg:"user registered succesfully",status:true}
        }catch(error){
            console.log(error)
            return {msg:"Email or phone already exists",status:false}
        }
        
        
        
    
   
}   


// password hashing
userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password,10)
    }
    
    next();
})

mongoose.model('User',userSchema)