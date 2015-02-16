(function ($) {
    $(function () {
        var storage = domStorage();
        var thisView = Views.Product;

        thisView.Execute = function (uncompiled) {
            Views.Product.Content = uncompiled;

            var settings = Views.Product.RenderSettings;
            settings.Container.empty();

            var compiled = Views.Utilities.Replace({Object: settings.Data, Text: uncompiled});
            var categories = "";
            $.each(settings.Data.CategoryInfo, function (i, categoryInfo) {
                categories += "<a href='#' class='category'>" + categoryInfo.Category_x0020_Name + "</a>"
            });
            compiled = compiled.replace("$[[Categories]]", categories);

            var x = $(compiled).appendTo(settings.Container);
            x.find('a.category').click(function (event) {
                event.preventDefault();
                alert("Not implemented");
            });

            //
            var serialNumberSearchNotification = x.find("div.search-serial-number-notification").hide();
            var resultDetails = x.find("div.search-serial-number-check-result").hide();


            //manage the serial number search event.
            var serialNumberSearchBox = x.find("input[type='text'].search-serial-number").on('keypress keyup mouseleave blur', function (event) {

                if (serialNumberSearchBox.val().length > 0) {

                    var val = serialNumberSearchBox.val();
                    val = val.replace(/([^\d]?)([0-9]?)([^\d]?)/gi, '$2');
                    //remove all none-numeric values
                    val = val.toUpperCase();
                    serialNumberSearchBox.val();
                    serialNumberSearchBox.val(val);
                    serialNumberSearchButton.prop('disabled', false);
                } else {
                    serialNumberSearchButton.prop('disabled', true);
                }
            });

            var makeReportButton = x.find("button.report-counterfeit-button").hide().click(function (event) {
                event.preventDefault();

                var timestamp = (Math.random() * 1000);
                var form = {ProductId: settings.Data.Id, ProductName: settings.Data.Name, SerialNumber: serialNumberSearchBox.val()};
                form.Timestamp = timestamp;

                var key = "#ReportCounterfeitView(." + settings.Container.attr('id') + ")(" + timestamp + ")";
//                $.cookie(key, form);
                storage.write(key, JSON.stringify(form));

//                console.log(key, form);

                document.location.hash = key;
            });

            var serialNumberSearchButton = x.find("button.search-serial-number").prop('disabled', true).click(function (event) {
                event.preventDefault();

                //run a query agains the database
                serialNumberSearchNotification.show();
                resultDetails.hide();
                makeReportButton.hide();
                serialNumberSearchBox.prop('disabled', true);
                serialNumberSearchButton.prop('disabled', true);

                Models.Products.verifySerialNumber(settings.Data.Id, serialNumberSearchBox.val(), {
                    $select: "Batch_x0020_Name, Production_x0020_Date, Expiration_x0020_Date"
                }).always(function () {
                    serialNumberSearchBox.prop('disabled', false);
                    serialNumberSearchButton.prop('disabled', false);
                    serialNumberSearchNotification.hide();
                }).fail(function (failure) {
                    serialNumberSearchNotification.text("Oops! something went wrong. Please try again. Kasa malaga").show();
                }).done(function (data) {
                    if (data.d.results.length > 0) {
                        var result = data.d.results[0];
                        resultDetails.show();
                        resultDetails.find("div.date-produced span").text(result.Production_x0020_Date);
                        resultDetails.find("div.date-expiring span").text(result.Expiration_x0020_Date);
                        resultDetails.find("div.batch-number span").text(result.Batch_x0020_Name);
                        makeReportButton.show();
                    } else {
                        serialNumberSearchNotification.text("The serial number is invalid for " + settings.Data.Name + ". \n\
    Please check the number and try again.").show();
                        makeReportButton.show();
                    }
                });
            });

            settings.Callback(x);
        }

        Views.Product.GetContent.then(thisView.Execute);
    });
})(jQuery);