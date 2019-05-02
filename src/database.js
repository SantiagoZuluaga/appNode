const {Pool}= require('pg')
const bcrypt = require('bcrypt-nodejs');
//DB CONNECT STRING
const connect = 'postgresql://santiago:santiago1998@localhost:5432/pruebas';

const pool = new Pool({
    connectionString: connect
})

const insertarusuario = (Name, Lastname, Cellphone, Password, req, res) => {

    var Encriptado = bcrypt.hashSync(Password);

    pool.query('SELECT * FROM usuarios WHERE celular = $1', [Cellphone], (error, resultado) => {


        if(error){
            console.log(error)
        }

        if (resultado.rows.length === 0){

            pool.query('INSERT INTO usuarios VALUES($1, $2, $3, $4)', [Name, Lastname, Cellphone, Encriptado] , (error, results) => {
    
                if(error){
                    console.log(error)
                }
                
                req.session.Name = Name;
                req.session.Lastname = Lastname;
                req.session.Cellphone = Cellphone;
                req.session.isLogged = true;
                res.redirect('/profile');
    
            })
        }
        else {

            req.flash('signupMessage', 'Ya existe un usuario con este celular');
            res.redirect('/signup');  
        }
        
    })

}

const validarusuario = (Cellphone, Password, req, res) => {

    pool.query('SELECT * FROM usuarios WHERE celular = $1', [Cellphone], (error, results) => {

        if(error){
            console.log(error)
        }

        if(results.rows.length === 0){

            req.flash('signinMessage', 'Usuario o contraseña incorrecta')
            res.redirect('/signin');
        }
        else {
        
            if (bcrypt.compareSync(Password, results.rows[0].password)) {
                
                req.session.Name = results.rows[0].nombre;
                req.session.Lastname = results.rows[0].apellido;
                req.session.Cellphone = Cellphone;
                req.session.isLogged = true;
                res.redirect('/profile');
            }
            else {

                req.flash('signinMessage', 'Usuario o contraseña incorrecta')
                res.redirect('/signin');
            }
        }

    })

}



module.exports = {

    insertarusuario,
    validarusuario
}