const express = require('express')
const bodyParser = require('body-parser')
const {Client} = require('pg')
const dust = require('dustjs-helpers')
const cons = require('consolidate')
const path = require('path')
const multer = require('multer')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'))

//connect database postgres
const connectionString = "postgres://postgres:admin@localhost/shop_express"

// Assign engine view
app.engine('dust', cons.dust)

// Set default ext .dust
app.set('view engine', 'dust')
app.set('views', __dirname+'/views')

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res){
    const client = new Client({
        connectionString: connectionString,
    })
    client.connect()

    client.query('SELECT * FROM products WHERE is_active=1', (err, result) => {
        res.render('index', { products: result.rows })
        client.end()
    })
})

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, '/image/'+Date.now()+'-'+file.originalname)
    }
})
var upload = multer({ storage: storage })

app.post('/add', upload.single('images'), (req, res, next) =>{
    const client = new Client({
        connectionString: connectionString,
    })
    client.connect()

    try{
        const file = req.file
        if (!file) {
            const error = new Error('Please upload a file')
            error.httpStatusCode = 400
            return next(error)
        }
        
        // Count id
        let count_id = 'SELECT COUNT(*) FROM products'
        var count = 1

        let q_count = client
            .query(count_id)
            .then(res => res.rows[0].count)
            .catch(e => console.error(e.stack))
            
        q_count.then(function(ress){
            let id = parseInt(ress) + count
            
            //send response
            const query = 'INSERT INTO products(id, name, stock, price, image, description, is_active) values($1, $2, $3, $4, $5, $6, $7)'
            const values = [id, req.body.name, req.body.stock, req.body.price, req.file.filename, req.body.description, 1]
            client.query(query, values, (err, result) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    res.redirect('/')
                }
            })
        });
    }catch(err){

    }
})

app.delete('/delete/:id', function(req, res){
    const client = new Client({
        connectionString: connectionString,
    })
    client.connect()

    const query = 'DELETE FROM products where id=$1'
    const values = [req.params.id]
    client.query(query, values, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            res.send(200)
        }
    })
})

app.listen('3000', function(){
    console.log("Server ready...")
})