const express = require("express")
const router = express.Router()

const mongoose = require("mongoose")
require("../models/Categoria")
const CategoriaSchema = mongoose.model("categorias")

require("../models/Postagem")
const PostagemSchema = mongoose.model("postagens")

router.get("/", (req, res, next) => {
    res.render("admin/index")
})

router.get("/posts", (req, res, next) => {
    res.send("Página de posts")
})

router.get("/categorias", (req, res, next) => {
    CategoriaSchema.find().sort({
        date: "desc"
    })
        .then(categorias => {
            res.render("admin/categorias", { categorias: categorias })
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao listar as categorias. Tente novamente")
            res.redirect("/admin")
        })
})

router.get("/categorias/add", (req, res, next) => [
    res.render("admin/addcategorias")
])

router.post("/categorias/nova", (req, res, next) => {

    // Validação da categoria
    var erros = []

    const nome = req.body.nome
    const slug = req.body.slug

    if (!nome || typeof nome == undefined || nome == null) {
        erros.push({ texto: "Nome inválido" })
    }

    if (!slug || typeof slug == undefined || slug == null) {
        erros.push({ texto: "Slug inválido" })
    }

    if (nome.length < 2) {
        erros.push({ texto: "O nome da categoria é muito pequeno" })
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: nome,
            slug: slug
        }

        new CategoriaSchema(novaCategoria).save()
            .then(() => {
                req.flash("success_msg", "Categoria criada com sucesso!")
                res.redirect("/admin/categorias")
            })
            .catch(err => {
                req.flash("error_msg", "Houve um erro ao salvar a categoria. Tente novamente!")
                res.redirect("/admin")
            })
    }

})

router.get("/categorias/edit/:id", (req, res, next) => {
    CategoriaSchema.findOne({ _id: req.params.id })
        .then(categoria => {
            res.render("admin/editcategorias", { categoria: categoria })
        })
        .catch(err => {
            req.flash("error_msg", "Essa categoria não existe")
            res.redirect("/admin/categorias")
        })
})


router.post("/categorias/edit", (req, res, next) => {
    CategoriaSchema.findOne({ _id: req.body.id })
        .then(categoria => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save()
                .then(() => {
                    req.flash("success_msg", "Categoria editada com sucesso!")
                    res.redirect("/admin/categorias")
                })
                .catch(err => {
                    req.flash("error_msg", "Houve um erro ao salvar a edição da categoria")
                    res.redirect("/admin/categorias")
                })
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao editar a categoria")
            res.redirect("/admin/categorias")
        })
})

router.post("/categorias/deletar", (req, res, next) => {
    CategoriaSchema.remove({ _id: req.body.id })
        .then(() => {
            req.flash("success_msg", "Categoria removida com sucesso!")
            res.redirect("/admin/categorias")
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao deletar a categoria")
            res.redirect("/admin/categorias")
        })
})

router.get("/postagens", (req, res, next) => {
    PostagemSchema.find().populate({
        path: "categoria",
        select: "nome"
    })
        .then(postagens => {
            res.render("admin/postagens", { postagens: postagens })
        })
        .catch(err => {
            console.log(err)
            req.flash("error_msg", "Houve um erro ao obter as postagens")
            res.redirect("/admin")
        })

})

router.get("/postagens/add", (req, res, next) => {
    CategoriaSchema.find()
        .then(categorias => {
            res.render("admin/addpostagens", { categorias: categorias })
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao carregar as categorias disponíveis")
            res.redirect("/admin/postagens")
        })
})

router.post("/postagens/nova", (req, res, next) => {
    // Validação da categoria
    var erros = []

    const titulo = req.body.titulo
    const slug = req.body.slug
    const descricao = req.body.descricao
    const conteudo = req.body.conteudo
    const categoria = req.body.categoria

    // Título
    if (!titulo || typeof titulo == undefined || titulo == null) {
        erros.push({ texto: "Título inválido" })
    }

    else if (titulo.length < 2) {
        erros.push({ texto: "O título da categoria é muito pequeno" })
    }

    // Slug
    else if (!slug || typeof slug == undefined || slug == null) {
        erros.push({ texto: "Slug inválido" })
    }

    // Descrição
    else if (!descricao || typeof descricao == undefined || descricao == null) {
        erros.push({ texto: "Descrição inválida" })
    }

    else if (descricao.length < 5) {
        erros.push({ texto: "A descrição é muito curta" })
    }

    // Conteúdo
    else if (!conteudo || typeof conteudo == undefined || conteudo == null) {
        erros.push({ texto: "Conteúdo inválida" })
    }

    else if (conteudo.length < 10) {
        erros.push({ texto: "A Conteúdo é muito curto" })
    }

    // Categoria
    else if (!categoria || typeof categoria == undefined || categoria == null || categoria == "0") {
        erros.push({ texto: "Categoria inválida" })
    }

    if (erros.length > 0) {
        CategoriaSchema.find()
            .then(categorias => {
                res.render("admin/addpostagens", { erros: erros, categorias: categorias })
            })
            .catch(err => {
                req.flash("error_msg", "Houve um erro ao carregar as categorias disponíveis")
                res.redirect("/admin/postagens")
            })
    } else {
        const novaPostagem = {
            titulo: titulo,
            slug: slug,
            descricao: descricao,
            conteudo: conteudo,
            categoria: categoria
        }

        new PostagemSchema(novaPostagem).save()
            .then(() => {
                req.flash("success_msg", "Postagem criada com sucesso!")
                res.redirect("/admin/postagens")
            })
            .catch(err => {
                req.flash("error_msg", "Houve um erro ao salvar a postagem")
                res.redirect("/admin/postagens")
            })
    }


})

router.get("/postagens/edit/:id", (req, res, next) => {
    PostagemSchema.findOne({ _id: req.params.id })
        .then(postagem => {
            CategoriaSchema.find()
                .then(categorias => {
                    categorias = categorias.map(categoria => {
                        return {
                            "_id": categoria._id,
                            "nome": categoria.nome,
                            "selected": postagem.categoria.equals(categoria._id)
                        }
                    })

                    res.render("admin/editpostagens", { postagem: postagem, categorias: categorias })
                })
                .catch(err => {
                    req.flash("error_msg", "Houve um erro ao obter as categorias")
                    res.redirect("/admin/postagens")
                })
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao buscar a postagem para edição")
            res.redirect("/admin/postagens")
        })
})

router.post("/postagens/edit", (req, res, next) => {
    PostagemSchema.findOne({ _id: req.body.id })
        .then(postagem => {
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save()
                .then(() => {
                    req.flash("success_msg", "Postagem editada com sucesso!")
                    res.redirect("/admin/postagens")
                })
                .catch(err => {
                    req.flash("error_msg", "Houve um erro ao salvar a edição da postagem")
                    res.redirect("/admin/postagens")
                })
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao editar a postagem")
            res.redirect("/admin/postagens")
        })
})

router.post("/postagens/deletar", (req, res, next) => {
    PostagemSchema.remove({_id: req.body.id})
        .then(() => {
            req.flash("success_msg", "Postagem removida com sucesso!")
            res.redirect("/admin/postagens")
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro deletar a postagem")
            res.redirect("/admin/postagens")
        })
})

module.exports = router
