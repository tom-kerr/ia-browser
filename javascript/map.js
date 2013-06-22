

var zoomMapByRegion = function () {

    var regions = {'us_canada': {'lat': 40,
				 'lng': -95,
				 'zoom': 4},
		   'east': {'lat': 40.5,
			    'lng': -70,
			    'zoom': 6},
		   'midwest': {'lat': 41.5,
			       'lng': -90,
			       'zoom': 7},
		   'west': {'lat': 38,
			    'lng': -119,
			    'zoom': 6},
		   'south_america': {'lat': 3.5,
				     'lng': -74.5,
				     'zoom': 5},
		   'europe': {'lat': 52,
			      'lng': 20,
			      'zoom': 5},
		   'middle_east': {'lat': 39.5,
				   'lng': 50,
				   'zoom': 5},
		   'asia_pacific': {'lat': 14,
				    'lng': 145,
				    'zoom': 4},	
		  };

    return function (region) {
	var lat;
	var lng;
	var zoom;

	if (regions[region]) {
	    lat = regions[region]['lat'];
	    lng = regions[region]['lng'];
	    zoom = regions[region]['zoom'];
	}

	buildMap(lat,lng,zoom);
    };

}();


var scanningCenter = function () {

    var loadString = '<div align="center" style="height:100px;"><h3>'+
        '<a href="javascript:newSession.getCollectionList();"'+
        'style="color:goldenrod;">Browse Collections</a></h3></div>';

    return function (name, title, lat, lng, map) {
        var zone = name
        this.title = title;
        this.string = '<div align="center"><b><h2>'+this.title+'</h2></b>'+loadString;
        this.lat = lat;
        this.lng = lng;
        this.location = new google.maps.LatLng(this.lat, this.lng);

        var window = new google.maps.InfoWindow({ content: this.string });
        var marker = new google.maps.Marker({ position: this.location,
                                              map: map,
                                              title: this.title
                                            });

        google.maps.event.addListener(marker, 'click', function() {
            newSession.zone = zone;
            window.open(map, marker);
        });

    };

}();


function buildMap(lat,lng,zoom) {
    
    if (lat==null && lng==null && zoom==null) {
	lat  = 25;//20;
	lng  = -30; //-120;
	zoom = 2;
    }

    var latlng = new google.maps.LatLng(lat, lng);

    var myOptions = {
	zoom: zoom,
	center: latlng,
	mapTypeId: google.maps.MapTypeId.SATELLITE
    };
    
    var map = new google.maps.Map(document.getElementById("map_canvas"),
                                  myOptions);

            
    centers = [new scanningCenter('alberta',
				  'Alberta Satellite at the University of Alberta Libraries',
				  52.5369, -113.5235, map),
	       new scanningCenter('amherst',
				  'Amherst Satellite at the National Yiddish Book Center',
				  42.324,-72.527, map),
	       new scanningCenter('bali',
				  'Bali Satellite at Sanur, Denpasar, Bali, Indonesia',
				   -8.40,115.19, map),
	       new scanningCenter('beijing',
				  'Beijing Satellite at the Fenghong Liu Library Building Institute of Botany',
				  40.0,116.2, map),
	       new scanningCenter('boston',
				  'Boston Scanning Center at the Boston Public Library',
				  42.34935,-71.0784, map),
	       new scanningCenter('capitolhill',
				  'Capitol Hill Scanning Center at the Library of Congress',
				  38.883878,-77.0047, map),
	       new scanningCenter('chapelhill',
				  'Chapel Hill Satellite at the Wilson Library',
				  35.90886,-79.0498, map),
	       new scanningCenter('durham',
				  'Durham Satellite at the Perkins Library',
				  36.0030,-78.9383, map),
	       new scanningCenter('edinburgh',
				  'Edinburgh Satellite at the National Library of Scotland',
				  55.9371,-3.1800, map),
	       new scanningCenter('egypt',
				  'Internet Archive at the Library of Alexandria',
				  31.2095,29.9091, map),
	       new scanningCenter('guatemala',
				  'Guatemala Satellite at the Universidad Francisco Marroquín',
				  14.608,-90.506, map),
	       new scanningCenter('hangzhou',
				  'Hangzhou Scanning Center',
				  30.281,120.156, map),
	       new scanningCenter('honolulu',
				  'Honolulu Satellite at the Brigham Young University',
				  21.6418,-157.9253, map),
	       new scanningCenter('il',
				  'Illinois Satellite at the Oak Street Library',
				  40.1085,-88.2412, map),
	       new scanningCenter('indiana',
				  'Indiana Scanning Center at the Allen County Public Library',
				  41.0773,-85.1428, map),
	       new scanningCenter('la',
				  'Los Angeles Scanning Center at 737 Terminal St',
				  34.03529,-118.2402, map),
	       new scanningCenter('london',
				  'London Satellite at the National History Museum',
				  51.4957,-0.1764, map),
	       new scanningCenter('losangeles',
				  'Los Angeles Scanning Center at the Los Angeles County Museum of Art',
				  34.0639,-118.3578, map),
	       new scanningCenter('manhattan',
				  'Manhattan Satellite at the Archive of Contemporary Music',
				  40.7186,-74.0037, map),
	       new scanningCenter('maryland',
				  'Maryland Satellite at John Hopkins University',
				  39.3297,-76.6208, map),
	       new scanningCenter('nj',
				  'Princeton Scanning Center at Princeton Theological Seminary - Speer Library',
				  40.3454,-74.6666, map),
	       new scanningCenter('nyc',
				  'Jersey City Scanning Center',
				  40.7195,-74.0461, map),
	       new scanningCenter('providence',
				  'Providence Satellite at the John Carter Brown Library',
				  41.8257,-71.4026, map),
	       new scanningCenter('provo',
				  'Provo Satellite at the Harold B. Lee Library',
				  40.2489,-111.6492, map),
	       new scanningCenter('raleigh',
				  'Raleigh Satellite at North Carolina State University',
				  35.7850,-78.6726, map),
	       new scanningCenter('rexburg',
				  'Rexburg Satellite at Byu-Idaho',
				  43.8219,-111.7838, map),
	       new scanningCenter('rich',
				  'Richmond Storage Facility',
				  37.937,-122.348, map),
	       new scanningCenter('sacramento',
				  'Sacramento Satellite',
				  38.583,-121.494, map),
	       new scanningCenter('saltlakecity',
				  'Salt Lake City Satellite at the Church History Library',
				  40.7724,-111.8905, map),
	       new scanningCenter('sanfrancisco',
				  'San Francisco Scanning Center at 300 Funston',
				  37.78325,-122.4716, map),
	       new scanningCenter('santamonica',
				  'Santa Monica Satellite at the Getty Research Institute',
				  34.07917,-118.4744, map),
	       new scanningCenter('sfciviccenter',
				  'San Francisco Civic Center Satellite',
				  37.7829,-122.4198, map),
	       new scanningCenter('sfdowntown',
				  'San Francisco Scanning Center at the San Francisco Public Library',
				  37.799,-122.416, map),
	       new scanningCenter('shenzhen',
				  'Shenzhen Scanning Center',
				  22.5621,114.0379, map),
	       new scanningCenter('sheridan',
				  'San Francisco Scanning Center at 116 Sheridan',
				  37.77229,-122.4119, map),
	       new scanningCenter('toronto',
				  'Toronto Scanning Center at Robarts Library',
				  43.6645,-79.3994, map),
	       new scanningCenter('washingtondc',
				  'Washington DC Satellite at the Smithsonian Insitution Libraries',
				  38.89214,-76.9927, map),
	      ];

}
