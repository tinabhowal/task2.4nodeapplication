const express = require('express');
const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const app = express();

app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/',
  // debug: true
}));
const port = 3000;

process.env.AWS_REGION = 'eu-central-1'; 

const s3Client = new S3Client({
  region: 'eu-central-1',
  endpoint: 'http://localhost:4566',
  forcePathStyle: true,
});


const bucketName = 'my-cool-local-bucketcf';

// const UPLOAD_TEMP_PATH = './uploads';

app.get('/', (req, res) => {
  res.send('Welcome');
});

app.get('/list-objects', (req, res) => {
  const listObjectsParams = {
    Bucket: bucketName,
  };

  s3Client
    .send(new ListObjectsV2Command(listObjectsParams))
    .then((data) => {
      console.log('data', data);
      res.json({ objects: data.Contents });
    })
    .catch((error) => {
      console.error('Error listing objects:', error);
      res.status(500).json({ error: 'Error listing objects' });
    });
});

app.post('/upload', (req, res) => {
  console.log('Received an image upload request.');
  console.log('File:', req.files.file);
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let file;
  let uploadPath;

  //The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  file = req.files.file;
  const fileName = req.files.file.name;
  uploadPath = req.files.file.tempFilePath;

  

  // Use the mv() method to place the file somewhere on your server
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error uploading file' });
    }

    // Prepare S3 upload parameters
    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: fs.createReadStream(uploadPath), // Read the file from the local path
    };

    s3Client
      .send(new PutObjectCommand(uploadParams))
      .then(() => {
        // Clean up the temporary file after successful upload
        fs.unlinkSync(uploadPath);
        res.json({ message: 'File uploaded to S3' });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Error uploading file to S3' });
      });
  });
});




app.get('/list-objects/:filename', (req, res) => {
  const filename = req.params.filename;

  const getObjectParams = {
    Bucket: bucketName,
    Key: filename,
  };

  s3Client.send(new GetObjectCommand(getObjectParams))
    .then((getObjectResponse) => {
      // Send the file data in the response.
      res.setHeader('Content-Type', getObjectResponse.ContentType);
      getObjectResponse.Body.pipe(res);
    })
    .catch((err) => {
      console.error('Error', err);
      res.status(500).send('Error downloading file from S3 bucket.');
    });

 
});


app.listen(port, () => {
  console.log(`Web application is running on port ${port}`);
});






//integrating user authentication
// const express = require('express');
// const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
// const fs = require('fs');
// const fileUpload = require('express-fileupload');
// const cors = require('cors');

// const app = express();

// app.use(fileUpload({
//   useTempFiles : true,
//   tempFileDir : '/tmp/',
//   // debug: true
// }));
// const port = 3000;

// app.use(cors({
//   origin: 'http://localhost:3000',
// }));


// process.env.AWS_REGION = 'eu-central-1'; 

// const s3Client = new S3Client({
//   region: 'eu-central-1',
//   endpoint: 'http://localhost:4566',
//   forcePathStyle: true,
// });


// const bucketName = 'my-cool-local-bucketcf';

// // const UPLOAD_TEMP_PATH = './uploads';

// app.get('/', (req, res) => {
//   res.send('Welcome');
// });

// app.get('/list-objects', (req, res) => {
//   const listObjectsParams = {
//     Bucket: bucketName,
//   };

//   s3Client
//     .send(new ListObjectsV2Command(listObjectsParams))
//     .then((data) => {
//       console.log('data', data);
//       res.json({ objects: data.Contents });
//     })
//     .catch((error) => {
//       console.error('Error listing objects:', error);
//       res.status(500).json({ error: 'Error listing objects' });
//     });
// });

// app.post('/upload', (req, res) => {
//   console.log('Received an image upload request.');
//   console.log('File:', req.files.file);
//   if (!req.files || !req.files.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   let file;
//   let uploadPath;

//   //The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
//   file = req.files.file;
//   const fileName = req.files.file.name;
//   uploadPath = req.files.file.tempFilePath;

  

//   // Use the mv() method to place the file somewhere on your server
//   file.mv(uploadPath, (err) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error uploading file' });
//     }

//     // Prepare S3 upload parameters
//     const uploadParams = {
//       Bucket: bucketName,
//       Key: fileName,
//       Body: fs.createReadStream(uploadPath), // Read the file from the local path
//     };

//     s3Client
//       .send(new PutObjectCommand(uploadParams))
//       .then(() => {
//         // Clean up the temporary file after successful upload
//         fs.unlinkSync(uploadPath);
//         res.json({ message: 'File uploaded to S3' });
//       })
//       .catch((error) => {
//         res.status(500).json({ error: 'Error uploading file to S3' });
//       });
//   });
// });




// app.get('/list-objects/:filename', (req, res) => {
//   const filename = req.params.filename;

//   const getObjectParams = {
//     Bucket: bucketName,
//     Key: filename,
//   };

//   s3Client.send(new GetObjectCommand(getObjectParams))
//     .then((getObjectResponse) => {
//       // Send the file data in the response.
//       res.setHeader('Content-Type', getObjectResponse.ContentType);
//       getObjectResponse.Body.pipe(res);
//     })
//     .catch((err) => {
//       console.error('Error', err);
//       res.status(500).send('Error downloading file from S3 bucket.');
//     });

 
// });


// app.listen(port, () => {
//   console.log(`Web application is running on port ${port}`);
// });