'use strict';

var usage = require('usage'),
    psTree = require('ps-tree'),
    step = require('step'),
    exec = require('child_process').exec,
    _ = require('underscore'),
    lxc = require('lxc'),
    sprintf = require('sprintf').sprintf;

var core = {};

var parseLxcPs = function(stdout) {
  var processes = stdout.split(/\n/);
  var params = [];

  for (var i=0; i<processes.length; i++) {
    params = processes[i].split(/\s+/);      // CONTAINER PID TTY TIME CMD

    if (params[4] == "init") {
      return params[1];
    }
  };
};

core.cpuUsage = function (program) {
  var containerName = program.name;
  var cpuUsageValue = 0.0;

  step(
    function() {
      var lxcPs = "lxc-ps --name=" + program.name;
      var child = exec(lxcPs, this);
    },
    function(err, stdout, stderr) {
      var containerInitPid = parseLxcPs(stdout);
      var containerInitPid = 56343;

      console.log(sprintf("lxc-cpu-usage - Target LXC:%s, Target PID:%s", program.name, containerInitPid));
      psTree(containerInitPid, this);
    },
    function(err, children) {

      var displayUsage = _.after(children.length, function(){
        console.log("------------------");
        console.log(sprintf("Processes: %d, CPU usage:%5.2f", children.length, cpuUsageValue));
      });

      if (program.verbose) {
        console.log("------------------");
        console.log("PID\t%CPU");
      }

      _.each(children, function(target) {
        var pid = target.PID;

        usage.lookup(pid, function(err, result) {
          if (!err) {
            var oneUsageCpu = parseFloat(result.cpu);

            if (program.verbose) {
              console.log(sprintf("%s\t%5.2f", pid, oneUsageCpu));
            }

            cpuUsageValue += oneUsageCpu;
            displayUsage();
          }
        });
      });
    }
  );
};

module.exports = core;

