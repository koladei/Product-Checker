(function ($) {
//    try {
//        document.addEventListener("deviceready", start, false);
//    } catch (e) {
        $(start);
//    }

    function start() {
//        alert("Device ready.");

        var storage = domStorage();
        var defaultViewContainerSelector = "#TrainingApp";
        function loadIndexView() {
            var container = $(defaultViewContainerSelector).css({
                width: "100%",
                height: "90vh"
            });
            //.empty();


            Views.Index.Render({
                Data: {
                },
                GotoHash: function () {
                    loadWindow();
                },
                Container: container,
                Callback: function (view) {
//                    var hash = $.extend(true, {}, $.cookie('IndexViewHash')).Hash;
//                    console.log('hash coookie', hash)
//
                    if (typeof hash !== 'undefined' && hash != null) {

//                        if (document.location.hash == hash) {
//                            loadWindow();
//                        } else {
////                            document.location = hash;
//                        }
                    }
                }
            });
        }

//launch the appropriate view when the page's hash changes
        $(window).on('hashchange', loadWindow);
//        try {
//            window.addEventListener("hashchange", loadWindow, false);
//        } catch (e) {
//
//        }

        //cordova
//        try {
//            $(window).hashchange(loadWindow);
//        } catch (e) {
//
//        }

//        window.addEventListener("load", loadWindow, false);
        loadIndexView();
        //});

        function loadWindow() {
//            document.location = "http://www.cradlesoftware.com"
//            document.title = 'Training Management';
            var hash = document.location.hash;
            //redirect to the appropriate view.
            var rgx = (/(#)([A-Z][\w\d]+)(View)([\(][\w\d\s#\.]+[\)])?([\(][\d\.]+[\)])?/g);
            //check if the path is valid
            if (rgx.test(hash)) {
                console.log('Hash passed.');
                var viewName = hash.replace(rgx, "$2");
                //get the key for fetching the cookie value
                var dataSelector = hash.replace(rgx, "$1$2$3$4$5");
                //get the path of the containing element selector
                var viewContainerSelector = hash.replace(rgx, "$4");
                viewContainerSelector = viewContainerSelector.indexOf('(') > -1 ? viewContainerSelector.substring(1, viewContainerSelector.length - 1) : defaultViewContainerSelector;
                var viewContainer = (viewContainerSelector == defaultViewContainerSelector) ? $(defaultViewContainerSelector) : $(defaultViewContainerSelector).find(viewContainerSelector)

                //get the cookie value
//                var data = $.cookie(dataSelector);
                var data = JSON.parse(storage.read(dataSelector));
                //if the cookie value is defined and the view exists, navigate to the view
                if (typeof data !== 'undefined' && typeof Views[viewName] !== 'undefined' && typeof Views[viewName].Render === 'function') {
                    viewContainer.show().empty();
                    Views[viewName].Render({
                        Data: data,
                        Container: viewContainer,
                        Callback: function (view) {
                            console.log("View loaded..");
                        }
                    });
                }

                //otherwise, launch the default view.
                else {
                    loadIndexView();
                }
            } else {
                console.log('Hash test failed')
                document.location = "App.html";
            }
        }
//        });
    }
})(jQuery);