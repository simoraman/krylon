(function(){

  function xyFromEvent(v){
    return {x: v.clientX, y: v.clientY};
  }

  function getDelta(t){
    var a = t[1];
    var b = t[0];
    return {x: a.x-b.x, y: a.y-b.y};
  }

  function add(p1, p2) {
    return {x: p1.x + p2.x, y: p1.y + p2.y};
  }

  function initCardEvents(board, c){
    var card = $(c);
    var startDrag = card.asEventStream('mousedown');
    var endDrag = card.asEventStream('mouseup');

    var draggingDeltas = startDrag.flatMap(function() {
      return board.asEventStream('mousemove')
        .map(xyFromEvent)
        .slidingWindow(2,2)
        .map(getDelta)
        .takeUntil(endDrag);
    });

    var blockPosition = draggingDeltas.scan({x: 0, y: 0}, add);

    blockPosition.onValue(function(pos) {
      card.css({
        top  : pos.y + "px",
        left : pos.x + "px"
      });
    });
  }
  function init(){
    var board = $('html');
    var cards = $('.card');
    var initCards = R.curry(initCardEvents)(board);
    R.forEach(initCards, cards);
  }

  init();
})();
