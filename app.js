'use strict';

var program = require('commander'),
    path = require('path'),
    childProcess = require('child_process'),
    slimerPath = '/usr/local/bin/slimerjs', // full path to slimer.js
    fs = require('fs');

program
 .version('1.0.0');

program
 .command('registration <filepath> <pause>')
 .description('Register new users')
 .action(function(filepath, pause) {
    fs.readFile(path.join(__dirname, filepath), function(err, data) {
      var users;
      if (err) {
        return console.log(filepath + ' cannot found');
      }
      try {
        users = JSON.parse(data.toString());
      } catch(err) {
        return console.log(filepath + ' is not valid JSON');
      }
      registerUser(users, pause);
    });
 });

program
 .command('vote <url> <filepath> <limit> <pause>')
 .description('Vote on post')
 .action(function(url, filepath, limit, pause) {
   fs.readFile(path.join(__dirname, filepath), function(err, data) {
      var users;
      if (err) {
        return console.log(filepath + ' cannot found');
      }
      try {
        users = JSON.parse(data.toString());
      } catch(err) {
        return console.log(filepath + ' is not valid JSON');
      }
      if (users.length > limit) {
        users = users.slice(0,limit);
      }
      vote(users, url, pause);
    });
 });

program.parse(process.argv);

function registerUser(users, pause) {
  if (!users.length) {
    console.log('finished registering users');
    return;
  }
  var user = users.shift();
  callSlimer('registration', packData(user))
    .then(function() {
      console.log('successfully registred a user');
      setTimeout(function() {
        registerUser(users, pause);
      }, pause);
    })
    .catch(function(err) {
      console.log('error while registered a user', err);
    });
}

function vote(users, url, pause) {
  if (!users.length) {
    console.log('finished voting');
    return;
  }
  var userData = users.shift();
  userData.url = encodeURIComponent(url);
  callSlimer('vote', packData(userData))
    .then(function(data) {
      console.log('successfully added a vote');
      setTimeout(function() {
        vote(users, url, pause);
      }, pause);
    })
    .catch(function(err) {
      console.log('error', err);
    });
}

function packData(data) {
  var dataArr = [];
  Object.keys(data).forEach(function(key) {
    dataArr.push([key, data[key]].join(':'));
  });
  return dataArr.join(',');
}

function callSlimer(task, args) {
  return new Promise(function(resolve, reject) {
    var childArgs = [
      path.join(__dirname, 'jobs', task + '.js'),
      args
    ];
    childProcess.execFile(slimerPath, childArgs, function(err, stdout, stderr) {
      if (err) {
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
}
