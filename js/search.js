"use strict";

$(function(){
    var ref = new Firebase("https://incandescent-inferno-9744.firebaseio.com/");
    var listingsRef = ref.child('listings');

    var $search_info = $('#search-info');
    var $search_header = $('#search-header');
    $search_info.hide();

    var last_search = '';

    $('#search-form').on("submit", function(e, snapshot) {
        e.preventDefault();
        e.stopPropagation();
        var search_term = $('#search-term').val().toLowerCase();
        matchListings(search_term, false);
        last_search = search_term;
        this.reset();
        $('#view-sold').hide();
        $('#view-available').hide();
    });

    function matchListings(search_term, view_sold) {

        var search_terms = search_term.split(" ");
        //search_terms = search_terms.map(function(value) {
        //    return value.toLowerCase();
        //});

        listingsRef.on('value', function(snapshot) {
            var $listings = $('#listing-items');
            $search_header.html('Showing search results for: '+ search_term);
            $search_info.show();

            var top_matches = '';
            var partial_matches = '';
            var sold_matches = '';

            var name, desc, price, img, sold;

            for(var item in snapshot.val()) {
                name = snapshot.val()[item]['name'];
                sold = snapshot.val()[item]['sold'];

                if(view_sold == false && sold == true) {
                    continue;
                }

                //check for full matches - these will show up first in results list
                if(name.toLowerCase().includes(search_term)){
                    price = snapshot.val()[item]['price'];
                    desc = snapshot.val()[item]['description'];
                    img = snapshot.val()[item]['img'];
                    if(sold == false){
                        top_matches += '<tr><th><img src="' + img + '" class="item-pic"></th><td><h2>' + name +
                            '</h2><h4>Price: $' + price + '</h4><h4>Description: ' + desc + '</h4></td>' +
                            '<td><input class="btn btn-default" value="Buy" type="button" id = "buy" data-key="' +
                            snapshot.val()[item]['key'] + '" data-user-listing-key="' +
                            snapshot.val()[item]['user-listing-key'] + '" data-userid="' +
                            snapshot.val()[item]['uid'] + '" ></td></tr><br><br>';
                    } else {
                        sold_matches += '<tr><th><img src="' + img + '" class="item-pic"></th><td><h2>' + name +
                            '</h2><h4>Price: $' + price + '</h4><h4>Description: ' + desc + '</h4></td>' +
                            '<td><h3>Sold!</h3></td></tr><br><br>';
                    }
                    continue;
                }

                //check for matches on each individual search term. These will appear after full matches
                search_terms.some(function(each_term){
                    if(name.toLowerCase().includes(each_term)) {
                        price = snapshot.val()[item]['price'];
                        desc = snapshot.val()[item]['description'];
                        img = snapshot.val()[item]['img'];
                        if(sold == false){
                            partial_matches += '<tr><th><img src="' + img + '" class="item-pic"></th><td><h2>' + name +
                                '</h2><h4>Price: $' + price + '</h4><h4>Description: ' + desc + '</h4></td>' +
                                '<td><input class="btn btn-default" value="Buy" type="button" id = "buy" data-key="' +
                                snapshot.val()[item]['key'] + '" data-user-listing-key="' +
                                snapshot.val()[item]['user-listing-key'] + '" data-userid="' +
                                snapshot.val()[item]['uid'] + '" ></td></tr><br><br>';
                        } else {
                            sold_matches += '<tr><th><img src="' + img + '" class="item-pic"></th><td><h2>' + name +
                                '</h2><h4>Price: $' + price + '</h4><h4>Description: ' + desc + '</h4></td>' +
                                '<td><h3>Sold!</h3></td></tr><br><br>';
                        }
                    }
                    return true;
                });
            }

            //concatenate search results. Sold items appear last
            $listings.html(top_matches + partial_matches + sold_matches);
        });
    }

    $('#include-sold-items').on('click', function(e){
        e.stopPropagation();
        e.preventDefault();
        matchListings(last_search, true);
    });

    $('#search-clear').on('click', function(e){
        e.stopPropagation();
        e.preventDefault();
        $search_header.html('');
        $search_info.hide();
        $('#view-sold').show();

        listingsRef.on('value', function(snapshot) {

            $('#listing-items').html('');
            var name, desc, price, img;

            for(var item in snapshot.val()) {
                if (snapshot.val()[item]['sold']==false) {
                    name = snapshot.val()[item]['name'];
                    price = snapshot.val()[item]['price'];
                    desc = snapshot.val()[item]['description'];
                    img = snapshot.val()[item]['img'];
                    $('#listing-items').append('<tr><th><img src="' + img + '" class="item-pic"></th><td><h2>' + name +
                        '</h2><h4>Price: $' + price + '</h4><h4>Description: ' + desc +
                        '</h4></td><td><input class="btn btn-default" value="Buy" type="button" id = "buy" data-key="'+
                        snapshot.val()[item]['key'] +'" data-user-listing-key="'+ snapshot.val()[item]['user-listing-key'] +
                        '" data-userid="'+ snapshot.val()[item]['uid'] +'" ></td></tr><br><br>');
                }
            }
        });
    });

    $('#view-available').hide();

    $('#view-sold').on("click", function(e){
        e.stopPropagation();
        e.preventDefault();

        listingsRef.on('value', function(snapshot) {

            $('#listing-items').html('');
            var name, desc, price, img;

            for(var item in snapshot.val()) {
                if (snapshot.val()[item]['sold']==true) {
                    name = snapshot.val()[item]['name'];
                    price = snapshot.val()[item]['price'];
                    desc = snapshot.val()[item]['description'];
                    img = snapshot.val()[item]['img'];
                    $('#listing-items').append('<tr><th><img src="' + img + '" class="item-pic"></th><td><h2>' + name +
                        '</h2><h4>Price: $' + price + '</h4><h4>Description: ' + desc +
                        '</h4></td><td><h3>Sold!</h3></td></tr><br><br>');
                }
            }
            $('#view-sold').hide();
            $('#view-available').show()
        });
    });

    $('#view-available').on("click", function(e){
        e.stopPropagation();
        e.preventDefault();

        listingsRef.on('value', function(snapshot) {

            $('#listing-items').html('');
            var name, desc, price, img;

            for(var item in snapshot.val()) {
                if (snapshot.val()[item]['sold']==false) {
                    name = snapshot.val()[item]['name'];
                    price = snapshot.val()[item]['price'];
                    desc = snapshot.val()[item]['description'];
                    img = snapshot.val()[item]['img'];
                    $('#listing-items').append('<tr><th><img src="' + img + '" class="item-pic"></th><td><h2>' + name +
                        '</h2><h4>Price: $' + price + '</h4><h4>Description: ' + desc +
                        '</h4></td><td><input class="btn btn-default" value="Buy" type="button" id = "buy" data-key="'+
                        snapshot.val()[item]['key'] +'" data-user-listing-key="'+ snapshot.val()[item]['user-listing-key'] +
                        '" data-userid="'+ snapshot.val()[item]['uid'] +'" ></td></tr><br><br>');
                }
            }
            $('#view-available').hide();
            $('#view-sold').show()
        });


    });
});