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
      save();
    });
  }

  function save(){
    function extractCardData(_, cardElement){
      var card = $(cardElement);
      return {
        position: card.position(),
        content: $(card.find('.content')).text()
      };
    }
    var cards = $('.card');
    var cardData = R.map(extractCardData, cards);
    localStorage['cards'] = JSON.stringify(cardData.toArray());

    var separators = $('.separator');
    localStorage['separators'] = JSON.stringify(R.map(extractSeparatorData, separators).toArray());
    function extractSeparatorData(_, sepElement){
      return { position: $(sepElement).position() };
    }

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
      var content = card.find('.content');
      var edit = card.find('.text');
      toggleDisplay(content);
      toggleDisplay(edit);
      function toggleDisplay(element){
        if(element.css('display') === 'none'){
          element.css('display', 'inline');
        } else {
          element.css('display', 'none');
        }
      }
    });
    var updateContent = function(event)
                {
                  var target = $(event.target);
                  target.parent().find('.content').text(target.val());
                };
    card.find('.text')
      .asEventStream('keyup')
      .onValue(updateContent);

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
    var data = JSON.parse(localStorage['separators']);
    R.forEach(function(data){ renderSeparator(board, data); }, data);
    var separators = $('.separator');
    R.forEach(R.curry(initElement)(board), separators);
    function renderSeparator(context, data){
      context.append('<div class="separator" style="top:' + data.position.top + 'px; left:' + data.position.left + 'px"></div>');
    };
  }
  function createCard(context, data) {
    context.append('<div class="card" style="top:' + data.position.top + 'px; left:' + data.position.left + 'px"><div class="content">' + data.content + '</div><textarea class="text" style="display:none">' + data.content + '</textarea></div>');
  }

  init();
})();
