
REPORTER = spec

test: test-unit test-browser test-functional

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) test/unit/*.js

test-browser:
	@NODE_ENV=test node app.js &
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) test/browser/test.js

test-functional:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) --timeout 3s test/functional/*.js
