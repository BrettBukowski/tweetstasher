var Browser = require('zombie')
  , assert = require('assert');
  
var browser = new Browser();
  
describe('Functional routes testing', function() {
  // Un-authenticated routes

  describe('Home page', function() {
    it('Should render home page w/ sign up button', function(done) {
      browser.visit('http://localhost:4000/', function() {
        assert.ok(browser.query('#start'));
        done(); 
      })
    })
  });

  describe('About page', function() {
    it('Should render about page', function(done) {
      browser.visit('http://localhost:4000/about', function() {
        assert.equal(browser.text('h2'), 'About This Site');
        done(); 
      })
    })
  });
  
  describe('Sign in', function() {
    it('Should redirect to Twitter', function(done) {
      browser.visit('http://localhost:4000/', function() {
        browser.pressButton('Start Stashing!', function() {
          assert.equal(browser.location.pathname, '/oauth/authenticate');
          done();
        })
      });
    })
  });
  
  // Authenticated routes
  
  describe('Tweet list', function() {
    it('Should display list of tweets', function(done) {
      done();
    })
  });
  
  describe('Tweet list', function() {
    it('Should create a new tweet', function(done) {
      done();
    })
  });
  
  describe('Tweet list', function() {
    it('Should edit an existing tweet', function(done) {
      done();
    })
  });
  
  describe('Tweet list', function() {
    it('Should delete an existing tweet', function(done) {
      done();
    })
  });
  
  describe('Tweet list', function() {
    it('Should publish an existing tweet', function(done) {
      done();
    })
  });
  
  describe('Tweet list', function() {
    it('Should publish a new tweet', function(done) {
      done();
    })
  });
})