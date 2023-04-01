/* Módulos */
const express = require("express")
const handlebars = require("express-handlebars")
const mongoose = require("mongoose")
const app = express()
const admin = require("./routes/adimin")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
const usuarios = require("./routes/usuario")

// Variáveis de ambiente
require('dotenv/config');

require("./models/Postagem")
const PostagemSchema = mongoose.model("postagens")

require("./models/Categoria")
const CategoriaSchema = mongoose.model("categorias")

/* Configurações */
const port = 8080

// Sessão //
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

// Middleware //
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next()
})

// BodyParser //
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Handlebars //
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}))
app.set("view engine", "handlebars")

// Mongoose //
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("Mongodb conectado!")
    })
    .catch(err => {
        console.log("Falha ao conectar mongodb: " + err)
    })

// Public //
app.use(express.static(path.join(__dirname, "public")))

/* Rotas */
app.get("/", (req, res, next) => {
    PostagemSchema.find().populate({
        path: "categoria",
        select: "nome"
    }).sort({data: "desc"})
        .then(postagens => {
            res.render("index", {postagens: postagens})
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao carregar as postagens")
            res.redirect("/404")
        })
})

app.get("/404", (req, res, next) => {
    res.send("Erro 404!")
})

app.get("/postagem/:slug", (req, res, next) => {
    PostagemSchema.findOne({slug: req.params.slug})
        .then(postagem => {
            if (postagem) {
                res.render("postagem/index", {postagem: postagem})
            } else {
                req.flash("error_msg", "Essa postagem não existe")
                res.redirect("/")
            }
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
})

app.get("/categorias", (req, res, next) => {
    CategoriaSchema.find()
        .then(categorias => {
            res.render("categorias/index", {categorias: categorias})
        })
        .catch(err => {
            req.flash("Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
})

app.get("/categorias/:slug", (req, res, next) => {
    CategoriaSchema.findOne({slug: req.params.slug})
        .then(categoria => {
            if (categoria) {

                PostagemSchema.find({categoria: categoria._id})
                    .then(postagens => {
                        res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                    })
                    .catch(err => {
                        req.flash("error_msg", "Houve um erro ao listar os posts")
                        res.redirect("/categorias")
                    })

            } else {
                req.flash("error_msg", "Essa categoria não foi encontrada")
                res.redirect("/categorias")
            }
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página dessa categoria")
            res.redirect("/categorias")
        })
})

app.use("/admin", admin)

app.use("/usuarios", usuarios)

/* Outros */
app.listen(port, () => {
    console.log("Servidor executando...")
})
