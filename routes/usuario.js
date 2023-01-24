const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const UsuarioSchema = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")

router.get("/registrar", (req, res, next) => {
    res.render("usuarios/registrar")
})

router.post("/registrar", (req, res, next) => {
    const nome = req.body.nome
    const email = req.body.email
    const senha = req.body.senha

    const erros = []

    if (!nome || nome == undefined || nome == null) erros.push({ texto: "Nome inválido" })
    else if (nome.length < 2) erros.push({ texto: "O nome do usuário é muito pequeno" })
    else if (!email || email == undefined || email == null) erros.push({ texto: "E-mail inválido" })
    else if (!senha || senha == undefined || senha == null) erros.push({ texto: "Senha inválida" })
    else if (senha.length < 4) erros.push({ texto: "A senha é muito pequena" })

    // console.log("AAA")
    if (erros.length > 0)
        res.render("usuarios/registrar", { erros: erros })
    else {
        UsuarioSchema.findOne({ email: email })
            .then(usuario => {
                if (usuario) {
                    req.flash("error_msg", "E-mail já cadastrado")
                    res.redirect("/usuarios/registrar")
                } else {
                    const novoUsuario = new UsuarioSchema({
                        nome: nome,
                        email: email,
                        senha: senha
                    })

                    bcrypt.genSalt(7, (erro, salt) => {
                        bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                            if (erro) {
                                req.flash("error_msg", "Houve um erro ao salvar o usuário")
                                res.redirect("/usuarios/registrar")
                            } else {
                                novoUsuario.senha = hash

                                novoUsuario.save()
                                    .then(() => {
                                        req.flash("success_msg", "Usuário criado com sucesso!")
                                        res.redirect("/usuarios/registrar")
                                    })
                                    .catch(err => {
                                        req.flash("error_msg", "Houve um erro ao salvar o usuário")
                                        res.redirect("/usuarios/registrar")
                                    })
                                    
                                }
                        })
                    })
                }
            })
            .catch(err => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/usuarios/registrar")
            })
    }

})

router.get("/logar", (req, res, next) => {
    res.render("usuarios/logar")
})

router.post("/logar", (req, res, next) => {
    
})

module.exports = router;
