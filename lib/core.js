'use strict';

var usage = require('usage'),
    psTree = require('ps-tree'),
    step = require('step'),
    _ = require('underscore');

var core = {};

core.cpuUsage = function (program) {
  var containerName = program.name;
  var cpuUsageValue = 0;

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
            console.log(pid);
            console.log(result);
            cpuUsageValue += result.cpu;
            displayUsage();
          }
        });

      });
    }
  );
};

module.exports = core;

