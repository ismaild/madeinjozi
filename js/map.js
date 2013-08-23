
var thisGmap = null;

$(document).ready(function(){
	thisGmap = new Gmap();
	thisGmap.initializeMap();
	configureEvents();
	// initialize();  
});

function initialize() {  
  var mapOptions = {
    zoom: 11,
    center: johannesburg,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

function configureEvents(){

	$("#startups").click(function(){
		url = "/startups.json";
		// getMarkers(url);
		icon = "img/notebook.png";
		thisGmap.addMarkersToMap(startups,false,icon,thisGmap.generateStartupInfoWindow);
	});

	$("#vcs").click(function(){
		url = "/vcs.json";
		// getMarkers(url);
		icon = "img/dollar.png";
		thisGmap.addMarkersToMap(vcs,false,icon,thisGmap.generateVCInfoWindow);

	});

	$("#incubators").click(function(){
		url = "/incubators.json";
		// getMarkers(url);
		icon = "img/rocket.png";
		thisGmap.addMarkersToMap(incubators,false,icon,thisGmap.generateIncubatorInfoWindow);
	});

	$("#coworking").click(function(){
		url = "/coworking.json";
		// getMarkers(url);
		icon = "img/coworking.png";
		thisGmap.addMarkersToMap(coworking,false,icon,thisGmap.generateCoworkingInfoWindow);
	});
}

function getMarkers(url){
	$('#map-status').html("Loading markers...");
	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		success: function(data)
		{
			thisGmap.addMarkersToMap(data,false);
			$('#map-status').html("");
		},
		error: function(xhr, status, error) {
			$('#map-status').html("error: " + xhr.status + error + ' ' + xhr.responseText);
		}
	});
}

function Gmap() {
  this.currZoomLevel = 0;
  this.prevZoomLevel = 0;
  this.map = null;
  this.clusterManager = new ClusterManager(null);
  this.markerCluster = null;
  this.markerClusterOptions = null;
  this.filteredMarkers = [];
  this.markers = [];
  this.data = null;
  var infowindow = null;
  this.currMarker = null;
  this.lastFocusedMarker = null;
}


Gmap.prototype.initializeMap = function () {
  var myLatlng = new google.maps.LatLng(-26.171452, 28.045488);
  var myOptions = {
      zoom: 13,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  	}
  this.map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
  this.clusterManager.setMap(this.map);
  this.currZoomLevel = this.clusterManager.currZoomLevel = this.map.getZoom();
}

Gmap.prototype.addMarkersToMap = function (result,cluster,icon,infowindowFunction){
	this.clearMarkers();
  var points = eval(result);
  console.log(points);
  this.data = result;
  this.markers = [];
  var self = this;
  $.each(points, function (i, row) {
  	if(row.coordinates == null){
  		return true;
  	}
    var myLatlng = new google.maps.LatLng(row.coordinates[1], row.coordinates[0]);
    var marker = new google.maps.Marker({
        position: myLatlng,
        icon: icon,
        zIndex: 1,
        point: row,
        map: self.map
    });
    self.markers.push(marker);
    google.maps.event.addListener(marker, 'click', function () {
        //close any open infowindow first
        if (self.infowindow) {
            self.infowindow.close();
        }
        self.infowindow = new google.maps.InfoWindow({
            maxWidth: 500,
            content: infowindowFunction(row)
        });
        self.currMarker = marker;
        self.infowindow.open(self.map, marker);
    });
  });

	if (cluster){
	    this.markerClusterOptions = {
        maxZoom: 15,
        gridSize: 30,
        styles: null
    };

    this.markerCluster = new MarkerClusterer(this.map, this.markers, this.markerClusterOptions);
    this.markerCluster.fitMapToMarkers();
	}

}

Gmap.prototype.clearMarkers = function() {
  for (var i = 0; i < this.markers.length; i++ ) {
    this.markers[i].setMap(null);
  }
}

