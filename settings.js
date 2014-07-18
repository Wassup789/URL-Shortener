$(document).ready(function(){
	var logger = window.console.log;
	window.console.log = function(){};
	
	$("#content").css("height", $("#main").height());
	
	var manifest = chrome.runtime.getManifest();
	
	var beta = true;
	if(beta)
		$(".version").html("Version " + manifest.version + " beta<br/>by Wassup789");
	else
		$(".version").html("Version " + manifest.version + "<br/>by Wassup789");
	
	var error = false;
	
	if(localStorage.getItem("domain") == null || localStorage.getItem("domain") == 0)
		localStorage.setItem("domain", "google");
	
	$(".urlSelect").val(localStorage.getItem("domain"));
	
	$("body").fadeIn("fast");	
	$(".cUrl").text("Shortening...");
	
	chrome.tabs.query({active: true, lastFocusedWindow: true}, function(callback) {
		var link = callback[0].url;
		if(isValidUrl(link)){
		$.ajax({
			async: false,
			type: "GET",
			dataType: "text",
			url: "http://data.wassup789.cz.cc/" + localStorage.getItem("domain") + "?url=" + encodeURIComponent(link),
			success: function(data) {
				$(".cUrl").text(data);
				if(data != "Too many requests")
					$(".cUrl").attr("href", data);
				$(".cUrl2").val(data);
				new QRCode(document.getElementsByClassName("qrCode")[0], {
					text: data,
					width: 150,
					height: 150
				});
				$(".qrCode").css("top", Math.max(0, (($(window).height() - $(".qrCode").outerHeight()) / 2) + $(window).scrollTop()) + "px");
				$(".qrCode").css("left", Math.max(0, (($(window).width() - $(".qrCode").outerWidth()) / 2) + $(window).scrollLeft()) + "px");
			}, error: function() {
				error = true;
				$("body").fadeIn("fast");
				$(".status").fadeIn("fast");
				$(".overlay").fadeIn("fast");
				$(".overlay").css("cursor", "default");
				$(".status").text("Could not connect to server");
				$(".status").css("text-shadow", "0 0 10px #FF0000");
				$(".status").css("top", Math.max(0, (($(window).height() - $(".status").outerHeight()) / 2) + $(window).scrollTop()) + "px");
				$(".status").css("left", Math.max(0, (($(window).width() - $(".status").outerWidth()) / 2) + $(window).scrollLeft()) + "px");
			}
		});
		}else{
			$(".cUrl").text("Invalid URL");
			error = true;
		}
	});
	
	$(document).on("click", "a", function(){
		if($(this).attr("href") != null)
			chrome.tabs.create({url: $(this).attr("href")});
	});
	
	$(document).on("click", ".clipBtn", function(){
		if(!error){
			$(".cUrl2").select();
			document.execCommand("SelectAll");
			document.execCommand("Copy");
			$(".btnOverlay").fadeIn("slow");
			$(".btnOText").text("Copied to Clipboard");
			$(".btnOverlay").delay(1000).fadeOut("slow");
		}
	});
	
	$(document).on("click", ".qrBtn", function(){
		if(!error)
			showQROverlay();
	});
	
	$(document).on("click", ".overlay", function(){
		if(!error)
			hideQROverlay();
	});

	$(document).on("click", ".qrCode", function(){
		if(!error)
			hideQROverlay();
	});
	
	function showQROverlay(){
		$(".overlay").fadeIn("fast");
		$(".qrCode").fadeIn("fast");
	}

	function hideQROverlay(){
		$(".overlay").fadeOut("fast");
		$(".qrCode").fadeOut("fast");
	}
	
	$(".urlSelect").change(function(){
		localStorage.setItem("domain", $(".urlSelect").val());
		$(".btnOverlay").fadeIn("slow");
		$(".btnOText").text("Set domain to " + $(".urlSelect").find(":selected").text());
		setTimeout(function(){
			window.location.reload()
		}, 1000);
	});
	function isValidUrl(value) {
		return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
	}
});