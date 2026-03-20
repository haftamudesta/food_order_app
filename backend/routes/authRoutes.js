const express=require("express")
const authControllers=require("../controllers/authControllers")
const route=express.Router()
route.post("/sign_up",authControllers.signUp)
route.post("/log_in",authControllers.login)
route.post("/log_out",authControllers.logout)

module.exports=route