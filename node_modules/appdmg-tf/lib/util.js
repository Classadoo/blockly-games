var execFile = require('child_process').execFile
var xattr = require('fs-xattr')
var cpFile = require('cp-file')

exports.sh = function (prog, args, cb) {
  execFile(prog, args, {
    maxBuffer: 1024 * 1024 * 10
  }, function (error, stdout, stderr) {
    setImmediate(cb, error, {stdout: stdout, stderr: stderr})
  })
}

exports.cp = function (source, target, cb) {
  cpFile(source, target).then(function () {
    setImmediate(cb, null)
  }).catch(function (err) {
    setImmediate(cb, err)
  })
}

exports.dusm = function (path, cb) {
  exports.sh('du', ['-sm', path], function (err, res) {
    if (err) return cb(err)

    if (res.stderr.length > 0) {
      return cb(new Error('du -sm: ' + res.stderr))
    }

    var m = /^([0-9]+)\t/.exec(res.stdout)
    if (m === null) {
      console.log(res.stdout)
      return cb(new Error('du -sm: Unknown error'))
    }

    return cb(null, parseInt(m[1], 10))
  })
}

exports.tiffutil = function (a, b, out, cb) {
  exports.sh('tiffutil', ['-cathidpicheck', a, b, '-out', out], function (err) { cb(err) })
}

exports.seticonflag = function (path, cb) {
  var buf = new Buffer(32)
  buf.fill(0)
  buf.writeUInt8(4, 8)
  xattr.set(path, 'com.apple.FinderInfo', buf, cb)
}
