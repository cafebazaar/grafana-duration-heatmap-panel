import {MetricsPanelCtrl} from 'app/plugins/sdk';
import TimeSeries from 'app/core/time_series';

import rendering from './rendering';

export class DurationHeatMapCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);

    // These are panel's configurations, in future versions these will be controllable.
    this.num_of_slices = 140;

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
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

    return series.map(function(s) {
      let bucketed_datapoints = s.datapoints.map(val => [val[0], (Math.floor((val[1]-min_unixtime)/slice_length)*slice_length)+min_unixtime]);


      let ready_to_reduce_bucketed_datapoints = [{}].concat(bucketed_datapoints);

      let datum = ready_to_reduce_bucketed_datapoints.reduce((reduced, element) => {
        let key = element[1];
        let value = element[0];

        if(key in reduced) {
          reduced[key] += value;
        }
        else {
          reduced[key] = value;
        }

        return reduced;
      });

      return {
        bucket: s.bucket,
        alias: s.alias,
        data: datum
      };
    });
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
    series.min = datapoints[0][1];
    series.max = datapoints[datapoints.length - 1][1];

    return series;
  }

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }  
}

DurationHeatMapCtrl.templateUrl = 'module.html';