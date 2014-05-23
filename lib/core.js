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

  console.log("Target LXC: " + program.name);

  step(
    function() {
      var lxcPs = "lxc-ps --name=" + program.name;
      var child = exec(lxcPs, this);
    },
    function(err, stdout, stderr) {
      var containerInitPid = parseLxcPs(stdout);
      console.log("INIT:" + containerInitPid);
      psTree(containerInitPid, this);
    },
    function(err, children) {

      var displayUsage = _.after(children.length, function(){
        console.log("Processes:" + children.length);
        console.log(sprintf("CPU usage:%5.2f", cpuUsageValue));
      });

      _.each(children, function(target) {
        var pid = target.PID;

        usage.lookup(pid, function(err, result) {
          if (!err) {
            var oneUsageCpu = parseFloat(result.cpu);

            if (program.verbose) {
              console.log(sprintf("PID:%s\tCPU:%5.2f", pid, oneUsageCpu));
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

