(function ($) {
    $(function () {
        var storage = domStorage();
        var thisView = Views.ReportCounterfeit;

        thisView.Execute = function (uncompiled) {
            Views.ReportCounterfeit.Content = uncompiled;

            var viewParameters = Views.ReportCounterfeit.RenderSettings;
            viewParameters.Container.empty();

//            console.log(viewParameters.Data);

            var compilled = Views.Utilities.Replace({
                Object: viewParameters.Data,
                Text: uncompiled
            });

            var panel = $(compilled).appendTo(viewParameters.Container);
            var mapConvas = panel.find(".map-canvas");
            var retailerName = panel.find("input.retailer-name-input").keyup(validateForm);
            var retailerAddress = panel.find("textarea.retailer-address-input").keyup(validateForm);
            var retailerLocation = panel.find("input.retailer-location-input");

            var productId = viewParameters.Data.ProductId;
            var latitude = 0;
            var longitude = 0;
            var geolocationRetrieved = false;

            if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
//                alert("Showing map")
                mapConvas.show();

                var geocoder;
                var map;
                var infowindow = new google.maps.InfoWindow();
                var marker;


                function initializeGoogleMaps() {
                    geocoder = new google.maps.Geocoder();
                }

                initializeGoogleMaps();
            }

            retailerLocation.val('Fetching location...');

            //try to get the user's location
            navigator.geolocation.getCurrentPosition(function (arg1) {
                geolocationRetrieved = true;

                var coords = arg1.coords;

                if (google && google.maps) {
                    var latlng = new google.maps.LatLng(parseFloat(coords.latitude), parseFloat(coords.longitude));
                    var mapOptions = {
                        zoom: 18,
                        center: latlng,
                        mapTypeId: 'roadmap'
                    }

                    map = new google.maps.Map(mapConvas.get(0), mapOptions);
                    marker = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });
                    infowindow.setContent("Your location");
                    infowindow.open(map, marker);

                    console.log(coords);


                    getLocationName(coords.longitude, coords.latitude);
                }


                latitude = coords.latitude;
                longitude = coords.longitude;
                retailerLocation.val(coords.latitude + ", " + coords.longitude);
//                console.log(coords.latitude + ", " + coords.longitude);
            }, function () {
                console.log('failure');
                console.log(arguments);
            }, {
                enableHighAccuracy: true
            });


            var agreementPanel = panel.find("div.agreement-panel");
            var statusMessage = panel.find("div.status");

            var backButton = panel.find("button.go-back-button").click(function (event) {
                event.preventDefault();

                //return to the index page.
                window.history.back();
            });

            var sendReportButton = panel.find("button.send-report-button").click(function (event) {
                event.preventDefault();

                //show the agreement panel
                agreementPanel.show();
                sendReportButton.hide();
            });

            var submitReportButton = agreementPanel.find("button.submit-button").click(function (event) {
                event.preventDefault();

                statusMessage.text("Please wait...").show();

                //send the data to the server.      
                var reportInfo = {
                    Vendor_x0020_Name: retailerName.val(),
                    Vendor_x0020_Address: retailerAddress.val(),
                    Serial_x0020_Number: viewParameters.Data.SerialNumber
                };

                if (geolocationRetrieved) {
                    reportInfo.Longitude = longitude;
                    reportInfo.Latitude = latitude;
                }

                Models.Products.sendReport(productId, reportInfo).done(function (response) {
                    statusMessage.text("Sent successfully.");
                    setTimeout(function () {
                        agreementPanel.hide();

                    }, 3000);

                }).fail(function (error) {
                    statusMessage.text("Oops! Something went wront. Please try again")
                });

            });

            agreementPanel.find("button.cancel-button").click(function (event) {
                event.preventDefault();

                //hide the agreement panel and show the send report button
                agreementPanel.hide();
                sendReportButton.show();
            });

            function validateForm() {
                console.log('Validating', retailerAddress.val());
                if (retailerAddress.val().length > 10 && retailerName.val().length > 2) {
                    sendReportButton.prop('disabled', false);
                    submitReportButton.prop('disabled', false);
                } else {
                    sendReportButton.prop('disabled', true);
                    submitReportButton.prop('disabled', true);
//                    agreementPanel.hide();
                }
            }

            function getLocationName(long, lat) {
                var query = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long;//"https://maps.googleapis.com/maps/api/geocode/json?latlng=6.4343297999999995,3.4395094999999998";//
//                var query = "http://hospital.dev/_proxy/http://maps.googleapis.com/maps/api/geocode/json/options(full_status=true%7Cfull_headers=true)?latlng=6.4343297999999995,3.4395094999999998";
//                console.log(query)
                $.ajax({
                    url: query,
                    type: "GET",
                    dataType: "json",
                    beforeSend: function (jqXHR, settings) {
                        jqXHR.setRequestHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
//                        jqXHR.setRequestHeader('Cache-Control', 'max-age=0');
                    }
//                    ,
//                    headers: {
//                        "Accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
//                        "Cache-Control":"max-age=0"
//                   
//                    }
                }).done(function (data) {
//                    console.log('HHH: ', data);
                    if (data.contents.results.length > 0) {
                        infowindow.setContent(data.contents.results[0].formatted_address);
                        infowindow.open(map, marker);
                    }
                }).fail(function(failure){
                    console.log(failure);
                });
                var latlng = new google.maps.LatLng(lat, lng);
                geocoder.geocode({'latLng': latlng}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        console.log(results.length);
                        if (results[1]) {
                            console.log(results[1].formatted_address);

                            infowindow.setContent(results[1].formatted_address);
                            infowindow.open(map, marker);
                        } else {
                            retailerLocation.val("Location found with no name");
                        }
                    } else {
                        console.log(status);
                    }
                });
            }

            viewParameters.Callback();
        }

        Views.ReportCounterfeit.GetContent.then(thisView.Execute);
    });
})(jQuery);