require('dotenv').config()     /// enable dot.env to protect secret key.
const express=require('express');
const ejs=require('ejs');
const bodyParser=require('body-parser');
const { default: mongoose } = require('mongoose');
const mongooseEncryption=require('mongoose-encryption');  /// enable mongoose encryption

const app=express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}))   /// we told our app to use body-parser
app.use(express.static("public"))  // tell javascript to serve this static folder.


////////////////////////////////////// Level 1 Security /////////////////////////////////////////

// This is creating an account for the user ans storing the email and password in our database so that when they come back at a later,we can check their email against password and see if we pass them let or not.

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true,useUnifiedTopology: true,
family: 4});

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});


// create a secret for encryption 
// This secret creation part is for Level-2 Encryption
//const secret="Thisisourlittlesecret";
userSchema.plugin(mongooseEncryption,{secret:process.env.SECRET , encryptedFields: ['password'] });  // if needed to be multiple field then just use comma inside the third bracket.





////////////////////////////////////////For dot.env /////////////////////////////////////////////////////
// When we pull our code in github repository then it is not secure the secret key.Because anyone can esasily get the secret key and then decrypted it.The developers can solve this problem using environment variables and environment variable is simple file that we going to keep secret to certain sensitive variables such as keys and API keys.And in here we can do this using very popular dot.env.And to do that we need require('dotenv').config()..Create a .env file in the root directory of the project .And add environment specific variables on new lines in the form of NAME=VALUE

const User=new mongoose.model("User",userSchema);


////////////////////////////////////// Register Route ////////////////////////////////

app.post('/register',function(req,res)
{
    const newUser=new User({
        email:req.body.username,
        password:req.body.password
    });
    newUser.save().then(function(err)
    {
        if(!err)
        {
            res.render('secrets');
        }
        else
        {
            console.log(err);
        }
    });
});



/////////////////////////////// Check User Data from DataBase ////////////////////////////////////////

// In case of security level-2 mongoose encryption is autometically decrypted password when we use findOne 

app.post('/login',function(req,res)
{
    const username=req.body.username;
    const password=req.body.password;

    User.findOne({email:username}).then(function(docs,err)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(docs.password===password)
            {
                res.render('secrets');
            }
        }
    })
})

// Level-1 encryption is when an user put his email and password and regiser then we save the user information in Database.And when user want to login and put his necessary information in the login portal then the system checked his email is available in database or not if available then also check the password and finally permit the user in other page or main portal. UP to this Lavel this is Level-1 Encryption.




app.get('/',function(req,res)
{
    res.render('home');
})

app.get('/login',function(req,res)
{
    res.render('login');
})

app.get('/register',function(req,res)
{
    res.render('register');
});

app.listen(3000,function(req,res)
{
    console.log('The server has started on port 3000.');
})