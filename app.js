const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const admin = require("firebase-admin");
const serviceAccount = require('')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", async function(req, res){
        const dataSnapshot = await db.collection('agendamentos').get();
        const data = [];
        dataSnapshot.forEach((doc)=>
        {data.push({
            id:doc.id,
            nome:doc.get('nome'),
            telefone:doc.get('telefone'),
            origem:doc.get('origem'),
            data_contato:doc.get('data_contato'),
            observacao: doc.get('observacao'),

        });
    });
    res.render("consulta", {data});
    
})

app.get("/editar/:id", async function(req,res){
    try{
        const doc = db.collection('agendamentos').doc(req.params.id);
        const docc = await doc.get();
        if(!docc.exists){
            console.log("erro")
            res.status(404).send("n achou doc")
        }
       
        else{
            res.render("editar", { id:req.params.id, pessoas: docc.data() })
        }
    } catch(error){
        console.error(error)
        res.status(500).send("erro ao buscar doc")
    }
});
 
app.post('/atualizar/:id', async function(req, res){
 try{
   
    const edit = db.collection('agendamentos').doc(req.params.id);
    await edit.update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    });
    console.log('documento atualizado');
    res.redirect('/consulta')
 
 } catch(error){
    console.error("erro", error);
    res.status(500).send("erro ao buscar");
 }
}
);

app.get("/excluir/:id", async function(req, res){
    try {
        await db.collection('agendamentos').doc(req.params.id).delete();
        console.log('Documento excluido com sucesso!');
        res.redirect('/consulta');
        
    } catch (error) {
        console.error("Erro ao deletar documento: ", error);
        res.status(500).send("Erro ao excluir documento");
        
    }
})

app.post("/cadastrar", async function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

  

app.listen(8081, function(){
    console.log("Servidor ativo!")
})