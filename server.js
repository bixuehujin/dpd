var http = require('http')
var bl = require('bl');
var logger = require('winston');


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
  logger.info('%s %s', req.method, req.url);

  req.pipe(bl(function (error, data) {

    if (error) {
      logger.error("failed to parse request: %j", error);
      res.end('error')
      return;
    }

    var obj;
    try {
      obj = JSON.parse(data.toString())
    } catch (e) {
      logger.error("failed to parse json: %s", e.message);
      res.end('error')
      return
    }

    if (obj.object_kind != 'push') {
      return res.end()
    }

    var path = obj.repository.url.split(":")[1].split('.')[0];
    var envs = {
      GIT_PATH: path,
      GIT_URL: obj.repository.url,
      GIT_SSH: process.cwd() + '/git_ssh',
      DEFAULT_TARGET_PATH: './targets'
    };

    logger.info("Starting to run ./deploy with env:", envs);

    run_cmd('./deploy', [], {
      env: envs
    }, function (data) {
      logger.info('command output: %s', data)
    });

    res.end();
  }))
}).listen(7777)
