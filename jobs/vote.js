'use strict';

function unpackData() {
	var tmp = phantom.args.toString(),
		args = {};
	tmp.split(',').forEach(function(item) {
		var parts = item.split(':');
		args[parts[0]] = parts[1];
	});
	if (args.url) {
		args.url = decodeURIComponent(args.url);
	}
	return args;
}

var openPromise;
var args = unpackData();

var page = require("webpage").create();
page.viewportSize = { width: 800, height: 800 };

page.onInitialized = function(a) {
  openPromise = page.evaluate(function() {
    return new Promise(function(resolve) {
    	document.addEventListener('DOMContentLoaded', function() {
	      resolve();
	    }, false);
    });
  });
};
page.onNavigationRequested = function(url) {
	if (args.url == url) {
		openPromise.then(function() {
			if (page.cookies) {
				page.cookies.forEach(function(e,i) {
					// check if the user successfully logged in
					if ('user_credentials' === e.name) {
						// null out the listeners
						page.onInitialized = null;
						page.onNavigationRequested = null;
						// add the vote
						step2();
					}
				});
			}
		});
	}
};

// register account on page
function step1() {
	page.open(args.url, function() {
		// after the page fully loaded
		openPromise.then(function() {
			// fill in the form elements, than submit the form
			page.evaluate(function(args) {
				document.querySelector('#user_session_login').value = args.username + '@mailinator.com';
				document.querySelector('#user_session_password').value = args.password;
				document.querySelector('#new_user_session > div.submit-area > button').click();
			}, args);
		});
	});
}

function step2() {
	page.open(args.url, function() {
		openPromise.then(function() {
			page.evaluate(function(args) {
				document.querySelector('body > div.wrap.page-container > div > div > div > article > header > a').click();
			}, args);
			setTimeout(slimer.exit, 2000);
		});
	});
}

step1();
