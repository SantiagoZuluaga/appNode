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
    if(Cellphone === "" || isNaN(Cellphone) || toString(Cellphone).length > 10){

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

const verificartask = (Nametasks, Description) => {

    var flag = 0;

    if(Nametasks === ""){
        
        flag = 1;
    }
    if(Description === ""){

        flag = 1;
    }

    return flag;
}


const verificarActualizar = (Name, Lastname, Cellphone) => {

    var flag = 0;

    if(Name === ""){

        flag = 1;
    }
    if(Lastname === ""){

        flag = 1;
    }
    if(Cellphone === ""){

        flag = 1;
    }

    return flag;
}

const verificarPassword = (OldPassword, NewPassword, RepitPassword) => {

    var flag = 0;

    if(OldPassword === ""){

        flag = 1;
    }
    if(NewPassword === "" || RepitPassword === "" || NewPassword !== RepitPassword){

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
            editinfomessage: req.flash('editinfomessage'),
            editpassmessage: req.flash('editpassmessage'),
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


//Tasks 
app.get('/tasks', (req, res) => {

    var Cellphone = req.session.Cellphone;

    if(req.session.isLogged){

       db.obtenerTareas(Cellphone, req, res);
    }
    else {
        
        res.redirect('/');  
    }
})

app.get('/new-tasks', (req, res) => {

    if(req.session.isLogged){

        res.render('new-tasks', {
            isLogged: req.session.isLogged,
            newtasksmessage: req.flash('newtasksmessage')
        });
    }
    else {
        
        res.redirect('/');  
    }
})

app.post('/new-tasks', (req, res) => {

    var Cellphone = req.session.Cellphone;
    var Fecha = new Date();
    const { Nametasks, Description } = req.body;

    if(verificartask(Nametasks, Description) === 0){

        Fecha = Fecha.getDate() + "/"+ (Fecha.getMonth() + 1) + "/" + Fecha.getFullYear();
        db.agregarTarea(Nametasks, Description, Fecha, Cellphone, req, res);
    }
    else {

        req.flash('newtasksmessage', 'Datos invalidos')
        res.redirect('/new-tasks');
    }

})

app.post('/edit-tasks/task/:id' , (req, res) => {

    var id = req.params.id;
    var Cellphone = req.session.Cellphone;
    var Fecha = new Date();
    const { Nametasks, Description } = req.body;

    if(verificartask(Nametasks, Description) === 0){

        Fecha = Fecha.getDate() + "/"+ (Fecha.getMonth() + 1) + "/" + Fecha.getFullYear();
        db.actualizarTarea(Nametasks, Description, Fecha, id, Cellphone, req, res);
    }
    else {

        req.flash('edittasksmessage', 'Datos invalidos')
        res.render('edit-tasks', {
            isLogged: req.session.isLogged,
            edittasksmessage: req.flash('edittasksmessage'),
            Nametasks: Nametasks,
            Description: Description});
    }

})

app.post('/edit-tasks/:id', (req, res) => {

    var id = req.params.id;
    var Cellphone = req.session.Cellphone;

    if(req.session.isLogged){

        db.datosTarea(Cellphone, id, req, res);
    }
    else {
        
        res.redirect('/');  
    }
})

app.post('/delete-tasks/:id', (req, res) => {

    var id = req.params.id;
    var Cellphone = req.session.Cellphone;

    if(req.session.isLogged){

        db.eliminarTarea(Cellphone, id, req, res);
    }
    else {
        
        res.redirect('/');  
    }
})

app.get('/*', (req, res) => {

    res.send("Esta pagina no existe")
})

app.post('/profile/edit', (req, res) => {

    const { Name, Lastname, Cellphone } = req.body;

    if(verificarActualizar(Name, Lastname, Cellphone) === 0){

        db.actualizarInformacion(Name, Lastname, Cellphone, req, res);
    }
    else {

        req.flash('editinfomessage', 'Datos invalidos');
        res.redirect('/profile');
    }

})

app.post('/password/edit', (req, res) => {

    const { OldPassword, NewPassword, RepitPassword } = req.body;
    var Cellphone = req.session.Cellphone;

    if(verificarPassword(OldPassword, NewPassword, RepitPassword) === 0){

        db.actualizarPassword(OldPassword, NewPassword, Cellphone, req, res);

    }
    else {

        req.flash('editpassmessage', 'Datos invalidos');
        res.redirect('/profile');
    }

    
})

//STARTING SERVER
app.listen(app.get('port'), () => {
    console.log('SERVER ON PORT ' + app.get('port'));
})

