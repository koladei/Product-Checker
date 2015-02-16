//load the content of each view
(function ($) {
    $(function () {
//        $.cors = true;
        var baseDomain = "http://www.cradlesoftware.com";
//        var baseDomain = "http://hospital.dev";

        function resolveUrl(url) {
            var a = document.createElement('a');
            a.href = url; // set string url
            url = a.href; // get qualified url
            return url;
        }

        var messageWindow;
        var messageWindowOrigin;
        window.addEventListener("message", function (e) {
            if (e.origin !== baseDomain) {
                return;
            }

            //when the message window informs us that it is ready
            if (typeof e.data.Command !== 'undefined') {
                switch (e.data.Command) {
                    case 0:
                    {
                        messageWindow = e.source;
                        messageWindowOrigin = e.origin;

//                        console.log(e.data.Message, messageWindowOrigin);
//                        console.log(document.URL)
                        var p = resolveUrl("./js/libs/jquery/jquery.min.js");

                        console.log("Absolute: ", p);
                        //tell it to load jquery;
                        messageWindow.postMessage({
                            Command: 1,
                            ScriptSource: p
                        }, messageWindowOrigin);
                        break;
                    }
                    case 2:
                    {
//                        console.log(e.data.Message);
                        break;
                    }
                    case 4:
                    {
                        Models.CallCallBack(e.data.CallbackName, e.data.Status, e.data.Response);
                        break;
                    }
                    default:
                    {
                        console.log("Unknown message code");
                    }
                }
            } else {
                console.log("Unsolicited message");
            }
        }, false);

        var helperPage = baseDomain + "/_proxy_script#" /*"/product_checker/_js/postMessageHelper.html#"*/ + document.location.origin;
        $('<iframe src="' + helperPage + '"/>').appendTo(document.body).hide();


        var Models = {
            CallbackArray: {},
            CallCallBack: function (k, s) {
                //use the first parameter to determine the function to call 
                var key = k;
                var status = s;

//                console.log(key);


                Array.prototype.splice.call(arguments, 0, 2);
                var args = Array.prototype.slice.call(arguments);

//                console.log(Models.CallbackArray);
                if (typeof Models.CallbackArray[key] !== 'undefined') {
                    var f = Models.CallbackArray[key];
                    if (status == 'success') {
                        f.resolve.apply(f, args);
                    } else {
                        f.reject.apply(f, args);
                    }
                }
                setTimeout(function () {
                    console.log(Models.CallbackArray);
                }, 5000);
            },
            AddCallBack: function (k, c) {
                Models.CallbackArray[k] = c;

                //make sure to clear the gabage;
                Models.CallbackArray[k].always(function () {
                    delete Models.CallbackArray[k];
                });
            },
            Users: {
                GetCurrentUser: function () {
                    var d = $.Deferred();

                    d.resolve({
                        Id: 1
                    });

                    return d;
                },
                CheckHRMembership: function () {
                    var d = $.Deferred();

                    d.resolve({
                        Id: 1
                    });

                    return d;
                }
            },
            Products: {
                findById: function (id, queryOptions) {
                    var r = $.Deferred();

                    if (typeof queryOptions === 'undefined') {
                        queryOptions = {};
                    }

                    queryOptions = $.extend({
                        $filter: "Id eq " + id,
                        $select: "Name, Description, Manufacturer"
                    }, queryOptions);

                    getItems({
                        Query: queryOptions,
                        Entity: 'Product'
                    }, function (data) {

                        r.resolve(data.d.results[0]);
                    });

                    return r;
                },
                findByDescription: function (description, queryOptions) {

                    if (typeof queryOptions === 'undefined') {
                        queryOptions = {};
                    }

                    var segmnts = description.split(' ');
                    var q = '';
                    $.each(segmnts, function (i, v) {
                        if (v.length > 0) {
                            q += " or substringof('" + v + "', Name) or substringof('" + v + "', Description)";
                        }
                    });


                    queryOptions = $.extend({
                        $filter: "substringof('" + description + "', Name) or substringof('" + description + "', Description)" + q,
                        $select: "Name, Description, Manufacturer/Name",
                        $expand: "Manufacturer"
                    }, queryOptions, {
                        $filter: "substringof('" + description + "', Name) or substringof('" + description + "', Description)" + q
                    });

                    return getItems({
                        Query: queryOptions,
                        Entity: 'Product'
                    });


                },
                /**
                 * 
                 * @param {integer} productId
                 * @param {string} serialNumber
                 * @param {JSON} queryOptions
                 * @returns {Deferred}
                 */
                verifySerialNumber: function (productId, serialNumber, queryOptions) {
                    if (typeof queryOptions === 'undefined') {
                        queryOptions = {};
                    }

                    var q = 'Product_x0020_Id eq ' + productId + ' and Batch_x0020_Start <= ' + serialNumber + ' and Batch_x0020_End >= ' + serialNumber;


                    queryOptions = $.extend(true, {
                        $filter: q,
                        $select: "Batch_x0020_Name"
                    }, queryOptions, {
                        $filter: q
                    });

                    return getItems({
                        Query: queryOptions,
                        Entity: 'ProductBatch'
                    });
                },
                sendReport: function (productId, otherInfo) {

                    var flagInfo = {};

                    if (otherInfo) {
                        $.extend(true, flagInfo, otherInfo, {Product: productId})
                    }
                    return updateItem({
                        Entity: 'Flag',
                        Values: flagInfo
                    });
                }
            }
        };

        function updateItem(parameters) {

            var r = $.Deferred();

            if (typeof messageWindow !== 'undefined') {

                //create a unique key
                var key = ("_" + (new Date()).getTime());

                //send the data to the server
                var url = baseDomain + '/_api/module/product_checker/' + parameters.Entity;
                var ajax = {
                    type: "POST",
                    url: url,
                    contentType: "application/json; odata=verbose",
                    dataType: 'json',
                    headers: {
                        "X-HTTP-Method": "PUT"
                    },
                    data: JSON.stringify(parameters.Values)
                };

                var d = $.Deferred();
                Models.AddCallBack(key, d);

                //notify the user appropriately
                d.done(function () {
                    r.resolve.call(null, arguments);
                }).fail(function () {
                    r.reject.call(null, arguments);
                });


                messageWindow.postMessage({
                    AjaxSettings: ajax,
                    CallbackName: key,
                    Command: 3
                }, messageWindowOrigin);

            } else {
                alert("Not ready!  Please try again.")
            }

            return r;
        }


        function getItems(options) {

            var r = $.Deferred();
            //prepare the setting
            var settings = $.extend(true, {
                Query: {
                    $top: 5,
                    $select: '*'
                }
            }, options);

            //build the query
            var query = "";
            for (var q in settings.Query) {
                query += (q + "=" + settings.Query[q]) + "&";
            }
            query = query.substring(0, query.length - 1);
            var entityCallbackName = settings.Entity + 'Callback';

            var url = baseDomain + '/_api/module/product_checker/' + settings.Entity + '?' + query + '&$responsePrefix=' + entityCallbackName + '(&$responseSuffix=);';
            //            console.log(url);
            $.ajax({
                crossDomain: true,
                url: url,
                async: false,
                jsonpCallback: entityCallbackName,
                contentType: "application/json",
                dataType: 'jsonp',
                success: function (data) {
                    //                    if (typeof callback === 'function') {
                    r.resolve(data);
//                    }
                },
                error: function (err) {
                    //                    if (typeof error === 'function') {
                    r.reject(err);
                    //                    }
                }
            });

            return r;
        }

        window.Models = Models;
    });
})(jQuery);
