import type { Request,Response } from "express";
import { SigninSchema, SignupSchema } from "../types/zod.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "../types/types.js";
import { email } from "zod";
import prisma from "../lib/index.js";

export const userSignUp = async (req:Request,res:Response)=>{
    const parseData = SignupSchema.safeParse(req.body);
    if (!parseData.success){
        res.json({
            message : "parseData is wrong"
        })
        return;
    }
    try{
        const existingUser = await prisma.user.findUnique({
            where :{
                email : parseData.data.email
            }
        })
        if (existingUser){
            res.json({
                message : "user already exist"
            })
            return;
        }
        const hashPassword = await bcrypt.hash(parseData.data.password,10)
        const user = await prisma.user.create({
            data:{
                name : parseData.data.name,
                email : parseData.data.email,
                password : hashPassword,
                role : parseData.data.role 
            }
        })
        res.json({
            message : "user is signup"
        })
    }catch{
        res.json({
            message : "Internal server error"
        })

    }

}

export const userSignin = async(req:Request,res:Response)=>{
    const parseData = SigninSchema.safeParse(req.body);
    if (!parseData.success){
        res.json({
            message : "parseData is wrong"
        })
        return
    }
    const user = await prisma.user.findUnique({
        where:{
            email : parseData.data.email
        }
    })
    if (!user){
        res.json({
            message : "user is not exist please signup"
        })
        return
    }
    const token = jwt.sign({
        userId :user.id,
        role : user.role
    },JWT_PASSWORD);
    
    res.json({
        user:{
            id : user.id,
            email : user.email,
            token
        }
    })
  
}