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
   
  const sql = "SELECT * FROM department"
  connenction.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }console.log(rows);
    res.render("course/course_add", { db_rows_array: rows });
  });
   

  
});

router.post('/add',function(req, res){
    console.log(req.body);
    connenction.run("insert into course(course_code,course_name,credit,dept_id) VALUES (?,?,?,?) ",[req.body.course_code,req.body.name,req.body.credit,req.body.dept_id],function(err, result){
      if(err) throw err;
      const sql = "SELECT * FROM department"
  connenction.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }console.log(rows);
    res.render("course/course_add", { db_rows_array: rows ,success : 'Data inserted'});
  });
     
    })
});
  
router.get('/display', function(req, res, next) {
    


    const sql = "SELECT * FROM course"
    connenction.all(sql, [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }console.log(rows);
      res.render("course/course_display", { db_rows_array: rows });
    });
});
  

router.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM course WHERE course_id = ?";
  connenction.run(sql, id, err => {
    // if (err) ...
    console.log("Record Deleted");
    res.redirect("/course/display");
  });
});
  
router.get('/show/:id/', function(req,res,next){
    const id = req.params.id;
  const sql = "Select course.*,department.dept_name from course JOIN department on department.dept_id = course.dept_id where course.course_id = ?";
  connenction.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("course/course_show", { db_rows_array: row });
  });
});
  
router.get('/edit/:id/',function(req,res,next){
  


  const id = req.params.id;
  const sql = "Select * from course where course_id = ?";
  connenction.get(sql, id, (err, row) => {
    // if (err) ...
    const sql1 = "SELECT * FROM department"
    connenction.all(sql1, [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }console.log(rows);
      res.render("course/course_edit", { db_rows_array: row ,department : rows});
    });
  })
});

router.post('/edit/:id/', function(req,res,next){
  console.log("Edit id is:" + req.params.id);

  const id = req.params.id;
  const data = [req.body.course_code,req.body.name,req.body.credit,req.body.dept_id, id];
  const sql = "UPDATE course SET course_code = ?, course_name = ?, credit = ?, dept_id = ? WHERE (course_id = ?)";
  connenction.run(sql, data, err => {
    // if (err) ...
    res.redirect('/course/display');
  });
});
  
module.exports = router;