"use strict";

function auth(fbname) {
    var firebase = new Firebase("https://" + fbname + ".firebaseio.com");
    this.firebase = firebase;
    var usersRef = this.firebase.child('project_users');
    this.usersRef = usersRef;
    var uid;
    var linksRef = this.firebase.child('livelinks');
    this.linksRef = linksRef;
    var listingsRef = this.firebase.child('project_listings');
    this.listingsRef = listingsRef;
    var instance = this;

    //overridable functions
    this.onLogin = function (user) {
    };
    this.onLoginFailure = function () {
    };
    this.onLogout = function () {
    };
    this.onError = function (error) {
    };

    this.start = function() {
        this.firebase.onAuth(function (authResponse) {
            if (authResponse) {
                console.log("user is logged in");
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

    this.uid = function () {
        return uid;
    };
}

$(function() {
    var ll = new auth("incandescent-inferno-9744");

    var $addListing = $('#add-listing-button'),
        $submitListing = $('#submit-listing-button'),
        $userListings = $('#user_listings'),
        $addListingForm = $('#add-listing-form');

    $addListingForm.hide();
    $submitListing.hide();

    $addListing.on('click',function(e){
        console.log("add listing");
        $addListingForm.show();
        $submitListing.show();
        $addListing.hide();
    });

    $addListingForm.on('click', "#submit-listing-button", function(e){
        console.log("submitting listing");
        console.log($addListingForm.find('#listing_name').val());
        $userListings.find('#header').remove();
        $userListings.find('#items').append('<li><div><h4>' + $addListingForm.find('#listing_name').val() + '</h4><p>Price: $' + $addListingForm.find('#listing_price').val() + '</p><p>Description: ' + $addListingForm.find('#listing_description').val() +'</p><input class="btn btn-primary" id="buy-listing-button" value="Buy" type="button"><br></div><br></li>');

        $addListingForm.hide();
        $submitListing.hide();
        $addListing.show();
    });



});