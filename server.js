const express=require('express');

const bodyParser=require('body-parser');

const bcrypt=require('bcrypt-nodejs');
const fileUpload = require('express-fileupload');
const cors=require('cors');
const fs=require('fs');
const knex=require('knex');
const multer=require('multer');
const upload=multer({dest: 'uploads/'})

const db=knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'ganesha21',
    database : 'dashboard'
  }
});

const app=express();
app.use(fileUpload());
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('./uploads'));
app.post('/register',(req,res)=>{
	const {name,id,password,designation}=req.body;
	const hash=bcrypt.hashSync(password);
	db('operators')
	.returning('*')
	.where('op_id','=',id)
	.update({
		op_name:name,
		hash:hash,
		designation:designation
	})
	.then(operator=>{
		if(operator.length){
		    res.json(operator[0])
		}
		else{
			res.status(400).json('unable to register')
		}
	})
	.catch(err=>res.status(400).json('unable to register'))
})

app.post('/signin',(req,res)=>{
	db.select('op_id','op_name','hash').from('operators')
	.where('op_id','=',req.body.id)
	.then(data=>{
		const isValid=bcrypt.compareSync(req.body.password,data[0].hash);
		if(isValid){
			return db.select('*').from('operators')
			.where('op_id','=',req.body.id)
			.then(user=>{
				res.json(user[0])
			})
			.catch(err=>res.status(400).json('unable to get user'))
		}else{
			res.status(400).json('wrong credentials')
		}
	})
	.catch(err=>res.status(400).json('wrong credentials'))
})

/*	const id=req.body.id;
	//if(req.file.mimetype==='image/jpeg' || req.file.mimetype==='image/jpg' || req.file.mimetype==='image/png'){
    var tmp_path = req.file.path;
	var target_path = 'uploads/' + req.file.originalname;
	var src = fs.createReadStream(tmp_path);
  	var dest = fs.createWriteStream(target_path);
  	src.pipe(dest);
  	src.on('end', function() { db('operators')
  		.returning('*')
  		.where('op_id','=',id)
  		.update({
  			image_path:'http://localhost:3000/'+req.file.originalname
  		}).then(
  		res.json('http://localhost:3000/'+req.file.originalname)) });
  	src.on('error', function(err) { res.json('error'); });
  	console.log(req.file);
  //}
});
*/
app.post('/upload', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  let path='http://localhost:3000/uploads'
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(path, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});
app.listen(3000,()=>{
	console.log('app is running on port 3000');
});