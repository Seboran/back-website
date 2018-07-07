var express = require('express');
var nodemailer = require('nodemailer');
var cors = require('cors');
var mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

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
   * @return {boolean} has the value been incremented ?
   */
  this.addQuery = function(ip) {
    if (!this.listQueries[ip]) {
      this.listQueries[ip] = new AutoCounter(this.refreshRate);
      return true;
    } 
    if (this.listQueries[ip].value >= this.maxQueries) return false;

    this.listQueries[ip].inc();
    return true;
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


  /**
   * @callback Users~callbackEmail
   * @param {?Object} err
   */

  /**
   * 
   * @param {string} ip author IP
   * @param {string} author author email address
   * @param {string} subject 
   * @param {string} message 
   * @param {Users~callbackEmail} next
   */
  this.sendEmail = function(ip, author, subject, message, next) {

    var canSendEmail = this.addQuery(ip);

    if (!canSendEmail) return next(Error('Too many inquiries'));

    var mailOptions = {
      from: author,
      to: process.env.EMAIL,
      subject: subject,
      text: message,
    }

    mailgun.messages().send(mailOptions, function(err, body) {
      console.log(body);
      next(err);
    })

  }

  this.updateQueries();
};

var users = new Users(5, 24 * 60 * 50 * 1000);

var corsOptions = {
  origin: process.env.CLIENT_ADDRESS,
  optionsSuccessStatus: 200
}
console.log('corsOptions', corsOptions);

router.use(cors());

router.post('/contact', cors(), function(req, res) {
  var ipAddress = req.ip;

  
  console.log('body contact', req.body);
  
  var email = req.body.email;
  var subject = req.body.subject;
  var message = req.body.message;

  console.log(email, subject, message);

  users.sendEmail(ipAddress, email, subject, message, function(err) {
    if (err === 'Too many inquiries') return res.status(429).send('Too many inquiries, try again in 24h').end();
    if (err) return res.status(500).send('Issue with email send');

    return res.end();
  })
  

});

module.exports = {
  router,
  AutoCounter,
  Users
}
