const {Pool}= require('pg')
const bcrypt = require('bcrypt-nodejs');
//DB CONNECT STRING
const connect = 'postgresql://postgres:santiago1998@127.0.0.1:5432/pruebas';

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

            pool.query('INSERT INTO usuarios VALUES($1, $2, $3, $4)', [Cellphone, Name, Lastname, Encriptado] , (error, results) => {
    
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


const agregarTarea = (Nametasks, Description, Fecha, Cellphone, req, res) => {

    pool.query('INSERT INTO tareas VALUES(DEFAULT, $1, $2, $3, $4, DEFAULT)', [Fecha, Nametasks, Description, Cellphone], (error, results) => {
        if(error){
            console.log(error)
        }

        res.redirect('/tasks');
    })
}

const obtenerTareas = (Cellphone, req, res) => {

    pool.query('SELECT * FROM tareas WHERE celular = $1 AND estado = TRUE', [Cellphone], (error, results) => {
        if(error){
            console.log(error)
        }

        if(results.rows.length === 0){

            res.render('tasks', {
                isLogged: req.session.isLogged,
                Tasks: []
            });
        }
        else {

            res.render('tasks', {
                isLogged: req.session.isLogged,
                Tasks: results.rows
            });
        }

        
    })
}

const eliminarTarea = (Cellphone, id, req, res) => {

    pool.query('UPDATE tareas SET estado = false WHERE id = $1 AND celular = $2', [id, Cellphone], (error, results) => {
        if(error){
            console.log(error)
        }

        res.redirect('/tasks');

    })

}

const datosTarea = (Cellphone, id, req, res) => {

    pool.query('SELECT * FROM tareas WHERE id = $1 AND celular = $2', [id, Cellphone], (error, results) => {
        if(error){
            console.log(error)
        }

        res.render('edit-tasks', {
            idtask: id,
            isLogged: req.session.isLogged,
            edittasksmessage: req.flash('edittasksmessage'),
            Nametasks: results.rows[0].titulo,
            Description: results.rows[0].descripcion});

    })
}

const actualizarTarea = (Nametasks, Description, Fecha, id, Cellphone, req, res) => {

    pool.query('UPDATE tareas SET titulo = $1, descripcion = $2,  fecha = $3 WHERE id = $4 AND celular = $5', [Nametasks, Description, Fecha, id, Cellphone], (error, results) => {
        if(error){
            console.log(error)
        }

        res.redirect('/tasks');
    })

}


const actualizarInformacion = (Name, Lastname, Cellphone, req, res) => {
    
    pool.query('UPDATE usuarios SET nombre = $1, apellido = $2, celular = $3 WHERE celular = $3', [Name, Lastname, Cellphone], (error, results) => {
        if(error){
            console.log(error)
        }
        
        req.session.Name = Name;
        req.session.Lastname = Lastname;
        req.session.Cellphone = Cellphone;

        req.flash('editinfomessage', 'Informacion actualizada');
        res.redirect('/profile');
    })

}

const actualizarPassword = (OldPassword, NewPassword, Cellphone, req, res) => {

    pool.query('SELECT * FROM usuarios WHERE celular = $1', [Cellphone], (error, results) => {
        if(error){
            console.log(error)
        }

        if(results.rows.length === 0){

        }
        else {

            if(bcrypt.compareSync(OldPassword, results.rows[0].password)){

                pool.query('UPDATE usuarios SET password = $1 WHERE celular = $2', [NewPassword, Cellphone], (error, results) => {
                    if(error){
                        console.log(error)
                    }

                    req.flash('editpassmessage', 'Contraseña actualizada');
                    res.redirect('/profile');
                })
                
            }
            else {

                req.flash('editpassmessage', 'Contraseña incorrecta');
                res.redirect('/profile');
            }

        }

    })
}

module.exports = {

    insertarusuario,
    validarusuario, 
    agregarTarea,
    obtenerTareas,
    eliminarTarea,
    datosTarea,
    actualizarTarea,
    actualizarInformacion,
    actualizarPassword
}