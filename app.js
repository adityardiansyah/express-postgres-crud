const express = require('express')
const bodyParser = require('body-parser')
const {Client} = require('pg')
const dust = require('dustjs-helpers')
const cons = require('consolidate')
const path = require('path')
const fileupload = require('express-fileupload')

const app = express()

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//connect database postgres
const connectionString = "postgres://postgres:admin@localhost/shop_express"

// Assign engine view
app.engine('dust', cons.dust)

// Set default ext .dust
app.set('view engine', 'dust')
app.set('views', __dirname+'/views')

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')))

// Enable files upload
app.use(fileupload({
    createParentPath: true
}))


app.get('/', function(req, res){
    const client = new Client({
        connectionString: connectionString,
    })
    client.connect()

    client.query('SELECT * FROM products', (err, result) => {
        res.render('index', { products: result.rows })
        client.end()
    })
})

app.listen('3000', function(){
    console.log("Server ready...")
})