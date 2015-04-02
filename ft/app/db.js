DB = {}

DB.escape = function (val) {
  val = "'"+val.toString().replace(/[\0\n\r\b\t\\'"\x1a]/g, function (s) {
    switch (s) {
      case "\0":
        return "\\0";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\b":
        return "\\b";
      case "\t":
        return "\\t";
      case "\x1a":
        return "\\Z";
      case "'":
        return "''";
      case '"':
        return '""';
      default:
        return "\\" + s;
    }
  })+"'";

  return val;
}

DB.load = function(data, next){
  var db = new SQL.Database();

  var sqlstr = 'DROP TABLE IF EXISTS "table";\n'
  var cols = []
  for (col in data[0]){
      var type = 'char';
      if(typeof data[0][col] === 'int'){
          type = 'integer';
      }
      cols.push(DB.escape(col)+" "+DB.escape(type))
  }
  sqlstr += 'CREATE TABLE "table" ('+cols.join(',')+');\n'
  data.forEach(function(line){
    sqlstr += 'INSERT INTO "table" VALUES ('+_.values(line).map(DB.escape).join(',')+');\n'
  })
  db.run(sqlstr);
  DB.db = db;
  next(db)
}