Gmap.prototype.generateStartupInfoWindow = function(item) {
	var content = "<strong style=\"color: #455965\">Name:</strong><strong style=\"color: #993300\"> " + 
							item.company + "</strong><br/>" +
							"<strong style=\"color: #455965\">Website:</strong><strong style=\"color: #993300\"> " + 
							item.website + "</strong><br/>" +
							"<strong style=\"color: #455965\">Founders:</strong><strong style=\"color: #993300\"> " + 
							item.founders+ "</strong><br/>" +
							"<strong style=\"color: #455965\">Launch Date:</strong><strong style=\"color: #993300\"> " + 
							item.launchDate+ "</strong><br/>" +
							"<strong style=\"color: #455965\">Description:</strong><strong style=\"color: #993300\"> " + 
							item.description + "</strong><br/>";
    content += "<hr>";
    return content;
}

Gmap.prototype.generateVCInfoWindow = function(item) {
	var content = "<strong style=\"color: #455965\">Name:</strong><strong style=\"color: #993300\"> " + 
							item.company + "</strong><br/>" +
							"<strong style=\"color: #455965\">Website:</strong><strong style=\"color: #993300\"> " + 
							item.website + "</strong><br/>" +
							"<strong style=\"color: #455965\">Capital Type:</strong><strong style=\"color: #993300\"> " + 
							item.capitalType+ "</strong><br/>" ;
    content += "<hr>";
    return content;
}

Gmap.prototype.generateIncubatorInfoWindow = function(item) {
	var content = "<strong style=\"color: #455965\">Name:</strong><strong style=\"color: #993300\"> " + 
							item.company + "</strong><br/>" +
							"<strong style=\"color: #455965\">Website:</strong><strong style=\"color: #993300\"> " + 
							item.website + "</strong><br/>" +
							"<strong style=\"color: #455965\">Startup Stage:</strong><strong style=\"color: #993300\"> " + 
							item.stage + "</strong><br/>" +
							"<strong style=\"color: #455965\">Type:</strong><strong style=\"color: #993300\"> " + 
							item.type + "</strong><br/>" +
							"<strong style=\"color: #455965\">Capital Type:</strong><strong style=\"color: #993300\"> " + 
							item.capitalType+ "</strong><br/>" ;
    content += "<hr>";
    return content;
}

Gmap.prototype.generateCoworkingInfoWindow = function(item) {
	var content = "<strong style=\"color: #455965\">Name:</strong><strong style=\"color: #993300\"> " + 
							item.company + "</strong><br/>" +
							"<strong style=\"color: #455965\">Website:</strong><strong style=\"color: #993300\"> " + 
							item.website + "</strong><br/>";
    content += "<hr>";
    return content;
}


function ClusterManager(map) {
  this.map = map;
  this.zones = [];
  this.currZoomLevel = 0;
}

ClusterManager.prototype.setMap = function (map) {
  this.map = map;
}

var startups = [{"company":"ChowHub",
								"website":"www.chowhub.co.za",
								"founders":"Ismail Dhorat, Alireza Sadeghi",
								"launchDate":"2013/02/01",
								"logo:":"logo",
								"description":"Online Food Ordering",
								"coordinates":["28.045488","-26.171452"]},
								{"company":"Cirqls",
								"website":"www.cirqls.com",
								"founders":"Mark, Donavan",
								"launchDate":"2013/02/15",
								"logo:":"logo",
								"description":"Social Marketplace",
								"coordinates":["28.048000","-26.175052"]}
							];

var vcs = [{"company":"Angel Hub",
								"website":"www.angelhub.co.za",
								"capitalType":"Seed Capital",
								"logo:":"logo",
								"coordinates":["28.047488","-26.181452"]},
								{"company":"Grovest",
								"website":"www.grovest.co.za",
								"capitalType":"Seed and Growth Capital",
								"logo:":"logo",
								"coordinates":["28.049200","-26.176052"]}
							];

var incubators = [{"company":"Seed Engine",
								"website":"www.seedengine.co.za",
								"stage":"idea stage",
								"type":"Accelerator",
								"logo:":"logo",
								"coordinates":["28.043488","-26.182452"]},
								{"company":"Incubator",
								"website":"www.incubator.co.za",
								"stage":"Seed and Growth stage",
								"type":"Incubator",
								"logo:":"logo",
								"coordinates":["28.047200","-26.174052"]}
							];

var coworking = [{"company":"Seed Engine",
								"website":"www.seedengine.co.za",
								"logo:":"logo",
								"coordinates":["28.043488","-26.182452"]},
								{"company":"JoziHub",
								"website":"www.jozihub.co.za",
								"logo:":"logo",
								"coordinates":["28.047200","-26.174052"]}
							];