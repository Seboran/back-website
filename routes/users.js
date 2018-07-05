var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

/**
 * Counter that drops by one every delay seconds and destroys itself
 * @class AutoCounter
 * @param {number} delay Delay before decrementing in ms
 */
function AutoCounter(delay) {
  this.delay = delay;
  /** @type {number} */
  this.value = 1;

  /**
   * Updates the value of the AutoCounter
   * @func
   */
  this.updateValue = function() {
    var interval = setInterval(function() {
      if (this.value === 0) clearInterval(interval);
      else this.value -= 1;

    }.bind(this), this.delay);
    
  }

  /**
   * Increments the value
   * @return {this}
   */
  this.inc = function() {
    this.value += 1;
    return this;
    
  }

  this.updateValue();
}



/**
 * @class
 * @param {number} maxQueries
 * @param {number} refreshRate
 */
function Users(maxQueries, refreshRate) {

  this.maxQueries = maxQueries;
  this.refreshRate = refreshRate;
  /** @type {AutoCounter[]} */
  this.listQueries = {};
  
  /**
   * Adds one query from the following IP address
   * @param {string} ip 
   */
  this.addQuery = function(ip) {
    if (!this.listQueries[ip]) return this.listQueries[ip] = new AutoCounter(this.refreshRate);
    if (this.listQueries[ip].value >= this.maxQueries) return;
    
    this.listQueries[ip].inc();
  }

  /**
   * 
   */
  this.updateQueries = function() {
    setInterval(function() {
      
      for (var key in this.listQueries) {

        if (this.listQueries.hasOwnProperty(key)) {

          /** @type {AutoCounter} */
          var queries = this.listQueries[key];

          if (queries.value === 0) {
            delete this.listQueries[key];
          }
        }
      }

    }.bind(this), this.refreshRate)

  }

  this.updateQueries();
};

router.get('/getToken', function(req, res, next) {
  var ipAddress = req.ip;
  res.send(ipAddress);
});

module.exports = {
  router,
  AutoCounter,
  Users
}
