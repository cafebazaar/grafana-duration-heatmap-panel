## Duration HeatMap Panel Plugin for Grafana and StatsD

**Caution: This plugin is still unstable.**

This plugin draws heatmap of duration timers for StatsD datasource.

It highly depends on statsD way of storing histograms. (bin_# naming convention)

It's betta version and have some minor bugs, but in general it works fine. You're welcome to fix bugs and send pull requests.

In order to set statsD to save histogram data you should read exampleConfig.js file of your statsD and do the things listed under `histogram` part.

Some portion of this plugin's code (including this README.md file) are based on [this](https://github.com/grafana/piechart-panel.git) open source grafana plugin.

## Instalation
Use the new grafana-cli tool to install piechart-panel from the commandline:

```
grafana-cli plugins install cafebazaar-duration-heatmap-panel
```

The plugin will be installed into your grafana plugins directory; the default is /var/lib/grafana/plugins if you installed the grafana package.

More instructions on the cli tool can be found [here](http://docs.grafana.org/v3.0/plugins/installation/).

You need the lastest grafana build for Grafana 3.0 to enable plugin support. You can get it here : http://grafana.org/download/builds.html

## Alternative installation method

It is also possible to clone this repo directly into your plugins directory.

Afterwards restart grafana-server and the plugin should be automatically detected and used.

```
git clone https://github.com/cafebazaar/duration-heatmap-panel.git
sudo service grafana-server restart
```

## Clone into a directory of your choice

If the plugin is cloned to a directory that is not the default plugins directory then you need to edit your grafana.ini config file (Default location is at /etc/grafana/grafana.ini) and add this:

```ini
[plugin.piechart]
path = /home/your/clone/dir/piechart-panel
```

Note that if you clone it into the grafana plugins directory you do not need to add the above config option. That is only
if you want to place the plugin in a directory outside the standard plugins directory. Be aware that grafana-server
needs read access to the directory.
