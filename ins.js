var sqlite3 = require('sqlite3').verbose()
var sql = require('sql')

var db = new sqlite3.Database('teste.db')

sql.setDialect('sqlite')

var group = sql.define({
  name: 'group',
  columns: [{
      name: 'id',
      dataType: 'INTEGER'
    }, {
      name: 'user_id',
      dataType: 'varchar(100)'
    }
  ]
})




  db.serialize(function () {
    db.run('begin transaction')
    db.run(group.drop().ifExists().toString())
    db.run(group.create().ifNotExists().toString())
    //var insert = 'insert into comandas (IDMasterConta, CPF, IdLoja, CodigoLoja, SiglaRede, DataFiscal, ValorTotal) values (?,?,?,?,?,?,?)'
    //var stmt = db.prepare(insert)
    var insert = group.insert([
        {
          id: 1, 
          user_id: 'eduardo'
        },
        {
          id: 2, 
          user_id: 'daniela'
        }
    ]).toQuery()

    var stmt = db.prepare(insert.text)

    //console.log(insert.text)
    //console.log(insert.values)
    //db.run(insert.text, insert.values)
    stmt.run(insert.values)

    db.run('commit')
  })

  // db.close(function () {
  //   // sqlite3 has now fully committed the changes
  //   console.log((Date.now() - start) + 'ms')
  // })
