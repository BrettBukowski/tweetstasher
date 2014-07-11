
REPORTER = spec

test: test-unit test-browser test-functional

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) test/unit/*.js

test-browser:
	@NODE_ENV=test node app.js &
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) test/browser/test.js; \
	PID=$$(ps | egrep '[0-9] node app\.js' | awk '{print $$1}'); \
	kill -9 $$PID;

test-functional:
	@NODE_ENV=test node app.js &
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) --timeout 3s test/functional/*.js
