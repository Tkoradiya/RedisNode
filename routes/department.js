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


/*app.get('/:dept_id', async (req, res) => {
  const dept_id = req.params.dept_id;

  try {
    const students = await redisClient.get(`department:${dept_id}`);
    console.log
    res.render('department/department_display', { students, dept_id });
  } catch (err) {
    console.error('Error retrieving students:', err);
    res.status(500).send('Error retrieving students');
  }
});*/

app.get('/add', function (req, res, next) {
 res.render('department/department_add');
});

app.post('/add', async (req, res) => {
  const { student_id, fname, lname, dept_id } = req.body;

 try {
    // Check if the department hash exists
   // const hashExists = await redisClient.exists(`department:${dept_id}`);

    //if (!hashExists) {
      await redisClient.hSet(`department:${dept_id}`, student_id, JSON.stringify({ fname, lname }));
      res.redirect('/department/display');
      //res.status(201).send(`Student ${student_id} added to Department ${dept_id}`);
   // } else {
      // Check if the student already exists in the department
      /*const studentExists = await redisClient.exists(`department:${dept_id}`, student_id);

      if (!studentExists) {
        await redisClient.hSet(`department:${dept_id}`, student_id, JSON.stringify({ fname, lname }));
        await redisClient.add(`department_students:${dept_id}`, student_id);
        res.status(201).send(`Student ${student_id} added to Department ${dept_id}`);
      } else {
        res.status(409).send(`Student ${student_id} already exists in Department ${dept_id}`);
      }
    }*/
  } catch (err) {
    console.error('Error adding student to department:', err);
    res.status(500).send('Error adding student to department');
  }
});


// Handle form submission to edit a student
app.post('/edit/:dept_id/:student_id', async (req, res) => {
  const dept_id = req.params.dept_id;
  const student_id = req.params.student_id;
  const { fname, lname } = req.body;

  try {
    const key = `department:${dept_id}`;
    const studentDetails = JSON.stringify({ fname, lname });

    // Check if the department hash exists
    const hashExists = await redisClient.exists(key);

    if (hashExists) {
      // Check if the student exists in the department
      const studentExists = await redisClient.exists(key, student_id);

      if (studentExists) {
        await redisClient.hSet(key, student_id, studentDetails);
        res.redirect(`/department/edit/${dept_id}/${student_id}`);
      } else {
        res.status(404).send('Student not found');
      }
    } else {
      res.status(404).send('Department not found');
    }
  } catch (err) {
    console.error('Error editing student:', err);
    res.status(500).send('Error editing student');
  }
});


// Delete a student from a department
app.post('/delete', async (req, res) => {
  const { student_id, dept_id } = req.body;

  try {
    await redisClient.del(`department:${dept_id}`, student_id);
    res.redirect(`/department/${dept_id}`);
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).send('Error deleting student');
  }
});




// Render the form to edit a student
app.get('/edit/:dept_id/:student_id', async (req, res) => {
  const dept_id = req.params.dept_id;
  const student_id = req.params.student_id;

  try {
    const key = `department:${dept_id}`;
    const studentDetails = await redisClient.hGet(key, student_id);
    
  
    if (studentDetails) {
      const student = JSON.parse(studentDetails);
      
      res.render('department/department_edit', { dept_id, student_id, student });
    } else {
      res.status(404).send('Student not found');
    }
  } catch (err) {
    console.error('Error retrieving student details:', err);
    res.status(500).send('Error retrieving student details');
  }
});

// Home page - Display all students in a department
app.get('/display', async (req, res) => {
  const dept_id = req.query.dept_id || 9;

  try {
    const students = await redisClient.hGetAll(`department:${dept_id}`);
    console.log(students);
    console.log(dept_id);
    res.render('department/department_display', { students, dept_id });
  } catch (err) {
    console.error('Error retrieving students:', err);
    res.status(500).send('Error retrieving students');
  }
});


// Delete student
app.get('/delete/:dept_id/:student_id', async (req, res) => {
  const dept_id = req.params.dept_id;
  const student_id = req.params.student_id;

  try {
    await redisClient.hDel(`department:${dept_id}`, student_id);
    res.redirect(`/?dept_id=${dept_id}`);
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).send('Error deleting student');
  }
});

// Middleware to close Redis connection
app.use(async (req, res, next) => {
 await redisClient.disconnect();
 console.log("Disconnected from Redis Client");

 next();
});

module.exports = app;