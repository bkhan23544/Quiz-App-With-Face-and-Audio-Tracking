const express = require('express')
const cors = require('cors')
const sgMail = require('@sendgrid/mail')
var bodyParser = require('body-parser')
const settings = require('./settings.json')
var otpGenerator = require('otp-generator')
const PORT = process.env.PORT || 5000
 

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

sgMail.setApiKey("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")


app.use(cors())


app.post('/',(req,res)=>{
    res.send("Hello")
})

app.post('/getquiz',(req,res)=>{
    var quiz = require('./quiz.json')
    var quizarray = quiz.questions
    const shuffled = quizarray.sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, settings.noOfQuestions);
    quiz.questions=selected
    res.send(quiz)
})

app.post('/getquizdetails',(req,res)=>{
    var quiz = require('./quiz.json')
    res.send(quiz.module)
})

app.post('/sendmail',(req,res)=>{
    var otp = otpGenerator.generate(4, { upperCase: false, specialChars: false,alphabets:false });
    var email = req.body.email
    var tOtp = "8787"
    const msg={
        to:email,
        from:"bcoder23544@gmail.com",
        subject:"OTP for Quiz App",
        text:`Here's your OTP ${otp}`
    }
  
    console.log(msg,"msg")
    try{
    sgMail.send(msg)
    res.send({otp,email,tOtp})
}
catch(err){
    console.log(err)
    res.send(err)
}

// console.log(req.body,"req")
// res.send("sucess")

})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))