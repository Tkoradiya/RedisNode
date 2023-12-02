var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3'); 

var connenction = new sqlite3.Database('./db/sqlite.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err) 
  { 
      console.log("Error Occurred - " + err.message); 
  } 
  else
  { 
      console.log("DataBase Connected"); 
  } 
}) 

router.get('/add',function(req, res, next) {
  const students_array = "SELECT * FROM student"
  const course_array = "SELECT * FROM course"
  
  connenction.all(students_array, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }console.log(rows);
    connenction.all(course_array, [], (err, row) => {
      if (err) {
        return console.error(err.message);
      }console.log(row);
      //res.render("enrollment/enrollment_add", { students_array: rows ,course_array: row });
      
        res.render("enrollment/enrollment_add", { students_array: rows ,course_array: row});
    
    })
    //res.render("enrollment/enrollment_add", { db_rows_array: rows });
  });

  
});

router.post('/add',function(req, res){
    console.log(req.body);
    const students_array = "SELECT * FROM student"
  const course_array = "SELECT * FROM course"
  
   

    connenction.run("insert into enrollment(enrollment_date,student_id,course_id,grade) VALUES (?,?,?,?) ",[req.body.enrollment_date,req.body.student_id,req.body.course_id,req.body.grade],function(err, result){
      if(err) throw err;
      
      connenction.all(students_array, [], (err, rows) => {
        if (err) {
          return console.error(err.message);
        }console.log(rows);
        connenction.all(course_array, [], (err, row) => {
          if (err) {
            return console.error(err.message);
          }console.log(row);
          //res.render("enrollment/enrollment_add", { students_array: rows ,course_array: row });
          
            res.render("enrollment/enrollment_add", { students_array: rows ,course_array: row, success : 'Data inserted'});
        
        })
    })
  });
});
  
router.get('/display', function(req, res, next) {
    const sql = "SELECT enrollment.*,course.course_name,student.fname || student.lname AS fullname FROM enrollment LEFT JOIN student on student.student_id = enrollment.student_id  LEFT JOIN course on course.course_id = enrollment.course_id"
    connenction.all(sql, [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      console.log(rows);
      res.render("enrollment/enrollment_display", { db_rows_array: rows });
    });
});
  

router.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM enrollment WHERE enrollment_id = ?";
  connenction.run(sql, id, err => {
    // if (err) ...
    console.log("Record Deleted");
    res.redirect("/enrollment/display");
  });
});
  
router.get('/show/:id/', function(req,res,next){
    const id = req.params.id;
  const sql = "Select enrollment.*,student.fname || student.lname as fullname,course.course_name from enrollment join student on student.student_id = enrollment.student_id JOIN course on course.course_id = enrollment.course_id where enrollment.enrollment_id = ?";
  connenction.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("enrollment/enrollment_show", { db_rows_array: row });
  });
});
  
router.get('/edit/:id/',function(req,res,next){
  const id = req.params.id;
  console.log(id);
  const sql = "Select * from enrollment where enrollment_id = ?";
  connenction.get(sql, id, (err, row) => {
   console.log(row);
      const sql1 = "SELECT * FROM student"
    connenction.all(sql1, [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }console.log(rows);
      res.render("enrollment/enrollment_edit", { db_rows_array: row ,student : rows});
    });


  });
});

router.post('/edit/:id/', function(req,res,next){
  console.log("Edit id is:" + req.params.id);
  const id = req.params.id;
  const data = [req.body.enrollment_date,req.body.grade,req.body.student_id, id];
  const sql = "UPDATE enrollment SET enrollment_date = ?, grade = ?, student_id = ? WHERE (enrollment_id = ?)";
  connenction.run(sql, data, err => {
    // if (err) ...
    res.redirect('/enrollment/display');
  });
});
  
module.exports = router;