var http = require('http')
var bl = require('bl');


function run_cmd(cmd, args, options, callback) {
  var spawn = require('child_process').spawn;
  var child = spawn(cmd, args, options);
  var resp = "";

  child.stdout.on('data', function(buffer) { resp += buffer.toString(); });
  child.stdout.on('end', function() {
    callback && callback (resp)
  });
  child.on('error', function (e) {
    console.error(e);
  })
}

http.createServer(function (req, res) {

  req.pipe(bl(function (error, data) {

    if (error) {
      console.error(error);
      res.end('error')
      return;
    }

    var obj;
    try {
      obj = JSON.parse(data.toString())
    } catch (e) {
      console.error(error);
      res.end('error')
      return
    }

    if (obj.object_kind != 'push') {
      return res.end()
    }

    var path = obj.repository.url.split(":")[1].split('.')[0];

    run_cmd('./deploy', [], {
      env: {
        GIT_PATH: path,
        GIT_URL: obj.repository.url
      }
    }, function (data) {
      console.log(data)
    });

    res.end();
  }))
}).listen(7777)
