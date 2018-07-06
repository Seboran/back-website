var Users = require('./../routes/users').Users;
var assert = require('assert');
var fetch = require('node-fetch');

describe('Users', function() {

    var users = new Users(3, 200);
    
    
    before(function() {

        users.addQuery('1');
        users.addQuery('1');
        users.addQuery('2');
        
        

    })
    
    it('should have 2 pending queries', function() {
        checkQueries(users, 2);

    })

    it('should have 1 pending query after 300ms', function(done) {
        setTimeout(function() {
            
            checkQueries(users, 1);
            
            done();
        }, 300);
    })

    it('should have 0 pending queries after 600ms', function(done) {
        setTimeout(function() {

            checkQueries(users, 0);
            done();
        }, 600);
    })

    it('should not have a query with more than value 2', function() {

        var users2 = new Users(1, 50);
        users2.addQuery('1');
        users2.addQuery('2');
        users2.addQuery('1');

        assert.strictEqual(users2.listQueries['1'].value, 1) 
    });

    it('should block excess queries', function() {

        var users3 = new Users(1, 50);
        var first = users3.addQuery('1');
        var second = users3.addQuery('1');
        assert.strictEqual(first, true, 'should not block');
        assert.strictEqual(second, false, 'should block');
    })

    var emailRequest = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: process.env.EMAIL_TEST,
            subject: '[TEST] TEST',
            message: 'Well this is just a simple email\nTo say what you done'
        })
    }

    it('should send me an email', function(done) {

        this.timeout(4000);

        fetch('http://localhost:' + process.env.PORT + '/users/contact', emailRequest)
        .then(function(res) {
            assert.strictEqual(res.status, 200, 'status number');

            done();
        })
        .catch(function(err) {
            done(err);
        })
    })
       
    

})

/**
 * 
 * @param {Users} users 
 * @param {number} numberQueries 
 */
function checkQueries(users, numberQueries) {
    var count = 0;
    for (var key in users.listQueries) {
        if (users.listQueries.hasOwnProperty(key)) {
            count++;
        }
    }
    assert.strictEqual(count, numberQueries);
}

