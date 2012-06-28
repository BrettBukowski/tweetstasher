
REPORTER = spec

test: test-unit test-integration test-functional

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) test/unit/*.js

test-integration:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) test/integration/*.js

test-functional:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) --timeout 3s test/functional/*.js
