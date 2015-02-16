(function ($) {
    $(function () {
        storage = domStorage();
        Views.Index.GetContent.then(function (data) {
            Views.Index.Content = data;

            var settings = Views.Index.RenderSettings;
            var x = $(data).appendTo(settings.Container);

            Models.Users.GetCurrentUser().done(function (UserInfo) {
//                console.log(UserInfo);
                if (UserInfo == null) {
                    settings.Container.find('div.not-a-user-message').show();
                    settings.Container.find('div.loading-panel').hide();
                } else {

                    //save the current hash value


                    var viewArea = settings.Container.find('.viewArea');//.hide();
                    var searchBox = settings.Container.find('.searchBox');
                    var resultContainer = settings.Container.find('.resultContainer');
                    var resultList = settings.Container.find('.resultContainer ul');

                    if (document.location.hash.length > 0) {
//                        document.location = document.location.hash;
                        console.log('hash found');
                        settings.GotoHash();
                        viewArea.show();
                    }

//                    viewArea.prepend("kkkkk")
                    searchBox.on("keyup", function (event) {
//                        console.log("hhh")
                        var value = searchBox.val();

                        if (value.length > 3) {
                            resultContainer.show();
                            viewArea.hide();

                            //generate the query
                            Models.Products.findByDescription(value, {
                                $select: "Name, Description, Manufacturer/Name, CategoryInfo/Category_x0020_Id",
                                $expand: "Manufacturer, CategoryInfo"
                            }).done(function (data) {
                                resultContainer.show();
                                resultList.empty();
//                                viewArea.show();
                                $.each(data.d.results, function (i, v) {
                                    $("<li class='topcoat-list__item'/>").appendTo(resultList).data("Product", v).text(v.Name);
                                });

                                //when an item is clicked
                                resultList.find("li").click(function (event) {
                                    event.preventDefault();

                                    //hide the result list
                                    resultContainer.hide();

                                    //navigate to the product page
                                    var timestamp = (Math.random() * 1000);
                                    var prod = $(this).data("Product");
                                    prod.Timestamp = timestamp;

                                    var key = "#ProductView(." + viewArea.attr('id') + ")(" + timestamp + ")";
//                                    $.cookie(key, prod);
                                    storage.write(key, JSON.stringify(prod));

                                    document.location = key;
                                });
                            });
                        } else {
                            resultList.empty();
                        }
                    });

                    settings.Callback(x);
                }
            }).fail(function (failure) {
                settings.Container.find('div.not-a-user-message').text('Oops! Something went wrong. Please refresh the page to retry.').show();
                settings.Container.find('div.loading-panel').hide();
            });
        });
    });
})(jQuery);