$(document).ready(function(){
	var logger = window.console.log;
	window.console.log = function(){};
	
	var manifest = chrome.runtime.getManifest();
	
	var beta = true;
	if(beta)
		$(".version").html("Version " + manifest.version + " beta<br/>by Wassup789");
	else
		$(".version").html("Version " + manifest.version + "<br/>by Wassup789");
	
	var error = false;
	
	if(localStorage.getItem("domain") == null || localStorage.getItem("domain") == 0)
		localStorage.setItem("domain", "tinyurl");
	
	$(".urlSelect").val(localStorage.getItem("domain"));
	
	chrome.tabs.query({active: true, lastFocusedWindow: true}, function(callback) {
		var link = callback[0].url;
		$.ajax({
			async: false,
			type: "GET",
			dataType: "text",
			url: "http://data.wassup789.cz.cc/" + localStorage.getItem("domain") + "?url=" + encodeURIComponent(link),
			success: function(data) {
				$("body").fadeIn("fast");
				
				$(".cUrl").html(data);
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
	});
	
	$(document).on("click", "a", function(){
		if($(this).attr("href") != "" || $(this).attr("href") != null)
			chrome.tabs.create({url: $(this).attr("href")});
	});
	
	$(document).on("click", ".clipBtn", function(){
		$(".cUrl2").select();
		document.execCommand("SelectAll");
		document.execCommand("Copy");
		$(".btnOverlay").fadeIn("slow");
		$(".btnOText").text("Copied to Clipboard");
		$(".btnOverlay").delay(1000).fadeOut("slow");
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
});