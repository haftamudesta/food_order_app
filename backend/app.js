//configure express and middleware
const express=require("express")
const app=express()
const cors=require("cors")
const bodyParser=require("body-parser")
//import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

module.exports=app