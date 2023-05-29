require('dotenv').config()    
const express=require('express');
const ejs=require('ejs');
const bodyParser=require('body-parser');
const { default: mongoose } = require('mongoose');
const session=require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');

const app=express();

//////////////////////////////Using Passport to add cookies and Sessions ////////////////////////////


app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}))   
app.use(express.static("public"))  


/// //////////////Setup Express Session/////////////////////////

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
//   cookie: { secure: true }
}))

////// Initialize and Start Using Passport and Session//////////

app.use(passport.initialize())
app.use(passport.session())   /// initialize passport.session

// so we first tell our app to use session package and we set it up with some initial configuration.And we next tell our app to use passport and initialize passport package and also session package.



mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true,useUnifiedTopology: true,
family: 4});

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

// Use mongoose schema to use passport local mongoose.We use hash and salt our password and to save our users into our mongoDB Database. 
userSchema.plugin(passportLocalMongoose); 

const User=new mongoose.model("User",userSchema);


///// Passport Local Configuration  /////////////////

// Here at first we create a strategy to authenticates users using their username and password and also to serialize and deserilise our user.And the serialise and deserialise are necessary when we only use session.

// When we use serialise stuffs the message namely our users identifications into the cookie and then we deserialise it basically allows passpport to be able to cramble the cookie and discover the message inside which is who this user is and all of their identification so that we can authenticate them on our server.

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


////////////////////////////////////// Register Route ////////////////////////////////

app.get('/secrets',function(req,res)
{
    if(req.isAuthenticated())
    {
        res.render('secrets');
    }
    else
    {
        res.redirect('login');
    }
})


app.post('/register',function(req,res)
{

    // user.register comes from passport local mongoose package.And it is only because of the package that we can avoid creating our new user,saving our user and interacting with mongoose directly.Instead we going to be using the passport-local-mongoose package as our middleman to handle all of that for us.
    User.register({username:req.body.username},req.body.password,function(err,user)
    {
        if(err)
        {
            console.log(err);
            res.redirect('/register');
        }
        else{

            // if  there is no error then we authenticate our user by using passport and the type of authendicate we use is local 
            passport.authenticate("local")(req,res,function(){

                // this callback is only triggered if authentication is successful. And we manage to successfully setup a cookie that saved their current login session.So you have to check to see if they are logged in or not logged.
                res.redirect('/secrets');
            })
        }
    })

});

app.get('/logout',function(req,res)
{
    req.logout(function(){});
    res.redirect('/');
});


app.post('/login',function(req,res)
{
    const user=new User({
        username: req.body.username,
        password: req.body.password
    });
    // this method is also comes from passport.This new user is comes from login credential
    req.login(user,function(err)
    {
        if(err)
        {
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect('/secrets');
            })
        }
    })
    
})


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