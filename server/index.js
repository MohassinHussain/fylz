const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const port = 5000;
const app = express();
const model = require('./Schemas/UserSchema')
const fileModel = require('./Schemas/FileSchema')
app.get('/', (req, res) => {
    res.send("HELLO")
})
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }));
mongoose.connect("mongodb+srv://userme:OhguQudhETIKckYQ@cluster0.hwpdi97.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(() => {
    console.log("Connected");
    app.listen(port, () => {
        console.log("Listening to port");
    });

}).catch(e => console.log(e))

app.post('/user-query', async (req, res) => {
    try {
        const { email, query } = req.body;
        const user = new model({ email, query })
        await user.save();
        // console.log(user);

        res.status(201).json(user);

    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server" })
    }
})


app.post('/file-uploaded', async (req, res) => {
    try {
        const { b64Strings, test } = req.body;
        // console.log('Request Body:', req.body);
        console.log(test);
        if (!Array.isArray(b64Strings)) {
            return res.status(400).send('Invalid input');
        }
        else{
        console.log('Base64 Strings:', b64Strings);
        // console.log('Encoded Code:', test);
        const file = new fileModel({ b64Strings, test })
        await file.save();

        // res.send("DATA RES")    
        res.status(201).json(file);
    }
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server" })
    }
})

let array = []
let invalidCode = null
app.post('/receiver-code', async (req, res)=>{
    try {
    const {sharedCode} = req.body;  
    const ress = fileModel.findOne({test: sharedCode})
    ress.then(file => {
        if (file) {
            // console.log('Document  data:', file.b64Strings);
            array = file.b64Strings;
            console.log(array);
          } else {
        
            // console.log('No matching file found');
            invalidCode = "No Match"
            console.log(invalidCode);
          }
    })
    res.json({ message: 'Code received successfully!' });
    // console.log(ress);
} catch (e) {``
    console.log(e);
}
})


app.get('/file-receive', (req, res)=>{
    res.json(array)  
    // res.json(invalidCode)

    array = []
})

