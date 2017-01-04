export default function link(scope, elem, attrs, ctrl) {
  elem = elem.find('.heatmap-panel');

  ctrl.events.on('render', function() {
    render();
    ctrl.renderingCompleted();
  });


  function addHeatMap() {
    var plotCanvas = $('<div></div>');
    elem.html(plotCanvas);
  }

  function render() {
    addHeatMap();
  }
}