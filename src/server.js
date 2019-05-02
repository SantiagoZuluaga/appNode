const express = require('express');
const engine = require('ejs-mate');
const morgan = require('morgan');
const app = express();
const path = require('path');
const db = require('./database');
const flash = require('connect-flash');
const session = require('express-session')


//MIDDLEWARES
app.set('port', process.env.PORT || 3000);
app.engine('ejs', engine);
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');  
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname + '/views')));
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
app.use(flash())


//Funciones
const verificarRegistro = (Name, Lastname, Cellphone, Password, Repitpassword) => {

    var flag = 0;

    if(Name === "" || Lastname === ""){

        flag = 1;
    }
    if(Cellphone === "" || isNaN(Cellphone)){

        flag = 1;
    }
    if(Password === "" || Repitpassword === "" || Password !== Repitpassword){

        flag = 1;
    }

    return flag;
    
}

const verificarInicio = (Cellphone, Password) => {

    var flag = 0;

    if(Cellphone === "" || isNaN(Cellphone)){

        flag = 1;
    }
    if(Password === "" ){

        flag = 1;
    }

    return flag;
    
}

//ROUTES

//Ventana principal
app.get('/', (req, res) => {
    res.render('index', {isLogged: req.session.isLogged});    
})

//Registro de usuario
app.get('/signup', (req, res) => { 
    
    if(req.session.isLogged){

        res.redirect('/profile');
    }
    else{

        res.render('signup', {
            signupMessage: req.flash('signupMessage'),
            isLogged: req.session.isLogged});
    }
           
})

app.post('/signup/user', (req, res) => { 

    const { Name, Lastname, Cellphone, Password, Repitpassword } = req.body;

    if (verificarRegistro(Name, Lastname, Cellphone, Password, Repitpassword) === 0){

        db.insertarusuario(Name, Lastname, Cellphone, Password, req, res)
    }
    else {

        req.flash('signupMessage', 'Datos invalidos');
        res.redirect('/signup');  
    }

})

//Inicio de sesion
app.get('/signin', (req, res) => { 

    if(req.session.isLogged){

        res.redirect('/profile');
    }
    else {

        res.render('signin', {
            signinMessage: req.flash('signinMessage'),
            isLogged: req.session.isLogged});   
    }
})

app.post('/signin/user', (req, res) => { 
     
    const { Cellphone, Password} = req.body;

    if (verificarInicio(Cellphone, Password, req, res) === 0){
        
        db.validarusuario(Cellphone, Password, req, res)
    }
    else {

        req.flash('signinMessage', 'Datos invalidos')
        res.redirect('/signin');
    }
})


//Profile
app.get('/profile', (req, res) => {

    if(req.session.isLogged){

        res.render('profile', {
            isLogged: req.session.isLogged,
            Name: req.session.Name,
            Lastname: req.session.Lastname,
            Cellphone: req.session.Cellphone});
    }
    else {
        
        res.redirect('/');  
    }
    
    
})


//Log out
app.get('/logout', (req, res) => {

    req.session.Cellphone = null;
    req.session.isLogged = null;
    res.redirect('/');  
  
})

//STARTING SERVER
app.listen(app.get('port'), () => {
    console.log('SERVER ON PORT ' + app.get('port'));
})