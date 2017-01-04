import {MetricsPanelCtrl} from 'app/plugins/sdk';
import rendering from './rendering';

export class DurationHeatMapCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
  }

  onDataError() {
    this.render();
  }

  onRender() {
  }

  onDataReceived(dataList) {
    this.render();
  }

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }  
}

DurationHeatMapCtrl.templateUrl = 'module.html';