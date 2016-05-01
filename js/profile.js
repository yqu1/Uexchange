"use strict";

$(function() {
    var ref = new Firebase("https://incandescent-inferno-9744.firebaseio.com/");
    var authData = ref.getAuth();
    if(!authData) {
        window.location.replace('uexchange.html');
    }
    var username = $('#username');
    var email = $('#email');
    var phone = $('#phone');
    var uid = authData.uid;
    var $save = $('#save');
    var $cancel = $('#cancel');
    var $list = $('#items');
    var user_listing_key;
    var listing_key;


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
    });


    $cancel.on('click', function(e) {
       ref.on('value', function(snap) {
        username.val(snap.val()["project_users"][uid]["alias"]);
            email.val(snap.val()["project_users"][uid]["email"]);
            phone.val(snap.val()["project_users"][uid]["phone"]);
       });
         $("#file-field").val("");
    });


    $save.on('click', function(e) {
         var credentials = {accessKeyId
                  : "AKIAIZ522LL7ETF26ZHQ", secretAccessKey: "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"};
                AWS.config.credentials = new AWS.Credentials("AKIAIZ522LL7ETF26ZHQ", "5gz6OkwfYYq70ARO6pLxfoay6iCXkccXQv1uqy3A");
                AWS.config.region = "us-east-1";
                var bucket = new AWS.S3({params: {Bucket: "mfink2"}});

        var file = $("#file-field").prop("files")[0];

        if(file) {
            var prop = {
                        Key: file.name,
                       ContentType: file.type,
                        Body: file,
                         ACL: "public-read"
                    };

            console.log(prop);

            bucket.upload(prop, function(err, data) {
                var firebase_url = "https://incandescent-inferno-9744.firebaseio.com/project_users/" + uid;
                var Ref = new Firebase(firebase_url);
                var info = {
                    'email': email.val(),
                    'alias': username.val(),
                    'phone': phone.val(),
                    'img': data.Location
                };
                Ref.update(info);
                $("#profile-img").attr("src", data.Location)
            })
        }

        else {
            var firebase_url = "https://incandescent-inferno-9744.firebaseio.com/project_users/" + uid;
            var Ref = new Firebase(firebase_url);
                var info = {
                    'email': email.val(),
                    'alias': username.val(),
                    'phone': phone.val()
                };
            Ref.update(info);
        }

        $("#file-field").val("");

    });


    var $addListing = $('#add-listing-button'),
        $submitListing = $('#submit-listing-button'),
        $userListings = $('#user_listings'),
        $addListingForm = $('#add-listing-form');

    $addListingForm.hide();
    $submitListing.hide();

    $addListing.on('click',function(e){
        console.log("add listing");
        document.getElementById('listing_name').value = "";
        document.getElementById('listing_price').value = "";
        document.getElementById('listing_description').value = "";
        $addListingForm.show();
        $submitListing.show();
        $addListing.hide();
    });

    $addListingForm.on('click', "#submit-listing-button", function(e){
        console.log("submitting listing");
        console.log($addListingForm.find('#listing_name').val());
        e.preventDefault();
        e.stopPropagation();


        var credentials = {accessKeyId
            : "AKIAIZ522LL7ETF26ZHQ", secretAccessKey: "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"};
        AWS.config.credentials = new AWS.Credentials("AKIAIZ522LL7ETF26ZHQ", "5gz6OkwfYYq70ARO6pLxfoay6iCXkccXQv1uqy3A");
        AWS.config.region = "us-east-1";
        var bucket = new AWS.S3({params: {Bucket: "mfink2"}});

        var file = $("#pic-file-field").prop("files")[0];

        console.log($addListingForm.find('#listing_name').val().length);
        if(file && $addListingForm.find('#listing_name').val() && $addListingForm.find('#listing_price').val() && $addListingForm.find('#listing_description').val()) {
            console.log("submitted listing WITH A PICTURE");
            var prop = {
                Key: file.name,
                ContentType: file.type,
                Body: file,
                ACL: "public-read"
            };

            console.log(prop);

            bucket.upload(prop, function(err, data) {
                var firebase_url = "https://incandescent-inferno-9744.firebaseio.com/project_users/" + uid;
                var Ref = new Firebase(firebase_url);

                var new_user_listing = Ref.child("listings").push();
                var info = {
                    'name': $addListingForm.find('#listing_name').val(),
                    'price': $addListingForm.find('#listing_price').val(),
                    'description': $addListingForm.find('#listing_description').val(),
                    'img': data.Location,
                    'key': new_user_listing.key(),
                    'sold' : false
                };
                new_user_listing.update(info);
                user_listing_key = new_user_listing.key();

                var new_listing = ref.child('listings').push();
                new_listing.update({
                    'name': $addListingForm.find('#listing_name').val(),
                    'price': $addListingForm.find('#listing_price').val(),
                    'description': $addListingForm.find('#listing_description').val(),
                    'img': data.Location,
                    'uid' : uid,
                    'key' : new_listing.key(),
                    'user-listing-key' : new_user_listing.key(),
                    'sold' : false
                });
                listing_key = new_listing.key();

            });


            //document.getElementById('listing_name').value = "";
            //document.getElementById('listing_price').value = "";
            //document.getElementById('listing_description').value = "";

        }

        else if($addListingForm.find('#listing_name').val() && $addListingForm.find('#listing_price').val() && $addListingForm.find('#listing_description').val()) {
            console.log("submitted listing WITH A PICTURE 2");
            var firebase_url = "https://incandescent-inferno-9744.firebaseio.com/project_users/" + uid;
            var Ref = new Firebase(firebase_url);

            var new_user_listing = Ref.child("listings").push();
            var info = {
                'name': $addListingForm.find('#listing_name').val(),
                'price': $addListingForm.find('#listing_price').val(),
                'description': $addListingForm.find('#listing_description').val(),
                'img' : 'http://southasia.oneworld.net/ImageCatalog/no-image-icon/image_preview',
                'key': new_user_listing.key(),
                'sold' : false
            };

            new_user_listing.update(info);
            user_listing_key = new_user_listing.key();

            var new_listing = ref.child('listings').push();
            new_listing.update({
                'name': $addListingForm.find('#listing_name').val(),
                'price': $addListingForm.find('#listing_price').val(),
                'description': $addListingForm.find('#listing_description').val(),
                'img' : 'http://southasia.oneworld.net/ImageCatalog/no-image-icon/image_preview',
                'uid' : uid,
                'key': new_listing.key(),
                'user-listing-key' : new_user_listing.key(),
                'sold' : false
            });
            listing_key = new_listing.key();

            //document.getElementById('listing_name').value = "";
            //document.getElementById('listing_price').value = "";
            //document.getElementById('listing_description').value = "";


        }else{
            console.log("submitted listing WITH A PICTURE 3");
            console.log('PLEASE FILL IN ALL FIELDS');
            alert("Please specify listing name, price, and description");

        }


        $("#pic-file-field").val("");
        //document.getElementById('listing_name').value = "";
        //document.getElementById('listing_price').value = "";
        //document.getElementById('listing_description').value = "";


        //$userListings.find('#header').remove();
        //$userListings.find('#items').append('<li><div><h4>' + $addListingForm.find('#listing_name').val() + '</h4><img src="'+ data.Location +'"<p>Price: $' + $addListingForm.find('#listing_price').val() + '</p><p>Description: ' + $addListingForm.find('#listing_description').val() +'</p><input class="btn btn-primary" id="buy-listing-button" value="Buy" type="button"><br></div><br></li>');


        $addListingForm.hide();
        $submitListing.hide();
        $addListing.show();
    });

    ref.child('project_users').child(uid).child('listings').on('value', function(snapshot) {
        console.log(snapshot.val());
        $userListings.find('#header').remove();
        $list.html("");
        var name, desc, price, img;

        for(var item in snapshot.val()) {
            name = snapshot.val()[item]['name'];
            console.log(name);
            price = snapshot.val()[item]['price'];
            desc = snapshot.val()[item]['description'];
            if (snapshot.val()[item]['img'] && snapshot.val()[item]['sold']==false) {
                img = snapshot.val()[item]['img'];
                console.log(snapshot.val()[item]['key']);
                $list.append('<tr><th><img id="list-pic" src="' + img + '" class="item-pic"></th><td><h4>' + name + '</h4><p>Price: $' + price + '</p><p>Description: ' + desc + '</p></td></tr><br><br>');
            } else if(snapshot.val()[item]['img'] && snapshot.val()[item]['sold']==true) {
                img = snapshot.val()[item]['img'];
                console.log(snapshot.val()[item]['key']);
                $list.append('<tr><th><img id="list-pic" src="' + img + '" class="item-pic"></th><td><h4>' + name + '</h4><p>Price: $' + price + '</p><p>Description: ' + desc + '</p></td><td><h3>Sold!</h3></td></tr><br><br>');
            } else {
                console.log("here");
                $list.append('<tr><td><h4>' + name + '</h4><p>Price: $' + price + '</p><p>Description: ' + desc + '</p></td></tr><br><br>');
            }
        }
    });

    $('#profile-return').on("click", function(e){
        e.stopPropagation();
        e.preventDefault();
        window.location.href='uexchange.html'
    });


});