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

var showUsage = function (containerName, metric, verbose) {
  var cpuUsageValue = 0.0;

  step(
    function() {
      var lxcPs = "lxc-ps --name=" + containerName;
      var child = exec(lxcPs, this);
    },
    function(err, stdout, stderr) {
      var containerInitPid = parseLxcPs(stdout);

      if (typeof containerInitPid === 'undefined') {
        console.log(sprintf("lxc-cpu-usage - Target LXC:%s not found.", containerName));
      } else {
        if (!metric) {
          console.log(sprintf("lxc-cpu-usage - Target LXC:%s, Target PID:%s", containerName, containerInitPid));
        }
        psTree(containerInitPid, this);
      }
    },
    function(err, children) {
      var displayUsage = _.after(children.length, function(){
        if (metric) {
          console.log(sprintf("%s\t%.2f\t%d", containerName, cpuUsageValue, (new Date).getTime()));
        } else {
          console.log("------------------");
          console.log(sprintf("Processes: %d, CPU usage:%5.2f", children.length, cpuUsageValue));
        }
      });

      if (verbose) {
        console.log("------------------");
        console.log("PID\t%CPU");
      }

      _.each(children, function(target) {
        var pid = target.PID;

        usage.lookup(pid, function(err, result) {
          if (!err) {
            var oneUsageCpu = parseFloat(result.cpu);

            if (verbose) {
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

core.cpuUsage = function (program) {
  var containers = program.name.split("|");

  for(var i=0; i<containers.length; i++) {
    showUsage(containers[i], program.metric, program.verbose);
  }
}

module.exports = core;

