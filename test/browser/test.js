var Browser = require('zombie')
  , assert = require('assert');
  
describe('Browser tests', function() {
  var browser = new Browser();
  
  it('Passes', function(done) {
    browser.visit('http://localhost:4000/index.html', function() {
      assert.equal(browser.html('#mocha #stats .failures em'), '<em>0</em>');
      assert.notEqual(browser.html('#mocha #stats .passes em'), '<em>0</em>');
      done();
    })
  })
})