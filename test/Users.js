var Users = require('./../routes/users').Users;
var assert = require('assert');

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

