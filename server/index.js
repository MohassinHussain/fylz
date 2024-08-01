require('dotenv').config()
const express = require("express")
const mongoose = require('mongoose')
const port = process.env.PORT || '5000'
const cors = require('cors');
const app = express();
const multer  = require('multer')
const path = require('path')
const fs = require('fs')

const fileModel = require('./Schemas/FileSchema');
const userModel = require('./Schemas/UserSchema');

app.use(cors())
app.use('/my-files', express.static("my-files"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res)=>{
    res.send("HELLO")
})


mongoose.connect("mongodb+srv://userme:OhguQudhETIKckYQ@cluster0.hwpdi97.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(() => {
    console.log("Connected");
    app.listen(port, () => {
        console.log("Listening to port");
    });

}).catch(e => console.log(e))



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './my-files')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now()
        cb(null, uniqueSuffix + "-" + file.originalname)    }
  })
  
  const upload = multer({ storage: storage })

app.post('/file-upload', upload.single("file"), async (req, res)=>{
    const code = req.body.code;
    checker = code
    const fileName = req.file.filename;
    console.log(code, fileName);
    // res.send("GOT FILE")
    try {
        await fileModel.create({code, fileName});
        res.send("FILE UPLOADED TO DB")
        
        const time = new Date();
        const uploadTime= time.getMinutes()
        console.log("Uploaded at: ",time.getHours, ":", time.getMinutes);

        setTimeout(async() => {
            const filePath = path.join(__dirname, "my-files", fileName)
            fs.unlink(filePath, (err)=>{
                if(err){
                console.log("Error occured at file deleting from (multer) disk");
                res.status(500).send('Failed to delete file');
            }
            else {
                console.log(`File deleted CODE: ${code} successfully from disk at ${time.getHours}:${time.getMinutes()}`);
            }
            });

            //deleting from db
            await fileModel.deleteMany({code})
            console.log(`Deleted CODE: ${code} from db Also`);

        }, 240000 ); 

    } catch (error) {
        console.log("ERROR IN SENDING TO DB");
    }
})

let resCode = null

app.post('/file-get', async(req, res)=> {
    const {receiverCode} = req.body;
    resCode = receiverCode
    console.log(receiverCode);
    try {
        const document = await fileModel.findOne({ code: receiverCode });
        if (document) {
            console.log(document); 
            res.send({status: "ok", data: document})
        }
        else {
            console.log("no doc");
            res.send({ status: 404, data: "NO DOC FOUND" })
        }
    } catch (error) {
        console.log(error);
    }
    
})

app.post('/footer', async (req, res)=>{
    // const { email, query } = req.body;
    //   console.log('Email:', email);
//   console.log('Query:', query);

    const { email, query } = req.body;

    try {
        await userModel.create({email, query})
        res.send({status: "OK", data: "Uploaded footer to db"})
    } catch (error) {
        console.log("Error in sending data to mongo from footer", error);
        res.send("Cant upload to db: from footer")
    }
})