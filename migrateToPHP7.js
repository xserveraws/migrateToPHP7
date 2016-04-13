var fs = require('fs');
var walk = require('./walk');

walk(__dirname, function(err, results) {
  if (err) throw err;
  var filesCount = results.length;
  var successCount = 0;
  var errorCount = 0;
  console.log('All:', filesCount);
  results.forEach(function (file) {
    fs.readFile(file, 'utf8', function(err, code) {
      if( err ) {
        errorCount++;
      }
      code = migrateCode(code);
      fs.writeFile(file, code, function(err) {
        if( err ) {
          errorCount++;
        } else {
          successCount++;
        }
        console.log('Filename:', file, '; Left:', --filesCount);
        if( !filesCount ) {
          console.log('Success:', successCount);
          console.log('Error:', errorCount);
        }
      });
    });
  });
});

function migrateCode (code) {
  var classNames = code.match(/^\s*class\s+\w+/gm);
  if( classNames ) {
    classNames.forEach(function (fullClassName) {
      var className = fullClassName.replace(/^\s*class\s+/m, '');
      var funcRegExp = new RegExp('function\\s+' + className + '(?=\\s*\\()');
      // (?!(.|\\s)+' + fullClassName + '.*{)', 'm');
      code = code.replace(funcRegExp, '// automigrate_to_php7 (was function ' + className + ')\nfunction __construct');
    });
  }
  return code;
}
