var express = require('express');
var router = express.Router();
var pool = require('../modules/pool');
var processContactCSV = require('../modules/store.email.csv');

var uploadedData = [];

// retrieves all potential client email records
router.get('/', function (req, res) {
  console.log(req.query);
  batchId = req.query.batchId;
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('Error connecting', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = 'SELECT * FROM "emails" WHERE "batch_id" = $1 ORDER BY "last","first","email_id";';
      db.query(queryText, [
        batchId
      ], function (errorMakingQuery, result) {
        console.log('used this batchId', batchId);
        done();
        if (errorMakingQuery) {
          console.log('error making query', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      });
    }
  }); //end of pool
});

// retrieves all email upload batches
router.get('/batches/', function (req, res) {
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('Error connecting', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = 'SELECT * FROM "email_batch"' +
      'JOIN "offices" on "email_batch".office_id = "offices".office_id;';
      db.query(queryText, function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('error making query', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      });
    }
  }); //end of pool
});

// deletes email upload batch 
router.delete('/batches/',function(req,res) {
  var batch_id = req.query.batch_id;
  pool.connect(function(errorConnecting, db, done){
    if (errorConnecting) {
      console.log('Error connecting to delete batch', errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = 'DELETE FROM "email_batch" WHERE "batch_id" = $1';
      db.query(queryText, [batch_id], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('Query error deleting batches', errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      });
    }
  });
});

// upload CSV and create potential client email records
router.post('/csv/', function (req, res) {
  if (req.isAuthenticated) {
    var dataInfo = {
      uploadedData: [],
      user: req.user,
      batchId: -1,
      path: './server/upload/emailcsvs/' + req.files.file.name,
      fileName: req.files.file.name
    };

    console.log('DATA INFO:', dataInfo);

    console.log('path', dataInfo.path);
    req.files.file.mv(dataInfo.path, function (error) {
      if (error) {
        console.log('error moving file', error);
        return res.sendStatus(500);
      }

      dataInfo.batchId = createBatch(dataInfo)
        .then((batchId) => {
          console.log('created batch');
          dataInfo.batchId = batchId;
          processContactCSV(dataInfo)
            .then((batch) => {
              console.log('responding positively!', batch);
              result = {
                batchId: batch
              };
              res.send(result);
            });
        })
        .catch((error) => {
          res.sendStatus(500);
        });
    });
  }
});

// marks mailto link as clicked
router.put('/', function (req, res) {
  console.log('request', req.query);
  var emailId = req.query.id;
  var index = req.query.index;
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      res.sendStatus(500);
    } else {
      var queryText = 'UPDATE "emails" SET "clicked" = TRUE WHERE "email_id" = $1 RETURNING *;';
      db.query(queryText, [
        emailId
      ], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          res.sendStatus(500);
        } else {
          res.send({
            contact: result.rows[0],
            index: index
          });
        }
      });
    }
  }); //end of pool
});

// get indivitual email record
router.get('/single/', function (req, res) {
  var email_id = req.query.email_id;
  var index = req.query.index;
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      res.sendStatus(500);
    } else {
      var queryText = 'SELECT * FROM "emails" WHERE "email_id" = $1;';
      db.query(queryText, [
        email_id
      ], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          res.sendStatus(500);
        } else {
          res.send({
            contact: result.rows[0],
            index: index
          });
        }
      });
    }
  }); //end of pool

});

// sets whether 
router.put('/insertlink/', function (req, res) {
  console.log('market link request', req.query);
  var emailId = req.query.id;
  var marketLink = req.query.market_link;
  var index = req.query.index;
  pool.connect(function (errorConnecting, db, done) {
    if (errorConnecting) {
      console.log('error connecting marketlink',errorConnecting);
      res.sendStatus(500);
    } else {
      var queryText = 'UPDATE "emails" SET "market_link" = $2 WHERE "email_id" = $1 RETURNING *;';
      db.query(queryText, [
        emailId,
        marketLink
      ], function (errorMakingQuery, result) {
        done();
        if (errorMakingQuery) {
          console.log('query error marketlink',errorMakingQuery);
          res.sendStatus(500);
        } else {
          res.send({
            contact: result.rows[0],
            index: index
          });
        }
      });
    }
  }); //end of pool
});

router.put('/track/',function(req,res){
    var eid = req.query.eid;
    console.log('eid',eid);
    pool.connect(function (errorConnecting, db, done) {
        if (errorConnecting) {
            console.log("error connecting",errorConnecting);
            res.sendStatus(500);
        } else {
            var queryText = 'UPDATE "emails" SET "click_through" = TRUE WHERE "email_id" = $1 RETURNING "market";';
            db.query(queryText, [
                eid
            ], function (errorMakingQuery, result) {
                done();
                if (errorMakingQuery) {
                    console.log('error making query',errorMakingQuery);
                    res.sendStatus(500);
                } else {
                    res.send({
                        market: result.rows[0].market
                    });
                }
            });
        }
    }); //end of pool
});


function createBatch(dataInfo) {
  return new Promise((resolve, reject) => {
    pool.connect(function (errorConnecting, db, done) {
      if (errorConnecting) {
        reject(errorConnecting);
      } else {
        var queryText = 'INSERT INTO "email_batch" ("file_name","user_id","office_id") VALUES($1,$2,$3) RETURNING "batch_id";';
        db.query(queryText, [
          dataInfo.fileName,
          dataInfo.user.id,
          dataInfo.user.o_id,
        ], function (errorMakingQuery, result) {
          done();
          if (errorMakingQuery) {
            reject(errorMakingQuery);
          } else {
            resolve(result.rows[0].batch_id);
          }
        });
      }
    }); //end of pool
  });
}

module.exports = router;