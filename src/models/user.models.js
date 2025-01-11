import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcryp from "bcrypt"
import jwt from "jsonwebtoken";

const userSchema= new Schema({
    username:{
        type:String,
        required: true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required: true,
        lowercase:true,
        unique:true,
    },
    password:{
        type:String,
        required: [true, "Password is required!"],
    },
    fullName:{
        type:String,
        required: true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String,
    },
    watchHistory:{
        type:Schema.Types.ObjectId,
        ref:'Video'
    },
    refreshToken:{
        type:String
    }
}, {timestamps:true})


userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password = bcryp.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcryp.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.accessTokenSecret,
        {
            expiresIn: process.env.accessTokenExpiry
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.refreshTokenSecret,
        {
            expiresIn: process.env.refreshTokenExpiry
        }
    )
}


export const User = mongoose.model('User', userSchema);