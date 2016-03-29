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
page.onLoadStarted = function(url) {
	if ('https://www.designernews.co/users' === url) {
		openPromise.then(function() {
			// wait the registration email to arrive
			setTimeout(step2, 2000);
		});
	}
};

// register account on page
function step1() {
	page.open('https://www.designernews.co/users/new', function() {
		// after the page fully loaded
		openPromise.then(function() {
			console.log('dom loaded on the reg form..');
			// fill in the form elements, than submit the form
			page.evaluate(function(args) {
				document.querySelector('#user_email').value = args.username + '@mailinator.com';
				document.querySelector('#user_password').value = args.password;
				document.querySelector('#user_first_name').value = args.first_name;
				document.querySelector('#user_last_name').value = args.last_name;
				document.querySelector('#user_job').value = args.job_title + ' @ ' + args.company;
				document.querySelector('#user_receive_digest').click();
				document.querySelector('#new_user > input.create-account-button.yellow').click();
			}, args);
		});
	});
}

// confirm registration
function step2() {
	page.open('http://mailinator.com/', function() {
		// after the page fully loaded
		openPromise.then(function() {
			console.log('dom loaded on email site..');
			// fill in the form elements, than submit the form

			page.evaluate(function(args) {
				document.querySelector('#inboxfield').value = args.username;
				changeInbox();
			}, args);
			setTimeout(function() {
				page.evaluate(function() {
					document.querySelector('.innermail').click();
				});
				setTimeout(function() {
					page.evaluate(function() {
						document.querySelector('#publicshowmaildivcontent').contentWindow.document.querySelector('.confirm-button').click();
					});
					// wait for registration complete
					setTimeout(function() {
						slimer.exit();
					}, 5000);
				}, 2000);
			}, 2000);
		});
	});
}

step1();
