
// var $ = require('jquery');
var dragula = require('dragula');
'use strict';

(function(){
  var BoardView = function(pool, kind, main) {
    this.pool = (typeof pool === 'string') ? document.querySelector('#'+pool) : pool;
    this.kind = (typeof kind === 'string') ? document.querySelector('#'+kind) : kind;
    this.main = (typeof main === 'string') ? document.querySelector('#'+main) : main;
    this.date_item_width = 60; // px
    this.viewport_cols = 19; // viewport column size
    this.today_offset_left = 5;

    this.createPool();
    this.populateVerticalAxis();
    this.generateTimeData();
    this.createBackground();
    this.createDates();
    this.initContent();
    this.bindDatesMovingListeners();
    this.initState();
  };

  BoardView.prototype.initContent = function() {
    var html = [];
    this.main.innerHTML += '<div id="board-view-content" class="board-view-content container">' + 
      html.join('') + '</div>';
    var content = document.querySelector('#board-view-content');
    html = [];
    // html.push('<div class="row" style="width: ' + this.getBoardWith() +
    //   'px;"><div class="work"><span>work1</span></div></div>')
    // html.push('<div class="row"><div class="work-preview"><span>work1</span></div></div>')
    html.push('<div class="row"><div class="work-preview"></div></div>')
    content.innerHTML += html.join('');
      // var content = document.querySelector('#pool1');
    dragula([document.querySelector('#pool'), content])
    .on('over', function(el, container) {
      console.log(container);
    });
    // content.addEventListener("dragenter", function(e) {
    //   e.preventDefault();
    //   console.log("ondragenter");
    // });
    // content.addEventListener("dragover", function(e) {
    //   e.preventDefault();
    //   console.log("ondragover");
    //   content.innerHTML = '<div class="drag-preview"></div>';
    // });
    // content.addEventListener("dragleave", function(e) {
    //   e.preventDefault();
    //   console.log("dragleave");
    //   content.innerHTML = '';
    // });
  };

  BoardView.prototype.createPool = function() {
    var works = [];
    works.push(new Work("X", 5))
    works.push(new Work("Y", 10))
    works.push(new Work("Z", 15))
    var html = [];
    works.map(function(w) {
      // html.push('<div class="work"><span class="noselect">' + w.name + '</div>');
      html.push('<div class="work">' + w.name + '</div>');
    })
    this.pool.innerHTML += html.join('');

  };

  var Work = function(name, amount) {
    this.name = name;
    this.amount = amount;
  };

  BoardView.prototype.initState = function() {
    var offset = 0;
    for (var i = 0; i < this.timeData.length; i++) {
      var v = this.timeData[i];
      if (v.isThisMonth()) {
        offset += v.today() - 1;
        break;
      }
      offset += v.getDaysInMonth();
    }
    this.scrollToPosition((offset - this.today_offset_left) * this.date_item_width * -1);
  };

  function getTranslate(item) {
    var transArr = [];
    if (!window.getComputedStyle) return;
    var style = getComputedStyle(item),
      transform = style.transform || style.webkitTransform || style.mozTransform || style.msTransform;
    var mat = transform.match(/^matrix3d\((.+)\)$/);
    if (mat) return parseFloat(mat[1].split(', ')[13]);

    mat = transform.match(/^matrix\((.+)\)$/);
    mat ? transArr.push(parseFloat(mat[1].split(', ')[4])) : transArr.push(0);
    mat ? transArr.push(parseFloat(mat[1].split(', ')[5])) : transArr.push(0);

    return transArr;
}

  BoardView.prototype.bindDatesMovingListeners = function() {
    var date_backward = document.querySelector("div.date-backward");
    var date_forward = document.querySelector("div.date-forward");
    var thiz = this;
    date_forward.addEventListener('click', function() {
      var ts = getTranslate(thiz.main);
      thiz.scrollToPosition(ts[0] + thiz.date_item_width);
    });
    date_backward.addEventListener('click', function() {
      var ts = getTranslate(thiz.main);
      thiz.scrollToPosition(ts[0] - thiz.date_item_width);
    });
  };

  BoardView.prototype.getDateContainer = function() {
    return (this.date_container || 
      (this.date_container = document.querySelector("div.board-view-date-container")));
  }

  BoardView.prototype.getDateBackground = function() {
    return (this.date_background || 
      (this.date_background = document.querySelector("div.board-view-tl-background")));
  }

  BoardView.prototype.scrollToPosition = function(p) {
    this.main.style.transform = 'translate(' + this.clipScrollRange(p) + 'px)';
  };

  BoardView.prototype.clipScrollRange = function(r) {
    var range = this.getScrollRange();
    if (r > range[0]) {
      return range[0];
    } else if (r < range[1]) {
      return range[1];
    }
    return r;
  };

  BoardView.prototype.getScrollRange = function() {
    return [0,
      (this.viewport_cols - this.getTotalCols()) * this.date_item_width
    ];
  };

  BoardView.prototype.getTotalCols = function() {
      var datelen = 0;
      this.timeData.map(function(v){
        datelen += v.getDaysInMonth();
      });
      return datelen;
  };

  BoardView.prototype.populateVerticalAxis = function() {
    var kinds = ['A', 'B', 'C', 'D', 'E', 'F'];
    var html = [];
    kinds.map(function(k) {
      html.push('<li><span>' + k + '</span></li>');
    });
    this.kind.innerHTML += '<ul>' + html.join('') + '</ul>';
  };

  BoardView.prototype.generateTimeData = function() {
    var months = [];
    months.push(this.createMonth(2019, 4));
    months.push(this.createMonth(2019, 5));
    months.push(this.createMonth(2019, 6));
    this.timeData = months;
  }

  BoardView.prototype.getBoardWith = function() {
    return this.getTotalCols() * this.date_item_width;
  };

  BoardView.prototype.createBackground = function() {
    this.main.style.width = this.getBoardWith()  + 'px';
    var html = [];
    this.timeData.map(function(v){
      for (var d = 1; d <= v.getDaysInMonth(); d++) {
        // html.push('<li class="with-line"><span>' + d + "</span></>");
        html.push('<li class="with-line');
        if (v.isPast(d)) {
          html.push(' past');
        } 
        html.push('"></li>');
      }
    });
    this.main.innerHTML += '<div class="board-view-tl-background"><ul>' 
              + html.join('') + '</ul></div>';
  };

  BoardView.prototype.createDates = function() {
    var html = [];
    this.timeData.map(function(v){
      for (var d = 1; d <= v.getDaysInMonth(); d++) {
        html.push('<li class="date-day"><span>' + (v.month + 1) + '/' + d + "</span></>");
      }
    });
    this.main.innerHTML += '<div class="board-view-date-container"><ul>' 
              + html.join('') + '</ul></div>';
  };

  var Month = function(year, month) {
    this.year = year;
    this.month = month;
  };

  BoardView.prototype.createMonth = function(year, month) {
    return new Month(year, month - 1);
  }
  
  Month.prototype.getDaysInMonth = function() {
    return new Date(this.year, this.month + 1, 0).getDate();
  };

  Month.prototype.isThisMonth = function() {
    var today = new Date();
    var thisyear = today.getFullYear();
    var thismonth = today.getMonth();
    return thisyear == this.year && thismonth == this.month;
  };

  Month.prototype.today = function() {
    return new Date().getDate();
  };

  Month.prototype.isPast = function(d) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var t = new Date(this.year, this.month, d);
    return t.getTime() < today.getTime();
  }

  Month.prototype.isWeekFirstDay = function(d) {
    var date = new Date(this.year, this.month, d);
    return date.getDay() == 1;
  };

  window.BoardView = BoardView;
})();

new BoardView('pool', 'board-view-kind', 'board-view-timeline');
