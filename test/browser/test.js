var Browser = require('zombie')
  , assert = require('assert');
  
describe('Browser tests', function() {
  var browser = new Browser();
  
  it('Passes', function(done) {
    browser.visit('http://localhost:3000/index.html', function() {
      assert.equal(browser.html('#mocha #stats .failures em'), '<em>0</em>');
      done();
    })
  })
})