(function(){
  function init(){
    var board = $('html');
    initAllCards(board);
    initAddButton(board);
    initSaveButton(board);
    initAllSeparators(board);
  }

  function initSaveButton(board){
    var btn = board.find('#save');
    btn.click(function(){
      saveCards();
    });
  }

  function saveCards(){
    function extractCardData(_, cardElement){
      var data = {};
      var card = $(cardElement);
      return {
        position: card.position(),
        content: $(card.find('.content')).text()
      };
    }
    var cards = $('.card');
    var cardData = R.map(extractCardData, cards);
    localStorage['cards'] = JSON.stringify(cardData.toArray());
  };
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
    var posX = parseInt(card.css('left'));
    var posY = parseInt(card.css('top'));
    var blockPosition = draggingDeltas.scan({x: posX, y: posY}, add);

    blockPosition.onValue(function(pos) {
      card.css({
        top  : pos.y + "px",
        left : pos.x + "px"
      });
    });
  }
  function initAddButton(board){
    $('#add-card').click(function(){
      createCard(board, 'text here');
      initAllCards(board);
    });
  }
  function initAllCards(board){
    var cardData = JSON.parse(localStorage['cards']);
    R.forEach(function(data){ createCard(board, data); }, cardData);
    var cards = $('.card');
    var initCards = R.curry(initElement)(board);
    R.forEach(initCards, cards);
  }
  function initAllSeparators(board){
    var separators = $('.separator');
    var initCards = R.curry(initElement)(board);
    R.forEach(initCards, separators);
  }
  function createCard(context, data) {
    context.append('<div class="card" style="top:' + data.position.top + 'px; left:' + data.position.left + 'px"><div class="content">' + data.content + '</div></div>');
  }

  init();
})();
