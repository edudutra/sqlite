var _ = require('underscore')
var fs = require('fs-extra')
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./teste.db', sqlite3.OPEN_READONLY)


console.time('total')
db.serialize(function () {
  console.time('consulta')
  db.all('SELECT * FROM comandas where IDMasterConta <= 100', function (err, rows) {
    if (err) {
      console.error(err)
    }
    console.timeEnd('consulta')
    console.time('map')
    var val = _.map(rows, function (row) {
      return _.values(row).join()
    })
    console.timeEnd('map')
    console.time('join')
    var file = 'file.txt'
    var header = _.allKeys(rows[0])
    var fileContent = header + '\r\n' + val.join('\r\n')
    console.timeEnd('join')
    console.time('outputFile')
    fs.outputFile(file, fileContent, function (err) {
      if (err) {
        console.log(err)
      }
    })
    console.timeEnd('outputFile')
    console.timeEnd('total')

    console.log('registros: ' + rows.length)
    console.log('bytes: ' + fileContent.length)
  })
})

db.close()
