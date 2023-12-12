const express = require('express');
const { createClient } = require("redis");
var app = express.Router();

let redisClient = null;

// Middleware to establish Redis connection
app.use(async (req, res, next) => {
 redisClient = await createClient()
    .on("error", (err) => console.log("Redis Client connection error " + err))
    .connect();

// console.log("Connected to Redis Client", redisClient);

 next();
});

app.get('/add', function (req, res, next) {
 res.render('department/department_add');
});

app.post('/add', async (req, res) => {
  const department = req.body;

  try {
      await redisClient.set('name', JSON.stringify(department));
      res.status(200).send('Department added');
  } catch (err) {
      console.log(err);
      res.status(500).send(err);
  }
});

// Get the value for a given key from Redis
app.get('/get/:key', async (req, res) => {
  
  const key = req.params.key;
 
  try {
    const result = await redisClient.get(key);
    console.log(result);
    if (result === null) {
      return res.status(404).json({ error: 'Key not found.' });
    }

    res.json({ key, value: result });
 } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
 }
  
});

// Render the form to edit data
app.get('/edit/:key', async (req, res) => {
  const key = req.params.key;

  

  try {
    const result = await redisClient.get(key);
    console.log(JSON.parse(result));
        if (result === null) {
      return res.status(404).json({ error: 'Key not found.' });
    }

    res.render('department/department_edit', { key, value: JSON.parse(result) });
 } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
 }
});

// Handle the form submission for editing data
app.post('/edit/:key', async (req, res) => {
  

  try {
    const key = req.params.key;
    const { value } = req.body;
    console.log(key,"---",value);
    if (!value) {
      return res.status(400).send('Value is required for modification.');
    }
   
    const result = await redisClient.get('name');
    
    if (result === null) {
      return res.status(404).json({ error: 'Key not found.' });
    }

    // Create a JSON object with the specified structure
const jsonObject = { name: value };

// Convert the object to a JSON-formatted string
const jsonString = JSON.stringify(jsonObject);

console.log(jsonString);

    let jsonData = [];

    if (result) {
      jsonData = JSON.parse(result);
    }
    console.log(result);
    const data = await redisClient.set(key,jsonString);
   // console.log("result--",data);

  
    if (data === null) {
      return res.status(404).json({ error: 'Key not found.' });
    }

    res.redirect('/');

    /*if (!value) {
      return res.status(400).send('Value is required for modification.');
    }


    const result = await redisClient.set(key,value);
    console.log("result--",result);

    
    if (result === null) {
      return res.status(404).json({ error: 'Key not found.' });
    }

    res.redirect('/');*/
 } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
 }
});

app.get('/display', async (req, res) => {
  try {
    const result = await redisClient.get('name');
   console.log(result);
    if (result === null) {
      return res.status(404).json({ error: 'Key not found.' });
    }
    let jsonArray = [];
    jsonArray = JSON.parse(result);
console.log(jsonArray);
   // res.render('department/department_display', { "jsonData": jsonArray });
 
  const resultArray = [jsonArray];

console.log(resultArray);
  res.render('department/department_display', { resultArray: resultArray });
  } catch (err) {
     console.error(err);
     res.status(500).send('Internal Server Error');
  }
 });
// Middleware to close Redis connection
app.use(async (req, res, next) => {
 await redisClient.disconnect();
 console.log("Disconnected from Redis Client");

 next();
});

module.exports = app;