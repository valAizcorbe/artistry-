const bcrypt = require('bcryptjs')
module.exports = {
    register: async(req,res) => {
        const {email, password, username, profile_pic,  cover_pic, real_name, contact, bio} = req.body;
        const db = req.app.get('db')

        let foundUser = await db.checkEmail(email);
        foundUser = foundUser[0]
        if(foundUser){
            res.status(409).send("Email already in use :[")
        }
        else {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password,salt)

            let newUser = await db.register({email, password:hash, username, profile_pic, cover_pic, profile_pic,real_name,contact, bio});
            newUser = newUser[0];
            req.session.user = {...newUser};
            res.status(200).send(req.session.user)
        }
    },
    login: async(req,res) => {
        const{email, password} = req.body;
        const db = req.app.get('db')
        let foundUser = await db.checkEmail(email);
        foundUser = foundUser[0];
        if(!foundUser){
            res.status(401).send("Username does not exists")
        }
        const authenticated = bcrypt.compareSync(password, foundUser.password)
        if(authenticated){
            delete foundUser.password;
            req.session.user = foundUser;
            res.status(200).send(req.session.user)
        } else {
            res.status(401).send("incorrect password")
        }
    },
    logout: (req,res) => {
        req.session.destroy()
        res.sendStatus(200)
    },
    getUser: (req,res) => {
        if(req.session.user){
            res.status(200).send(req.session.user)
        }
    },

    editUser: async (req, res) => {
        let db = req.app.get('db');
        const {
            username,
            profile_pic,
            cover_pic,
            real_name,
            contact,
            bio
        } = req.body;
        db.editUser([
            username,
            profile_pic,
            cover_pic,
            real_name,
            contact,
            bio
        ])
        .then(response => {
            res.send(response).status(200);

        })
        .catch(err => {
            res.send(err).status(500);
        })
    },

    getUserById: async (req, res) => {
        console.log('hit')
        let db = req.app.get('db');
        const {id} = req.params
        let user = await db.getUserById(+id)
        console.log(user)
        res.status(200).send(user)
        
    }
}
