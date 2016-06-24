// Demonstration that bulk insertsin Node.js sqlite3 using prepared statements is very slow.
// Usage: run with one command line argument, one of 'db', 'reuse', 'finalize'
// Details: http://nelsonslog.wordpress.com/2014/11/16/node-js-sqlite3-very-slow-bulk-inserts/

var sqlite3 = require('sqlite3').verbose()

var start = Date.now()
var db = new sqlite3.Database('inserttest.sqlite')
var mode = process.argv[2]
var runs = '100'

db.serialize(function () {
  db.run('begin transaction')
  db.run('drop table if exists data')
  db.run('create table data (value integer)')
  var stmt = db.prepare('insert into data values (?)')
  // Three different methods of doing a bulk insert
  for (var i = 0; i < runs; i++) {
    if (mode === 'db') {
      db.run('insert into data values (?)', i)
    } else if (mode === 'reuse') {
      stmt.run(i)
    } else if (mode === 'finalize') {
      stmt = db.prepare('insert into data values (?)')
      stmt.run(i)
      stmt.finalize()
    } else {
      console.log('Command line args must be one of \'db\', \'reuse\', \'finalize\'')
      process.exit(1)
    }
  }
  db.run('commit')
})
db.close(function () {
  // sqlite3 has now fully committed the changes
  console.log((Date.now() - start) + 'ms')
})
