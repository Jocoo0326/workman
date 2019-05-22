
// var $ = require('jquery');

(function(){
  'use strict';

  var BoardView = function(container) {
    this.container = (typeof container === 'string') ? document.querySelector('#'+container) : container;

    this.createDates();
  }

  BoardView.prototype.createDates = function() {
    var html = [];
    var months = [];
    months.push(new Month(2019, 4));
    months.push(new Month(2019, 5));
    months.push(new Month(2019, 6));
    months.map(function(v){
      for (var d = 1; d <= v; d++) {
        html.push("<li>" + d + "</>");
      }
    })
    this.container.innerHTML = html.join('');
  }

  var Month = function(year, month) {
    this.year = year;
    this.month = month;
    this.days = getDaysInMonth(month, year);
  }
  
  Month.prototype.getDaysInMonth = function(month, year) {
    return new Date(year, month, 0).getDate();
  }

  window.BoardView = BoardView;
})();

BoardView('board-view-component');
