var express = require('express');
var router = express.Router();

const { MongoClient,ObjectId } = require('mongodb');


const client = new MongoClient('mongodb://127.0.0.1:27017/assignment4', { useNewUrlParser: true, useUnifiedTopology: true });


const databaseName = 'assignment4';
 const collectionName = 'student';


router.get('/add',function(req, res, next) {
  console.log("123");
    res.render('student/student_add');
    
  });
// Route to handle data insertion
router.post('/add', async (req, res) => {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Access the specific database and collection
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Data to be inserted (assuming data is sent in the request body)
    const dataToInsert = req.body;

    // Insert data into the collection
    const result = await collection.insertOne(dataToInsert);

    console.log(`Inserted ${result.insertedCount} document into the collection`);

    // Respond with success message
    res.status(200).send('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection when done
    await client.close();
    console.log('Connection closed');
  }
});




router.get('/edit/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await client.connect();

    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Retrieve data using the provided ID
    const result = await collection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).send('Not Found');
    }

    // Render an HTML page with the data for editing
    res.render('student/student_edit', { db_rows_array: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

router.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  try {
    await client.connect();

    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Update data using the provided ID
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });

    if (result.matchedCount === 0) {
      return res.status(404).send('Not Found');
    }

    res.redirect('/student/display');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});


// Define the route to display data
router.get('/display', async (req, res) => {
  try {
    
    await client.connect();
    console.log('Connected to the database');

    // Access the specific database and collection
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Retrieve all documents from the collection
    const cursor = collection.find();

    // Convert documents to an array
    const documents = await cursor.toArray();
    res.render('student/student_display', { db_rows_array: documents});
    // Close the connection
    await client.close();
    console.log('Connection closed');

    // Send the retrieved data as JSON response
    //res.json(documents);
  } catch (error) {
    console.error('Error retrieving and displaying data:', error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/show/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await client.connect();

    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Retrieve data using the provided ID
    const result = await collection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).send('Not Found');
    }

    // Render an HTML page with the data for editing
    res.render('student/student_show', { db_rows_array: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});
 
router.get('/delete/:id', async (req, res) => {
  try {
    // Connect to the database
    await client.connect();

    // Access the specific database and collection
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Extract the id parameter from the request
    const id = req.params.id;

    // Create a MongoDB ObjectId from the id
    const objectId = new ObjectId(id);

    // Delete the document by its ObjectId
    const result = await collection.deleteOne({ _id: objectId });

    res.redirect('/student/display');
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    // Close the connection when done
    await client.close();
  }
});

module.exports = router;