(function(){
  function init(){
    var board = $('html');
    initAllCards(board);
    initAddButton(board);
    initSaveButton(board);
    initAllSeparators(board);
  }

  function initSaveButton(board){
    var btn = board.find('save-button');
    btn.click(function(){

    });
  }

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

  function initElement(board, e){
    var card = $(e);
    var startDrag = card.asEventStream('mousedown');
    var endDrag = card.asEventStream('mouseup');

    card.click(function(){
      card.find('.content').prop('contenteditable', function(_, val){
        return val === 'true' ? 'false' : 'true';
      });
    });

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
  function initAddButton(board){
    $('#add-card').click(function(){
      board.append('<div class="card"><div class="content">text here</div></div>');
      initAllCards(board);
    });
  }
  function initAllCards(board){
    var cards = $('.card');
    var initCards = R.curry(initElement)(board);
    R.forEach(initCards, cards);
  }
  function initAllSeparators(board){
    var cards = $('.separator');
    var initCards = R.curry(initElement)(board);
    R.forEach(initCards, cards);
  }


  init();
})();
