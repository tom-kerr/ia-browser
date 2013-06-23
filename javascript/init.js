
var newSession = new Session();
var w = window.innerWidth;
var h = window.innerHeight;

function init() {
    newSession.initMap();
}

function Session() {
    
    var session = this;
    this.zone = null;
    this.libraries = {};
    this.entries = {};
    this.logos;
    this.JSON = null;
    this.logoURL = {};
    this.identifiers = null;
    this.prev_page = 0;
    this.page = 1;
    this.next_page = 2;
    this.page_amount = 100;
    this.amount_loaded = 0;  
    this.rows = 0;
    this.columns = 0;
    this.globalStart = 0;
    this.capacity =  10;
    
    this.identifyZone = function() {
	var zone = ''+window.location.search+'';
	if (zone) session.zone = zone.split('=')[1]; 
	else session.zone = location.hostname.split(".")[1];  
    };
    
    this.initMap = function() {
	var map = document.getElementById('map_canvas');
	map.style.height = h-104;
	buildMap();
    }  
    
    this.getCollectionList = function() {
	
	var map = document.getElementById('map_canvas');
	map.style.display = 'none';
	var info= document.getElementById('info');
	info.style.visibility = 'hidden';
	var init = document.createElement("div");
	init.style.display = 'none';
	init.innerHTML = '<div id="loadSplash"><div align="center">'+
	    '<table><td><img class="load" src="gifs/globe.gif"/></td>'+
	    '<td><h2>Retrieving<br>Collection Data for<br><span style="color:white;">'+session.zone+
	    '...</span?<h2></td></div></div>';
	document.body.appendChild(init);
	new Effect.Appear(init);
	var url = '/ia-browser/getCollections.php'; 
	params = 'zone=' + session.zone + '&w='+w+ '&h='+h;
	new Ajax.Request(url, 
			 { method:'get',
			   parameters:params,
			   onSuccess:function(transport) {
			       var response = transport.responseText;
			       if (response=='There was a problem retrieving the collection information for '+
				   session.zone+'...' ||
				   response=='No Collections Found') {
				   alert(response);
				   init.style.display = 'none';
				   info.style.visibility = 'visible';
				   new Effect.Appear(map);
			       } else {
				   document.body.removeChild(init);
				   session.JSON = JSON.parse(response);      
				   session.entries = session.JSON['entries'];
				   session.logos   = session.JSON['logos'];
				   home('init');   
			       }       
			   }
			 }  
			);
    };
}

