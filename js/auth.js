"use strict";


function auth(fbname) {
    var firebase = new Firebase("https://"+ fbname + ".firebaseio.com");
    this.firebase = firebase;
    var usersRef = this.firebase.child('project_users');
    this.usersRef = usersRef;
    var uid;
    var linksRef = this.firebase.child('livelinks');
    this.linksRef = linksRef;
    var listingsRef = this.firebase.child('listings');
    this.listingsRef = listingsRef;
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
              instance.uid = authResponse.uid;
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

    //this.uid = function() {return uid;};


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
	var ll = new auth("incandescent-inferno-9744");

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


        ll.listingsRef.on('value', function(snapshot) {
            //console.log(snapshot.val());

            $('#listing-items').html("");
            var name, desc, price, img;

            for(var item in snapshot.val()) {
                name = snapshot.val()[item]['name'];
                //console.log(name);
                price = snapshot.val()[item]['price'];
                desc = snapshot.val()[item]['description'];
                if (snapshot.val()[item]['img'] && snapshot.val()[item]['sold']==false) {
                    img = snapshot.val()[item]['img'];
                    $('#listing-items').append('<tr><th><img src="' + img + '" class="item-pic"></th><td><h2>' + name + '</h2><h4>Price: $' + price + '</h4><h4>Description: ' + desc + '</h4></td><td><input class="btn btn-default" value="Buy" type="button" id = "buy" data-key="'+ snapshot.val()[item]['key'] +'" data-user-listing-key="'+ snapshot.val()[item]['user-listing-key'] +'"></td></tr><br><br>');
                } else {
                    //console.log("here");
                    //$('#listing-items').append('<tr><td><h2>' + name + '</h2><h4>Price: $' + price + '</h4><h4>Description: ' + desc + '</h4></td><td><input class="btn btn-default" value="Buy" type="button" id = "buy"></td></tr><br><br>');
                }
            }
        });


        $("#home-listings").on("click", "#buy", function(e){
            console.log('here');
            console.log($(e.target).attr('data-key'));

            ll.listingsRef.child($(e.target).attr('data-key')).update({sold: true});
            ll.usersRef.child(ll.uid).child('listings').child($(e.target).attr('data-user-listing-key')).update({sold: true});
        });

    	// ensure no user session is active
    	// ll.logout();
   	 	// start firebase auth listener only after all callbacks are in place
    	ll.start();

    	//window.onunload = function() {
        //ll.logout();
    //}


});