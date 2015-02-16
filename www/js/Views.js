//load the content of each view
(function ($) {
    $(function () {
        var baseUrl = "Views";
        var temp_space = $("<div style='display: none'></div>").appendTo(document.body);

        function replace(a) {
            var args = $.extend({
                Parent: "",
                Text: "",
                Object: ""
            }, a);

            var edited = args.Text;
            for (var k in args.Object) {
                if (args.Object[k] == null | typeof args.Object[k] === 'undefined') {
//                    console.log('Null found')
                    var p = args.Parent.length > 0 ? args.Parent + "." : "";
                    var key = "${{" + p + k + "}}";
                    edited = edited.replace(key, '');
                } else if (typeof args.Object[k] === 'number' || typeof args.Object[k] === 'string' || typeof args.Object[k] === 'boolean') {
                    var p = args.Parent.length > 0 ? args.Parent + "." : "";
                    var key = "${{" + p + k + "}}";
                    edited = edited.replace(key, args.Object[k]);
                    //console.log(key);
                } else if (typeof args.Object[k] === 'object') {
                    var p = "";
                    var pk = "";
                    if (Array.isArray(args.Object[k])) {
                        p = (args.Parent.length > 0) ? args.Parent + "[" + k + "]" : "";
                        edited = replace({Object: args.Object[k], Parent: p, Text: edited});
                    } else {
                        p = (args.Parent.length > 0) ? args.Parent + "." : "";
                        pk = p + k;
                        edited = replace({Object: args.Object[k], Parent: pk, Text: edited});
                    }
                }
            }
            return edited;
        }

        function resolve(view, url, count) {
            var c = (typeof count !== 'undefined') ? count : 0;
            var temp_space_item = $("<div style='display: none'></div>").appendTo(temp_space);
            //temp_space_item.load("/_layout/15/TrainingWebPart/Views/" + i + ".tpl.html div.body", "", function (responseText, status) {
            if (c < 10) {
                temp_space_item.load(url, "f=" + (Math.random()), function (responseText, status) {
//                    console.log("-------------")
                    if (status == "success") {
//                        console.log("Resolving content");
                        view.resolve(temp_space_item.html());
                    } else {
                        if (c < 10) {
                            //console.log("retrying...");
                            resolve(view, url, c++);
                        }
                    }
                });
            } else {
                alert("Unable to load view: " + url + ". This may cause the application to fail.");
            }
        }

        function loadView(viewName) {
            var scriptUrl = baseUrl + "/" + viewName + "/cb.js";
//            console.log('Loading: ', scriptUrl);
            $.getScript(scriptUrl, function () {
//                console.log('Loaded')
                resolve(Views[viewName].GetContent, baseUrl + "/" + viewName + "/tpl.html div.body");
            });
        }

        var Views = {
            Constants: {
                Edit: 1,
                Create: 2
            },
            Utilities: {
                Replace: replace
            },
            Index: {
                GetContent: $.Deferred(),
                Content: null,
                RenderSettings: null,
                Execute: function () {

                },
                Render: function (settings) {
                    var s = $.extend(true, {
                        Callback: function () {
                        }
                    }, settings);

                    this.RenderSettings = s;

                    //try loading the view
                    if (this.GetContent.state() != "resolved") {
                        loadView("Index");
                    } else {
                        this.Execute(this.Content);
                    }
                }
            },
            Product: {
                GetContent: $.Deferred(),
                Content: null,
                RenderSettings: null,
                Execute: function () {

                },
                Render: function (settings) {
                    //set default parameters
                    var s = $.extend(true, {
                        Callback: function () {
                        }
                    }, settings);
                    this.RenderSettings = s;

                    if (this.GetContent.state() != "resolved") {
                        loadView("Product");
                    } else {
                        this.Execute(this.Content);
                    }
                }
            },
            ReportCounterfeit: {
                GetContent: $.Deferred(),
                Content: null,
                RenderSettings: null,
                Execute: function () {

                },
                Render: function (settings) {
                    //set default parameters
                    var s = $.extend(true, {
                        Callback: function () {
                        }
                    }, settings);
                    this.RenderSettings = s;

                    if (this.GetContent.state() != "resolved") {
                        loadView("ReportCounterfeit");
                    } else {
                        this.Execute(this.Content);
                    }
                }
            }
        };

        window.Views = Views;
    });
})(jQuery);