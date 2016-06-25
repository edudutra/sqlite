// Demonstration that bulk insertsin Node.js sqlite3 using prepared statements is very slow.
// Usage: run with one command line argument, one of 'db', 'reuse', 'finalize'
// Details: http://nelsonslog.wordpress.com/2014/11/16/node-js-sqlite3-very-slow-bulk-inserts/

var sqlite3 = require('sqlite3').verbose()
var fs = require('fs-extra')
var parse = require('csv-parse')
var _ = require('underscore')
var sql = require('sql')
sql.setDialect('sqlite')
var ProgressBar = require('progress')

var comanda = sql.define({
  name: 'tblMasterConta', 
  columns: [{
    name: 'IDMasterConta',
    dataType: 'BIGINT',
    primaryKey: true,
    notNull: true
  }, {
    name: 'CPF',
    dataType: 'varchar(15)', 
    notNull: true
  }, {
    name: 'IdLoja',
    dataType: 'INTEGER', 
    notNull: true
  }, {
    name: 'CodigoLoja',
    dataType: 'INTEGER'
  }, {
    name: 'SiglaRede',
    dataType: 'varchar(5)'
  }, {
    name: 'DataFiscal',
    dataType: 'DATE'
  }, {
    name: 'ValorTotal',
    dataType: 'numeric(18,3)'
  }
]
})

var start = Date.now()
var db = new sqlite3.Database('teste.db')
// var db = new sqlite3.Database(':memory:')
var mode = process.argv[2]

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
    db.run(comanda.drop().ifExists().toString())
    db.run(comanda.create().ifNotExists().toString())

    //data.pop()
    data.shift()

    var items = {
      IDMasterConta: data[0][0],
      CPF: data[0][1],
      IdLoja: data[0][2],
      CodigoLoja: data[0][3],
      SiglaRede: data[0][4],
      DataFiscal: data[0][5],
      ValorTotal: data[0][6]
    }
    
    console.log(items)
    var insert = comanda.insert(items).toQuery()
    console.log(insert.values)
    var stmt = db.prepare(insert.text)

    stmt.run(data)
    

    // var bar = new ProgressBar('importando [:bar] :percent :etas', { total: data.length})

    // data.forEach(function (element) {
    //   stmt.run(element)
    //   bar.tick()
    // }, this)

    // Three different methods of doing a bulk insert
    //var bar = new ProgressBar('importando [:bar] :percent :etas', { total: data.length - 2 })

    // if (mode === 'all') {
    //   data.shift()
    //   data.pop()
    //   stmt.run(data)
    // }
    // else {

    
    //   //var com = 0
    //   for (var i = 1; i <= data.length-1; i++) {
        
    //     if (mode === 'db') {
    //       db.run(insert, data[i])
    //     } else if (mode === 'reuse') {
    //       stmt.run(data[i])
    //     } else if (mode === 'finalize') {
    //       stmt = db.prepare(insert)
    //       stmt.run(data[i])
    //       stmt.finalize()
    //     } else {
    //       console.log('Command line args must be one of \'db\', \'reuse\', \'finalize\'')
    //       process.exit(1)
    //     }
    //     bar.tick()
    //   }
    //     // com++
    //   // if (com === 1000) {
    //   //   db.run('commit')
    //   //   db.run('begin transaction')
    //   //   com = 0
    //   // }
    // }
    db.run('commit')
  })
  db.close(function () {
    // sqlite3 has now fully committed the changes
    console.log((Date.now() - start) + 'ms')
  })
}
