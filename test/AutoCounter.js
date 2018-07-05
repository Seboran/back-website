var AutoCounter = require('./../routes/users').AutoCounter;
var assert = require('assert');

describe('AutoCounter', function() {

    var autocounter = new AutoCounter(200);

    it('should exists after 100 ms', function(done) {

        setTimeout(function() {
            assert.strictEqual(autocounter.value, 1);
            done();
        }, 100);
    })
    

    it('should not exist after 201 ms', function(done) {
        setTimeout(function() {
            assert.strictEqual(autocounter.value, 0);
            done();
        }, 201)
    })

    
    
    it('should have decreasing values', function(done) {
        
        var autocounter2 = new AutoCounter(200);
        
        autocounter2.inc();

        assert.strictEqual(autocounter2.value, 2, '0ms');

        setTimeout(function() {
            assert.strictEqual(autocounter2.value, 1, '205ms');
            autocounter2.inc().inc();
        }, 205);

        setTimeout(function() {
            assert.strictEqual(autocounter2.value, 2, '405ms');
        }, 405);
        setTimeout(function() {
            assert.strictEqual(autocounter2.value, 1, '605ms');
            done();
        }, 605)

    });

})
