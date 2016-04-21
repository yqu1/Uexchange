"use strict";

$(function() {
    var ref = new Firebase("https://resplendent-fire-5646.firebaseio.com/");
    var authData = ref.getAuth();
    var username = $('#username');
    var email = $('#email');
    var phone = $('#phone')
    var uid = authData.uid;
    var $save = $('#save');
    var $cancel = $('#cancel');


    ref.on('value', function(snap) {
        if(snap.val()["project_users"][uid]["img"] != null) {
            username.val(snap.val()["project_users"][uid]["alias"]);
            email.val(snap.val()["project_users"][uid]["email"]);
            phone.val(snap.val()["project_users"][uid]["phone"]);
            $("#profile-img").attr("src", snap.val()["project_users"][uid]["img"])

        }
        else {
            username.val(snap.val()["project_users"][uid]["alias"]);
            email.val(snap.val()["project_users"][uid]["email"]);
            phone.val(snap.val()["project_users"][uid]["phone"])
        }
    })


    $cancel.on('click', function(e) {
       ref.on('value', function(snap) {
        username.val(snap.val()["project_users"][uid]["alias"]);
            email.val(snap.val()["project_users"][uid]["email"]);
            phone.val(snap.val()["project_users"][uid]["phone"]);
       })
         $("#file-field").val("");
    })


    $save.on('click', function(e) {
         var credentials = {accessKeyId
                  : "AKIAIZ522LL7ETF26ZHQ", secretAccessKey: "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"};
                AWS.config.credentials = new AWS.Credentials("AKIAIZ522LL7ETF26ZHQ", "5gz6OkwfYYq70ARO6pLxfoay6iCXkccXQv1uqy3A");
                AWS.config.region = "us-east-1";
                var bucket = new AWS.S3({params: {Bucket: "yqu1"}});

        var file = $("#file-field").prop("files")[0];

        if(file) {
            var prop = {
                        Key: file.name,
                       ContentType: file.type,
                        Body: file,
                         ACL: "public-read"
                    };

            console.log(prop)

            bucket.upload(prop, function(err, data) {
                var firebase_url = "https://resplendent-fire-5646.firebaseio.com/project_users/" + uid;
                var Ref = new Firebase(firebase_url);
                var info = {
                    'email': email.val(),
                    'alias': username.val(),
                    'phone': phone.val(),
                    'img': data.Location
                }
                Ref.update(info);
                $("#profile-img").attr("src", data.Location)
            })
        }

        else {
            var firebase_url = "https://resplendent-fire-5646.firebaseio.com/project_users/" + uid;
            var Ref = new Firebase(firebase_url);
                var info = {
                    'email': email.val(),
                    'alias': username.val(),
                    'phone': phone.val(),
                }
            Ref.update(info);
        }

        $("#file-field").val("");

    })


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