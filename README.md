lxc-cpu-usage
=============

## Installation

``` bash
$ [sudo] npm install lxc-cpu-usage -g
```

## Usage

```
$ lxc-cpu-usage --help

Usage: lxc-cpu-usage [options]

Options:

-h, --help         output usage information
-V, --version      output the version number
-n, --name [name]  CPU usage for target container.
-v, --verbose      Verbose mode.
```


## Example

If you have a container called manage001, CPU usage acquirable by the following commands.

```
$ lxc-cpu-usage -n manage001 -v

lxc-cpu-usage - Target LXC:manage001, Target PID:9844
------------------
PID     %CPU
9967     0.00
10002    0.01
10095    0.00
9986     0.00
9993     0.00
10100    0.00
10123    0.00
10102    0.00
10323    0.00
10127    0.00
10301    0.00
21265    0.05
21669    0.03
23340    0.06
23349    0.00
23495    0.00
------------------
Processes: 16, CPU usage: 0.16
```

Output of this command can be checked by pstree. 

```
$ pstree -p 9844
init(9844)─┬─cron(23349)
           ├─dhclient(10301)
           ├─getty(10095)
           ├─getty(10100)
           ├─getty(10102)
           ├─getty(10123)
           ├─getty(10127)
           ├─mackerel-agent(23340)─┬─{mackerel-agent}(23341)
           │                       ├─{mackerel-agent}(23342)
           │                       ├─{mackerel-agent}(23343)
           │                       ├─{mackerel-agent}(23344)
           │                       ├─{mackerel-agent}(23351)
           │                       ├─{mackerel-agent}(23355)
           │                       └─{mackerel-agent}(27766)
           ├─redis-server(21265)─┬─{redis-server}(21266)
           │                     └─{redis-server}(21267)
           ├─rsyslogd(10002)─┬─{rsyslogd}(10003)
           │                 ├─{rsyslogd}(10004)
           │                 └─{rsyslogd}(10005)
           ├─sshd(10323)
           ├─supervisord(21669)─┬─node(7234)─┬─{node}(7246)
           │                    │            ├─{node}(7247)
           │                    │            ├─{node}(7248)
           │                    │            ├─{node}(7249)
           │                    │            └─{node}(7250)
           │                    └─node(23495)─┬─{node}(23496)
           │                                  ├─{node}(23603)
           │                                  ├─{node}(23604)
           │                                  ├─{node}(23605)
           │                                  └─{node}(23606)
           ├─udevd(9986)
           ├─upstart-socket-(9993)
           └─upstart-udev-br(9967)
```

