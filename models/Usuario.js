const moogoose = require("mongoose")
const Schema = moogoose.Schema

const UsuarioSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required:  true
    },
    admin: {
        type: Number,
        default: 0
    }
})

moogoose.model("usuarios", UsuarioSchema)
