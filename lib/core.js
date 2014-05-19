'use strict';

var usage = require('usage'),
    psTree = require('ps-tree'),
    step = require('step'),
    _ = require('underscore');

var core = {};

core.cpuUsage = function (program) {
  var containerName = program.name;
  var cpuUsageValue = 0;

  console.log("Target container: " + program.name);

  step(
    function() {
      psTree(containerName, this);
    },
    function(err, children) {

      var displayUsage = _.after(children.length, function(){
        console.log("Processes:" + children.length);
        console.log("CPU usage:" + cpuUsageValue);
      });

      _.each(children, function(target) {
        var pid = target.PID;

        usage.lookup(pid, function(err, result) {
          if (!err) {
            if (program.verbose) {
              var oneUsage = _.template("PID:<%= pid %>\tCPU:<%= cpu%>");
              console.log(oneUsage({pid: pid, cpu: result.cpu}));
            }

            cpuUsageValue += result.cpu;
            displayUsage();
          }
        });

      });
    }
  );
};

module.exports = core;

