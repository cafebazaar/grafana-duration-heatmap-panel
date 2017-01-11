'use strict';

System.register(['app/plugins/sdk', 'app/core/time_series', 'lodash', './rendering'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, TimeSeries, _, rendering, _createClass, DurationHeatMapCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_rendering) {
      rendering = _rendering.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('DurationHeatMapCtrl', DurationHeatMapCtrl = function (_MetricsPanelCtrl) {
        _inherits(DurationHeatMapCtrl, _MetricsPanelCtrl);

        function DurationHeatMapCtrl($scope, $injector) {
          _classCallCheck(this, DurationHeatMapCtrl);

          var _this = _possibleConstructorReturn(this, (DurationHeatMapCtrl.__proto__ || Object.getPrototypeOf(DurationHeatMapCtrl)).call(this, $scope, $injector));

          // Panel Initial configurations
          var panelDefaults = {
            num_of_slices: 140,
            number_of_legend: 10,
            min_frq: 0,
            max_frq: 3000,
            POSITIVE_INFINITY: 100000000,
            max_bin: 1000,
            min_bin: 0
          };

          _this.intPanelConfigs = ["num_of_slices", "number_of_legend", "min_frq", "max_frq", "POSITIVE_INFINITY", "max_bin", "min_bin"];

          _.defaults(_this.panel, panelDefaults);

          _this.parseConfigs();

          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          return _this;
        }

        _createClass(DurationHeatMapCtrl, [{
          key: 'parseConfigs',
          value: function parseConfigs() {
            for (var index in this.intPanelConfigs) {
              var key = this.intPanelConfigs[index];
              this.panel[key] = parseInt(this.panel[key]);
            }
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/cafebazaar-duration-heatmap-panel/editor.html', 2);
          }
        }, {
          key: 'onDataError',
          value: function onDataError() {
            this.series = [];
            this.render();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            this.parseConfigs();
            this.data = this.parseSeries(this.series);
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            this.series = dataList.map(this.seriesHandler.bind(this));
            this.series = this.series.filter(function (d) {
              return d != null;
            });
            this.data = this.parseSeries(this.series);

            this.render(this.data);
          }
        }, {
          key: 'parseSeries',
          value: function parseSeries(series) {
            var min_unixtime = Math.min.apply(Math, series.map(function (s) {
              return s.min;
            }));
            var max_unixtime = Math.min.apply(Math, series.map(function (s) {
              return s.max;
            }));
            var slice_length = (max_unixtime - min_unixtime) / this.panel.num_of_slices;

            var all_buckets = [];

            var series_data = series.map(function (s) {
              var bucketed_datapoints = s.datapoints.map(function (val) {
                return [val[0], Math.floor((val[1] - min_unixtime) / slice_length) * slice_length + min_unixtime];
              });

              var ready_to_reduce_bucketed_datapoints = [{}].concat(bucketed_datapoints);

              var datum = ready_to_reduce_bucketed_datapoints.reduce(function (reduced, element) {
                var key = element[1];
                var value = element[0];

                if (key in reduced) {
                  reduced[key]["value"] += value;
                  reduced[key]["count"] += 1;
                } else {
                  reduced[key] = { value: value, count: 1 };
                }

                return reduced;
              });

              all_buckets.push(parseInt(s.bucket));

              return {
                bucket: s.bucket,
                alias: s.alias,
                data: datum
              };
            });

            // Sorting all_buckets so we can use it to index our buckets
            all_buckets.sort(function (a, b) {
              return parseInt(a) - parseInt(b);
            });

            // Flatning the structure, we want an array of (date_time_obj, bucket_index, value)
            var series_array = [];
            series_data.map(function (bucket_obj) {
              var bucket_index = all_buckets.indexOf(bucket_obj.bucket);

              for (var key in bucket_obj.data) {
                series_array.push({ bin: bucket_index, date: new Date(parseFloat(key)), value: bucket_obj.data[key]["value"] / bucket_obj.data[key]["count"] });
              }
            });

            var data = {};
            data.series_data = series_data;
            data.min_date = new Date(min_unixtime);
            data.max_date = new Date(max_unixtime);
            data.all_buckets = all_buckets;
            data.series_array = series_array;

            return data;
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var datapoints = seriesData.datapoints;

            // This part is specific to statsD way of naming metrics (using '.' as seperator)
            // More importantly it specificly use statsD notation of naming values of a histogram (bin_<upper limit>).
            var target_parts = seriesData.target.split(".");
            var alias = target_parts[target_parts.length - 1].split("_")[1];

            var series = new TimeSeries({
              datapoints: datapoints,
              alias: alias
            });

            series.bucket = parseInt(alias);
            // NaN (which is a result of converting "Inf" to int) will break sorting process, wo we'll replace it with a huge number.
            // We can't use Number.POSITIVE_INFINITY because it will break sorting process too!
            if (isNaN(series.bucket)) {
              series.bucket = this.panel.POSITIVE_INFINITY;
            }

            series.min = datapoints[0][1];
            series.max = datapoints[datapoints.length - 1][1];

            // Do not inculde bins larger than max bin and smaller than min bin
            if (series.bucket <= this.panel.max_bin && series.bucket >= this.panel.min_bin) {
              return series;
            } else {
              return null;
            }
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            rendering(scope, elem, attrs, ctrl);
          }
        }]);

        return DurationHeatMapCtrl;
      }(MetricsPanelCtrl));

      _export('DurationHeatMapCtrl', DurationHeatMapCtrl);

      DurationHeatMapCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=duration_heatmap_ctrl.js.map
