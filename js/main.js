(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

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

},{}]},{},[1]);
