
// var $ = require('jquery');
var dragula = require('dragula');
var classes = require('dragula/classes');
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
    this.main.innerHTML += '<div id="board-view-content" class="board-view-content container noselect">' + 
      html.join('') + '</div>';
    var content = this.getContentContainer();

    var thiz = this;
    dragula([document.querySelector('#pool'), content],
      {
        moves: function (item, source, handle, nextEl) {
          if (source === thiz.getContentContainer() && isPast(item)) {
            return false;
          }
          return true;

          function isPast(el) {
            var rect = el.getBoundingClientRect();
            var contentrect = thiz.getContentContainer().getBoundingClientRect();
            return rect.x + rect.width < contentrect.x + thiz.getNowOffsetPx();
          }
        }
      })
      .drag = function (item, dropTarget, clientX, clientY, mirror) {
        var mr = mirror.getBoundingClientRect();
        var mx = getBoundRectX(mr);
        var my = getBoundRectY(mr);
        if (dropTarget === content) {
          dropTarget.insertBefore(item, null);
          var pos = calcCellOffsetsUnderPoint();
          item.style.left = pos[0] + 'px';
          item.style.top = pos[1] + 'px';
          item.style.width = calcWidth(pos[1], item) * thiz.date_item_width - 2 + 'px';
          // if (collision()) {
          //   classes.add(item, "collision");
          // } else {
          //   classes.rm(item, "collision");
          // }
          var l = pos[0];
          while (collision() && l < thiz.getTotalCols() * thiz.date_item_width) {
            l += thiz.date_item_width;
            item.style.left = l + 'px';
          }
          // classes.rm(item, "collision");
          return true;
        } else {
          item.removeAttribute("style");
          return false;
        }

        function calcCellOffsetsUnderPoint() {
          var contentRect = dropTarget.getBoundingClientRect();
          var x = Math.floor((mx - getBoundRectX(contentRect)) / thiz.date_item_width) * thiz.date_item_width;
          x = Math.min(Math.max(thiz.getNowOffsetPx(), x), thiz.getTotalCols() * thiz.date_item_width);
          var y = Math.floor((my - getBoundRectY(contentRect)) / thiz.date_item_width) * thiz.date_item_width;
          y = Math.max(0, Math.min(thiz.date_item_width * (thiz.kinds.length - 1), y));
          return [x, y];
        }

        function collision() {
          var works = content.children;
          const itemrect = item.getBoundingClientRect();
          for (let index = 0; index < works.length; index++) {
            const element = works[index];
            if (element != item) {
              if (isCollide(itemrect, element.getBoundingClientRect())) {
                return true;
              }
            }
          }
          return false;
        }

        function isCollide(a, b) {
          return !(
            ((getBoundRectY(a) + a.height) <= (getBoundRectY(b))) ||
            (getBoundRectY(a) >= (getBoundRectY(b) + b.height)) ||
            ((getBoundRectX(a) + a.width) <= getBoundRectX(b)) ||
            (getBoundRectX(a) >= (getBoundRectX(b) + b.width))
          );
        }

        function getBoundRectX(r) {
          return r.x || r.left;
        }

        function getBoundRectY(r) {
          return r.y || r.top;
        }

        function calcWidth(mac, wk) {
          var v = parseInt(wk.id) + mac/60;
          return Math.floor((v + 3.1) % 3) + 3;
        }
    };
  };

  BoardView.prototype.createPool = function() {
    var works = [];
    works.push(new Work("001", 1000))
    works.push(new Work("002", 1500))
    works.push(new Work("003", 2000))
    works.push(new Work("004", 2500))
    works.push(new Work("005", 3000))
    works.push(new Work("006", 3500))
    works.push(new Work("007", 4000))
    works.push(new Work("008", 4500))
    var html = [];
    works.map(function(w) {
      // html.push('<div class="work"><span class="noselect">' + w.name + '</div>');
      html.push('<div class="work" id="' + w.name + '">产品: ' + w.name + ' 数量: ' + w.amount + '</div>');
    })
    this.pool.innerHTML += html.join('');
  };

  var Work = function(name, amount) {
    this.name = name;
    this.amount = amount;
  };

  var Schedual = function (work, mac, beg, end) {
    this.work = work;
    this.mac = mac;
    this.beg = beg;
    this.end = end;
  }


  BoardView.prototype.initState = function() {
    this.scrollToPosition((this.getNowOffset() - this.today_offset_left) * this.date_item_width * -1);
    
    // generate some schedual past data for preview
    var pastScheduals = [];
    const M = 1000;
    var l = this.getNowOffset();
    var id = M;
    for (let i = 0; i < this.kinds.length; i++) {
      for (let j = 0; j < 10; j++) {
        var r = l - j * 10;
        var end = r - randInt(6);
        var beg = end - (randInt(3) + 3);
        if (beg < 0) continue;
        var w = new Work((id++) + '', randInt(M));
        var m = this.kinds[i];
        pastScheduals.push(new Schedual(w, m, beg, end));
      }
    }
    
    var html = [];
    pastScheduals.map((function (v) {
      html.push('<div class="work" id="' + v.work.name + '" style="left: ' +
        v.beg * this.date_item_width + 'px; top: ' + (parseInt(v.mac.id) - 1) * this.date_item_width +
        'px; width: ' + ((v.end - v.beg) * this.date_item_width - 2) + 'px;'
        + '">产品: ' + v.work.name + ' 数量: ' + v.work.amount + '</div>');
    }).bind(this));
    this.getContentContainer().innerHTML += html.join('');
  };

  function randInt(v) {
    return Math.floor(v * Math.random());
  }

  BoardView.prototype.getNowOffset = function () {
    var offset = 0;
    for (var i = 0; i < this.timeData.length; i++) {
      var v = this.timeData[i];
      if (v.isThisMonth()) {
        offset += v.today() - 1;
        break;
      }
      offset += v.getDaysInMonth();
    }
    return offset;
  }

  BoardView.prototype.getNowOffsetPx = function () {
    return this.getNowOffset() * this.date_item_width;
  }

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

  BoardView.prototype.getContentContainer = function() {
    return (this.content_container || 
      (this.content_container = document.querySelector("#board-view-content")));
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

  var Mac = function (id, name) {
    this.id = id;
    this.name = name;
  }

  BoardView.prototype.populateVerticalAxis = function() {
    var kinds = [
      new Mac(1, '1号机'),
      new Mac(2, '2号机'),
      new Mac(3, '3号机'),
      new Mac(4, '4号机'),
      new Mac(5, '5号机'),
      new Mac(6, '6号机'),
    ];
    this.kinds = kinds;
    var html = [];
    kinds.map(function(k) {
      html.push('<li><span class="noselct">' + k.name + '</span></li>');
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

  var Day = function (month, day) {
    this.month = month;
    this.day = day;
  }

  window.BoardView = BoardView;
})();

new BoardView('pool', 'board-view-kind', 'board-view-timeline');
