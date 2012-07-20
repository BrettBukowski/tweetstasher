// ========================================================
// Deployment tasks for TweetStasher
// ========================================================
// Prerequisites:
// - NPM
// - Forever
// - LESS
// - Require.js
// (all assumed to be installed globally under /usr/bin)
// ========================================================

var timestamp = +new Date()
  , base = '/var/tweetstasher'
  , cwd = base + '/releases/' + timestamp
  , site = 'tweetstasher';

function log(message) {
  console.log('\n' + message + '\n');
}

desc('Checkout');
task('fresh-clone', [], function() {
  var source = 'https://github.com/BrettBukowski/tweetstasher.git'
    , exec = require('child_process').exec
    , command = 'git clone ' + source + ' ' + timestamp;

  log('Cloning from ' + source + ' into ' + base + '/releases/' + timestamp);
  log(command);

  exec(command, { cwd: base + '/releases' }, function(err, stdout, stderr) {
    if (err) {
      log(err.message);
      throw err;
    }

    log('Cloned successfully');
    complete();
  });
});

desc('Install npm modules');
task('npm-depends', ['fresh-clone'], function() {
  var spawn = require('child_process').spawn
    , exec = require('child_process').exec
    , npm = spawn('sudo', ['npm', 'cache', 'clean'], { cwd: cwd });
  
  npm.stdout.on('data', function(data) {
    process.stdout.write(data);
  });
  npm.stderr.on('data', function(data) {
    process.stdout.write(data);
  });
  npm.on('exit', function(code) {
    if (code === 0) {
      log('Cache cleaned');
    }
    else {
      throw Error('npm exited with code ' + code);
    }

    log('npm install');
    exec('/usr/bin/npm install --production', { cwd: cwd }, function(err, stdout, stderr) {
      if (err) {
        log(err.message);
        throw err;
      }
      
      log('Dependencies installed');
      complete();
    });
  });

/*
  npm = spawn('sudo', ['npm', 'install', '--production'], { cwd: cwd });
  
  npm.stdout.on('data', function(data) {
    process.stdout.write('   ' + data);
  });
  npm.stderr.on('data', function(data) {
    process.stdout.write('   ' + data);
  });
  npm.on('exit', function(code) {
    if (code === 0) {
      log('Dependencies installed');
      complete();
    }
    else {
      throw Error('npm exited with code ' + code);
    }
  });
*/
});


desc('CSS compilation');
task('compile-less', ['fresh-clone', 'npm-depends'], function() {
  var exec = require('child_process').exec
    , command = '/usr/bin/lessc -x style.less > style.css';
    
  log(command);
  
  exec(command, { cwd: cwd + '/public/stylesheets' }, function(err, stdout, stderr) {
    if (err) {
      log(err.message);
      throw err;
    }
    
    log('Compiled LESS files');
    complete();
  });
});

desc('JS compilation');
task('compile-js', ['fresh-clone', 'npm-depends'], function() {
  var exec = require('child_process').exec
    , command = '/usr/bin/r.js -o build.js';
    
  log(command);
  
  exec(command, { cwd: cwd + '/public/javascripts' }, function(err, stdout, stderr) {
    if (err) {
      log(err.message);
      throw err;
    }
    
    log('Compiled JS files');
    complete();
  });
});

desc('Create symlinks');
task('symlink-config-dir', ['fresh-clone'], function() {
  var exec = require('child_process').exec
    , command = 'ln -s ' + base + '/shared/config';
  
  log(command);
  
  exec(command, { cwd: cwd }, function(err, stdout, stderr) {
    if (err) {
      log(err.message);
      throw err;
    }

    log('Symlinked config dir');
    complete();
  });
});

desc('Create live site symlink');
task('live-site-symlink', ['fresh-clone', 'npm-depends', 'compile-less', 'compile-js', 'symlink-config-dir'], function() {
  var exec = require('child_process').exec
    , commands = [
        'rm current'
      , 'ln -s releases/' + timestamp + ' current'
      ]
    , command = commands.join(' && ');
      
  log(command);
  
  exec(command, { cwd: base }, function(err, stdout, stderr) {
    if (err) {
      log(err.message);
      throw err;
    }

    log('Symlinked current');
    complete();
  });
});

desc('Go live');
task('restart-server', ['fresh-clone', 'npm-depends', 'symlink-config-dir', 'compile-less', 'compile-js', 'live-site-symlink'], function() {
  var exec = require('child_process').exec
    , logs = base + '/shared/logs'
    , commands = [
        '/usr/bin/forever stop app.js'
      , 'NODE_ENV=production'
      , '/usr/bin/forever start -l ' + logs + '/forever.log -o ' + logs + '/production.log -e' + logs + '/error.log -a app.js'
    ]
    , command = commands.join(' && ');
  
  log(command);
  
  exec(command, { cwd : cwd }, function(err, stdout, stderr) {
    if (err) {
      log(err.message);
      throw err;
    }
    
    log('The site has been deployed');
    complete();
  });
});
/*
desc('Clean up old deployments');
task();
*/

desc('Deploy');
task('deploy', function() {
  jake.Task['fresh-clone'].invoke();
  jake.Task['npm-depends'].invoke();
  jake.Task['compile-less'].invoke();
  jake.Task['compile-js'].invoke();
  jake.Task['symlink-config-dir'].invoke();
  jake.Task['live-site-symlink'].invoke();
  jake.Task['restart-server'].invoke();
});
