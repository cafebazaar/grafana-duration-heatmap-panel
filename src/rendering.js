import heatmap from './heatmap';

function makeid(prefix)
{
    var text = prefix;
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export default function link(scope, elem, attrs, ctrl) {
  var data, panel;
  elem = elem.find('.heatmap-panel');

  ctrl.events.on('render', function() {
    render();
    ctrl.renderingCompleted();
  });

  function setElementHeight() {
    try {
      var height = ctrl.height || panel.height || ctrl.row.height;
      if (_.isString(height)) {
        height = parseInt(height.replace('px', ''), 10);
      }

      height -= 5; // padding
      height -= panel.title ? 24 : 9; // subtract panel title bar

      elem.css('height', height + 'px');

      return true;
    } catch(e) { // IE throws errors sometimes
      return false;
    }
  }

  function addHeatMap() {

    // clear old data
    var svg_id = makeid("heatmap_svg_")
    var plotCanvas = $("<svg id='" + svg_id + "'></svg>");
    elem.html(plotCanvas);

    var elem_size = {width: elem.width(), height: elem.height()};
    var date_domain = {min: data.min_date, max: data.max_date};
    var bin_domain = {min: 0, max: data.all_buckets.length};
    var frq_domain = {min:ctrl.min_frq, max: ctrl.max_frq};

    heatmap(data.series_array, ctrl.num_of_slices, elem, svg_id, elem_size, date_domain, bin_domain, frq_domain, data.all_buckets, ctrl.number_of_legend);
  }

  function render() {
    if (ctrl.data.series_array.length == 0) {
      //clear the svg in case of empty array
      var plotCanvas = $("<svg></svg>");
      elem.html(plotCanvas);
      return;
    }

    data = ctrl.data;
    panel = ctrl.panel;

    if (setElementHeight()) {
      addHeatMap();
    }
  }
}
