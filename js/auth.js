"use strict";


function auth(fbname) {
    var firebase = new Firebase("https://"+ fbname + ".firebaseio.com");
    this.firebase = firebase;
    var usersRef = this.firebase.child('project_users');
    this.usersRef = usersRef;
    var uid;
    var linksRef = this.firebase.child('livelinks');
    this.linksRef = linksRef;
    var instance = this;

    //overridable functions
    this.onLogin = function(user) {};
    this.onLoginFailure = function() {};
    this.onLogout = function() {};
    this.onError = function(error) {};

    // long running firebase listener
    this.start = function() {
      firebase.onAuth(function (authResponse) {
          if (authResponse) {
              console.log("user is logged in");
              console.log(authResponse);
              usersRef.child(authResponse.uid).once('value', function(snapshot) {
                  instance.user = snapshot.val();
                  instance.onLogin(instance.user);
              });
          } else {
              console.log("user is logged out");
              instance.onLogout();
          }
      });
    };

    this.uid = function() {return uid;};

    // submit links for logged in users
    this.submitLink = function(url,name) {
        if ((url.substring(0,5) !== "https") && (url.substring(0,4) !== "http")) {
            url = "http://" + url;
        }
        this.linksRef.child(btoa(url)).update({
            name: name
        }, function(error) {
            if (error) {
                instance.onError(error);
            } else {
                // many-to-many relationship between livelinks and users
                linksRef.child(btoa(url))
                        .child('users')
                        .child(instance.auth.uid)
                        .set(true);
                usersRef.child(instance.auth.uid)
                        .child('links')
                        .child(btoa(url))
                        .set(true);
            }
        });
    };
    // signup with an alias
    this.signup = function(email,password,password_confirm,alias,phone) {
        this.firebase.createUser({
            email : email,
            password : password
        }, function(error, userData) {
            if (error) {
                instance.onError("Error creating user" + error);
            }

            else if(password != password_confirm) {
              instance.onError("Password does not match!");
            }
            else {
                instance.userData = userData;
                console.log("user data",userData);

                usersRef.child(userData.uid).set({
                    alias : alias,
                    email : email,
                    phone: phone
                }, function(error) {
                    if (error) {
                        instance.onError(error);
                    }
                    else {
                        instance.login(email,password);
                    }
                });
            }
        });
    };
    // login with email and password
    this.login = function(email,password) {
        this.firebase.authWithPassword({
            email: email,
            password : password
        }, function(error, authData) {
            if (!error) {
                instance.auth = authData;
                console.log("uid:", authData.uid);
            } else {
                instance.onError("login failed! " + error);
                instance.onLoginFailure();
            }
        }, {
            remember : "default"
        });
    };
    // logout
    this.logout = function() {
        this.firebase.unauth();
        instance.auth=null;
    };
}


$(function() {
	var ll = new auth("resplendent-fire-5646");

	    var $loginButton = $('#login-button'),
        $signupButton = $('#signup-button'),
        $logoutButton = $('#logout-button'),
        $signupForm = $('#signup-form'),
        $loginForm = $('#login-form'),
        $profile = $('#profile'),
        $alerts;

        $logoutButton.hide();
        $profile.hide();


        ll.onLogin = function(user) {
        	console.log("in onLogin!");
        	showAlert("Welcome to University Exchange!","success");

        	$loginForm.hide();
        	$signupForm.hide();
        	$logoutButton.show();
        	$profile.show();
            $('#login-email').val("");
            $("#login-password").val("");
            $('#signup-email').val("");
            $("#signup-password").val("");

        };

        ll.onLogout = function() {
        	console.log("in onLogout");
        	$loginForm.show();
        	$signupForm.show();
        	$logoutButton.hide();
        	$profile.hide();
        };

        ll.onLoginFailure = function() {
	        console.log("in onLoginFailure");
	        $loginButton.show();
	        $signupButton.show();
    	};

    	$logoutButton.on('click',function(e) {
	        ll.logout();
	        $logoutButton.hide();
	        $loginForm.show();
	        $signupForm.show();
	        return false;
    	});

    	ll.onError = function(error) {
    		showAlert(error,"danger");
    	};

    	$loginButton.on('click', function(e) {
    		e.preventDefault();
       	 	e.stopPropagation();
       	 	ll.login($('#login-email').val(), $('#login-password').val());
    	});

    	$signupButton.on('click', function(e) {
    		e.preventDefault();
        	e.stopPropagation();
        	ll.signup($('#signup-email').val(),
            $('#signup-password').val(),$('#signup-password-confirm').val(),
            $('#signup-alias').val(), $('#signup-phone').val());
    	});

    	function showAlert(message, type) {
	        var $alert = (
	            $('<div>')                // create a <div> element
	                .text(message)          // set its text
	                .addClass('alert')      // add some CSS classes and attributes
	                .addClass('alert-' + type)
	                .addClass('alert-dismissible')
	                .hide()  // initially hide the alert so it will slide into view
	        );

	        /* Add the alert to the alert container. */
	        $alerts = $('#alerts');
	        $alerts.append($alert);

	        $alerts.on('click',function(e) {
	            var $t=$(e.target);
	            $t.remove();
	        });

	        /* Slide the alert into view with an animation. */
	        $alert.slideDown();
	        setTimeout(function(){$alert.hide()},3000);
    	}

    	// ensure no user session is active
    	// ll.logout();
   	 	// start firebase auth listener only after all callbacks are in place
    	ll.start();

    	//window.onunload = function() {
        //ll.logout();
    //}


});