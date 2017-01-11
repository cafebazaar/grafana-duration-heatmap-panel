import {MetricsPanelCtrl} from 'app/plugins/sdk';
import TimeSeries from 'app/core/time_series';

import rendering from './rendering';

export class DurationHeatMapCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);

    // These are panel's configurations, in future versions these will be controllable.
    this.num_of_slices = 140;
    this.number_of_legend = 10 ;
    this.min_frq = 0;
    this.max_frq = 3000;
    this.POSITIVE_INFINITY = 100000000;

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }


  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/cafebazaar-duration-heatmap-panel/editor.html', 2);
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  onRender() {
    this.data = this.parseSeries(this.series);
  }

  onDataReceived(dataList) {
    this.series = dataList.map(this.seriesHandler.bind(this));
    this.data = this.parseSeries(this.series);

    this.render(this.data);
  }

  parseSeries(series) {
    let min_unixtime = Math.min.apply(Math, series.map(s => s.min));
    let max_unixtime = Math.min.apply(Math, series.map(s => s.max));
    let slice_length = (max_unixtime-min_unixtime) / this.num_of_slices;

    var all_buckets = [];

    var series_data = series.map(function(s) {
      let bucketed_datapoints = s.datapoints.map(val => [val[0], (Math.floor((val[1]-min_unixtime)/slice_length)*slice_length)+min_unixtime]);


      let ready_to_reduce_bucketed_datapoints = [{}].concat(bucketed_datapoints);

      let datum = ready_to_reduce_bucketed_datapoints.reduce((reduced, element) => {
        let key = element[1];
        let value = element[0];

        if(key in reduced) {
          reduced[key]["value"] += value;
          reduced[key]["count"] += 1;
        }
        else {
          reduced[key] = {value: value, count: 1};
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
    all_buckets.sort((a, b) => parseInt(a)-parseInt(b));

    // Flatning the structure, we want an array of (date_time_obj, bucket_index, value)
    var series_array = [];
    series_data.map(function(bucket_obj) {
      let bucket_index = all_buckets.indexOf(bucket_obj.bucket);

      for(var key in bucket_obj.data) {
        series_array.push({bin: bucket_index, date: new Date(parseFloat(key)), value: bucket_obj.data[key]["value"]/bucket_obj.data[key]["count"]});
      }
    });

    var data = {};
    data.series_data = series_data;
    data.min_date = new Date(min_unixtime);
    data.max_date = new Date(max_unixtime);
    data.all_buckets = all_buckets;
    data.series_array = series_array;

    return data
  }

  seriesHandler(seriesData) {
    let datapoints = seriesData.datapoints;

    // This part is specific to statsD way of naming metrics (using '.' as seperator)
    // More importantly it specificly use statsD notation of naming values of a histogram (bin_<upper limit>).
    let target_parts = seriesData.target.split(".");
    let alias = target_parts[target_parts.length - 1].split("_")[1];

    var series = new TimeSeries({
      datapoints: datapoints,
      alias: alias
    });

    series.bucket = parseInt(alias);
    // NaN (which is a result of converting "Inf" to int) will break sorting process, wo we'll replace it with a huge number.
    // We can't use Number.POSITIVE_INFINITY because it will break sorting process too!
    if(isNaN(series.bucket)) {
      series.bucket = this.POSITIVE_INFINITY;
    }

    series.min = datapoints[0][1];
    series.max = datapoints[datapoints.length - 1][1];

    return series;
  }

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }  
}

DurationHeatMapCtrl.templateUrl = 'module.html';