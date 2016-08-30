$(function () {
    if(localStorage.getItem("polr_settings") == null)
        localStorage.setItem("polr_settings", JSON.stringify({
            url: "",
            apiKey: ""
        }));

    if (localStorage.getItem("domain") == null)
        localStorage.setItem("domain", "google");

    var apiData = {
        google: {
            apiKey: "AIzaSyDDaEFpiRt3dpsJ6f_nGvnXjLxaP_zPZ9E"
        },
        tinyurl: {
            loginName: "wassup789",
            apiKey: "R_3728bedcc3a24301bc018631af5709a1"
        },
        godaddy: {
            apiKey: "54e3c1a2123211e6b5dbfa163ee12fa9"
        },
        polr: JSON.parse(localStorage.getItem("polr_settings"))
    };

    registerListeners();


    var manifest = chrome.runtime.getManifest();

    $("#content").css("height", $("#main").height());
    $("#version_number").text(manifest.version);
    $("#option").val(localStorage.getItem("domain"));

    $("#option_polr_apikey").val(apiData.polr.apiKey);
    $("#option_polr_url").val(apiData.polr.url);

    if (apiData.polr.url != "" && apiData.polr.apiKey != "")
        $("#option_polr").html(apiData.polr.url + " - Custom");


    updatePolrOptions();

    startShortening();

    $("#option_polr_config").click(function () {
        $("#option_polr_fields").toggle();
        updatePolrConfig();
    });

    var previousValue = $("#option_polr_url").val();
    $("#option_polr_fields input").bind("change keyup", function () {
        if($("#option_polr_url").val() == previousValue)
            return;
        else
            previousValue = $("#option_polr_url").val();

        var url = $("#option_polr_url").val(),
            selection = $("#option_polr_url")[0].selectionStart,
            selectionEnd = $("#option_polr_url")[0].selectionStart;

        if(url.startsWith("http://"))
            url = url.substring(7, url.length);
        if(!url.startsWith("https://")) {
            url = "https://" + url;
            selection += "https://".length;
            selectionEnd += "https://".length;
        }
        if(!url.endsWith("/"))
            url += "/";

        if ($("#option_polr_apikey").val().length == 30 && isValidUrl(url)) {
            apiData.polr.apiKey = $("#option_polr_apikey").val();
            apiData.polr.url = url;

            localStorage.setItem("polr_settings", JSON.stringify(apiData.polr));

            $("#option_polr").html(url + " - Custom");
            $("#option_polr_url").val(url);
            $("#option_polr_url")[0].selectionStart = selection;
            $("#option_polr_url")[0].selectionEnd = selectionEnd;

            updatePolrOptions();

            startShortening();
        }
    })

    /**
     *  Starts URL shortening action
     */
    function startShortening() {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (callback) {
            if (callback.length < 1 || !isValidUrl(callback[0].url)) {
                $("#url_output a").text("Invalid URL");
                return;
            }
            $("#url_output a").text("Shortening...");
            var link = callback[0].url;
            setTimeout(function () {
                shortenUrl(link);
            }, 500);
        });
    }

    /**
     *  Shortens a url using the domain selected
     *
     *  @param {string} url A valid non-URI encoded URL
     */
    function shortenUrl(url) {
        var domain = localStorage.getItem("domain");
        switch (domain) {
            case "google":
                shortenGoogle(url);
                break;
            case "tinyurl":
                shortenTinyurl(url);
                break;
            case "bitly":
                shortenBitly(0, url);
                break;
            case "jmp":
                shortenBitly(1, url);
                break;
            case "polr":
                shortenPolr(url);
                break;
            default:
                localStorage.setItem("domain", "google");
                window.location.reload();
                break;
        }
    }

    /**
     *  Generates a QR code using qrcode.min.js
     *
     *  @param {string} url A valid non-URI encoded URL
     */
    function generateQRCode(url) {
        $("#qrCode").html("");
        new QRCode($("#qrCode")[0], {
            text: url,
            width: 150,
            height: 150
        });
        $("#qrCode").css("top", Math.max(0, (($(window).height() - $("#qrCode").outerHeight()) / 2) + $(window).scrollTop()) + "px");
        $("#qrCode").css("left", Math.max(0, (($(window).width() - $("#qrCode").outerWidth()) / 2) + $(window).scrollLeft()) + "px");
    }

    /**
     *  Shortens a URL using goo.gl
     *
     *  @param {string} url A valid non-URI encoded URL
     */
    function shortenGoogle(url) {
        $.ajax({
            method: "POST",
            contentType: "application/json",
            url: "https://www.googleapis.com/urlshortener/v1/url?key=" + apiData.google.apiKey,
            data: JSON.stringify({
                longUrl: url
            })
        }).done(function (data) {
            setUrl(data.id);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log("=====START OF ERROR OUTPUT=====");
            console.log(JSON.stringify(jqXHR));
            console.log("=====END OF ERROR OUTPUT=====");

            $("#url_output a").text("Error; Status Code: " + jqXHR.status);
        });
    }

    /**
     *  Shortens a URL using bit.ly and j.mp
     *
     *  @param {number} type 0 = bit.ly; 1 = j.mp
     *  @param {string} url A valid non-URI encoded URL
     */
    function shortenBitly(type, url) {
        var domain = "bit.ly";
        switch (type) {
            case 1:
                domain = "j.mp";
        }

        $.ajax({
            method: "GET",
            url: "https://api-ssl.bit.ly/v3/shorten?login=" + apiData.tinyurl.loginName + "&apiKey=" + apiData.tinyurl.apiKey + "&longUrl=" + encodeURIComponent(url) + "&domain=" + domain,
        }).done(function (data) {
            setUrl(data.data.url);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log("=====START OF ERROR OUTPUT=====");
            console.log(JSON.stringify(jqXHR));
            console.log("=====END OF ERROR OUTPUT=====");

            $("#url_output a").text("Error; Status Code: " + jqXHR.status);
        });
    }

    /**
     *  Shortens a URL using bit.ly and j.mp
     *
     *  @param {string} url A valid non-URI encoded URL
     */
    function shortenTinyurl(url) {
        $.ajax({
            method: "GET",
            url: "https://apps.wassup789.com/urlshortener/tinyurl?url=" + url
        }).done(function (data) {
            setUrl(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log("=====START OF ERROR OUTPUT=====");
            console.log(JSON.stringify(jqXHR));
            console.log("=====END OF ERROR OUTPUT=====");

            $("#url_output a").text("Error; Status Code: " + jqXHR.status);
        });
    }

    /**
     *  Shortens a URL using a customized Polr instance
     *
     *  @param {string} url A valid non-URI encoded URL
     */
    function shortenPolr(url) {
        $.ajax({
            method: "GET",
            url: apiData.polr.url + "api/v2/action/shorten?key=" + apiData.polr.apiKey + "&url=" + url
        }).done(function (data) {
            setUrl(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log("=====START OF ERROR OUTPUT=====");
            console.log(JSON.stringify(jqXHR));
            console.log("=====END OF ERROR OUTPUT=====");

            $("#url_output a").text("Error; Status Code: " + jqXHR.status);
        });
    }

    /**
     *  Sets the URL and runs the 'generateQRCode' function
     */
    function setUrl(url) {
        $("#url_output a").text(url);
        $("#url_output a").attr("href", url);
        $("#url_output_input").val(url);
        generateQRCode(url);
    }

    /**
     *  Registers all listeners
     */
    function registerListeners() {
        $(document).on("click", "a", function () {
            if ($(this).attr("href") != null && $(this).attr("href") != "#")
                chrome.tabs.create({url: $(this).attr("href")});
        });

        $("#button_clipboard").on("click", function () {
            $("#url_output_input").select();
            document.execCommand("SelectAll");
            document.execCommand("Copy");
            buttonOverlay("Copied to Clipboard");
        });

        $("#button_qr").on("click", function () {
            $("#qrCode").fadeIn("fast");
            $("#overlay").fadeIn("fast");
        });

        $("#overlay, #qrCode").on("click", function () {
            $("#qrCode").fadeOut("fast");
            $("#overlay").fadeOut("fast");
        });

        $("#option").on("change", function () {
            localStorage.setItem("domain", $("#option").val());
            buttonOverlay("Set domain to " + $("#option").find(":selected").text());
            updatePolrOptions();
            if ($("#option").find(":selected").attr('value') != "polr"
                || ( localStorage.getItem("polr_api") != ""
                && localStorage.getItem("polr_url") != "" )) {
                startShortening();
            }
        });
    }

    /**
     *  Update the visibility of PolrOptions
     */
    function updatePolrOptions() {
        if ($("#option").find(":selected").attr("value") == "polr") {
            if (apiData.polr.apiKey == "" || apiData.polr.url == "") {
                $("#option_polr_config").hide();
                $("#option_polr_fields").show();
            } else {
                $("#option_polr_config").show();
                $("#option_polr_config").attr("data-polr-action", "Show");
            }
            updatePolrConfig();
            $("#option_polr_container").show();
        } else {
            $("#option_polr_container").hide();
        }
    }

    /**
     * Update the display of polr custom config link
     */
    function updatePolrConfig() {
        $("#option_polr_config").attr("data-polr-action", $("#option_polr_fields").is(":visible") ? "Hide" : "Show");
    }

    /**
     *  Displays the overlay that occurs over the button row (copy to clipboard and view qrcode)
     */
    function buttonOverlay(text) {
        $("#button_container_overlay").fadeIn("fast");
        $("#button_container_overlayText").text(text);
        $("#button_container_overlay").delay(1500).fadeOut("fast");
    }

    /**
     *  Validates a URL
     *
     *  @param {string} value A URL
     *  @returns {boolean} If true, URL is valid
     */
    function isValidUrl(value) {
        return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    }
});
