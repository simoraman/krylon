(function(){
  function draw(context, shape){
    context.fillRect(shape.get('x'), shape.get('y'), shape.get('w'), shape.get('h'));
  }

  function init(){
    var canvas = document.getElementById('board');
    var ctx = canvas.getContext('2d');
    var shp = Immutable.Map({x:1, y:1, w:200, h:260});
    draw(ctx,shp);
  }

  init();
})();
