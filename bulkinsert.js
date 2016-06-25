// Demonstration that bulk insertsin Node.js sqlite3 using prepared statements is very slow.
// Usage: run with one command line argument, one of 'db', 'reuse', 'finalize'
// Details: http://nelsonslog.wordpress.com/2014/11/16/node-js-sqlite3-very-slow-bulk-inserts/

var sqlite3 = require('sqlite3').verbose()
var fs = require('fs-extra')
var parse = require('csv-parse')

var ProgressBar = require('progress')

var start = Date.now()
var db = new sqlite3.Database('teste.db')
var mode = process.argv[2]
var runs = '100'

console.time('Read File')
fs.readFile('./file.txt', function read (err, data) {
  if (err) {
    throw err
  }
  var content = data

  // Invoke the next step here however you like
  //console.log(content)   // Put all of the code here (not the best solution)
  console.timeEnd('Read File')
  parseFile(content)          // Or put the next step in a function and invoke it
})

function parseFile (input) {
  console.time('Parse')
  parse(input, {comment: '#'}, function (err, output) {
    if (err) {
      console.error(err)
    }
    console.timeEnd('Parse')

    bulk(output)
    // console.log('Tamanho: ' + output.length)
    // console.log(output[0])
    // console.log(output[1])
    // console.log(output[2])
  })
}

function bulk (data) {
  db.serialize(function () {
    db.run('begin transaction')
    db.run('drop table if exists comandas')
    db.run('CREATE TABLE comandas (IDMasterConta BIGINT PRIMARY KEY  NOT NULL, CPF  VARCHAR (15)    NOT NULL,    IdLoja        INTEGER         NOT NULL,    CodigoLoja    INTEGER,    SiglaRede     VARCHAR (5),    DataFiscal    DATE,   ValorTotal NUMERIC (18, 3) );')
    var insert = 'insert into comandas (IDMasterConta, CPF, IdLoja, CodigoLoja, SiglaRede, DataFiscal, ValorTotal) values (?,?,?,?,?,?,?)'
    var stmt = db.prepare(insert)
    // Three different methods of doing a bulk insert
    var bar = new ProgressBar('importando [:bar] :percent :etas', { total: data.length - 2 })

    if (mode === 'all') {
      data.shift()
      data.pop()
      stmt.run(data)
    }
    else {

    
      //var com = 0
      for (var i = 1; i <= data.length-1; i++) {
        
        if (mode === 'db') {
          db.run(insert, data[i])
        } else if (mode === 'reuse') {
          stmt.run(data[i])
        } else if (mode === 'finalize') {
          stmt = db.prepare(insert)
          stmt.run(data[i])
          stmt.finalize()
        } else {
          console.log('Command line args must be one of \'db\', \'reuse\', \'finalize\'')
          process.exit(1)
        }
        bar.tick()
      }
        // com++
      // if (com === 1000) {
      //   db.run('commit')
      //   db.run('begin transaction')
      //   com = 0
      // }
    }
    db.run('commit')
  })
  db.close(function () {
    // sqlite3 has now fully committed the changes
    console.log((Date.now() - start) + 'ms')
  })
}
