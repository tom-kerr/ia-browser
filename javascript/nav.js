
function home(action) {

    var map = document.getElementById('map_canvas');
    var loadSplash = document.getElementById('loadSplash');
    var book = document.getElementById('book');
    var list = document.getElementById('listDiv');
    var toggleView = document.getElementById('toggleView');
    var back = document.getElementById('back');
    var back_logo = document.getElementById('back-logo');
    var info = document.getElementById('info');

    if (loadSplash) 
	document.body.removeChild(loadSplash);  
    if (book) 
	document.body.removeChild(book);
    if (list) 
	document.body.removeChild(list);
    if (toggleView) 
	document.body.removeChild(toggleView);
    	        
    if (action==='map' || action === null || action === undefined) {
	destroyGrid();
	new Effect.Appear(map);
	back.innerHTML = '<a href="javascript:home();"> '+
	    '<img id="back-logo" src="images/ia-logo.png"></a>';
	info.style.visibility = 'visible';
    }    
    
    if (action==='init' || action==='collections') {
	
	back.innerHTML = '<a href="javascript:home(\'map\');">'+
	    '<img id="back-logo" src="images/ia-logo.png" >'+
	    '<div id="indicator" align="left"><b>B<br>A<br>C<br>K</b></div></a>';
	
	if (newSession.amount_loaded!=0) { 
	    newSession.identifiers = null;
	    newSession.prev_page = 0;
	    newSession.page = 1;
	    newSession.next_page = 2;
	    newSession.page_amount = 100;
	    newSession.amount_loaded = 0;  
	    newSession.rows = 0;
	    newSession.columns = 0;
	    newSession.globalStart = 0;
	    newSession.capacity =  10;
	}
	
	constructDoc();
	drawGrid();     
    }
}

function constructDoc() {
    
    for (var i=0; i < newSession.entries.length; i++) { 
	var body = document.body;
	var id = newSession.entries[i]["contributor"].split(' ');
	id = id.join('_');
	if (!document.getElementById(id)) {
	    var newLibDiv = document.createElement('div');
	} else {
	    var newLibDiv = document.getElementById(id);
	}
	newLibDiv.id = id;
	newSession.libraries[i] = newLibDiv.id;
	newSession.entries[i].contributor = newLibDiv.id;
	newLibDiv.className = "libraries";
	if (newSession.logos[newLibDiv.id]) { 
	    newLibDiv.innerHTML = '<a href=javascript:selectAnimate("'+newLibDiv.id+'");'+
		' class=icon><img id="'+newLibDiv.id+'LOGO" src="logos/zones/'+newSession.zone+'/'+
		newSession.logos[newLibDiv.id]['filename']+'"/></a>';
	} else {
	    newLibDiv.innerHTML = '<a href=javascript:selectAnimate("'+newLibDiv.id+'"); '+
		'class=icon><img src="images/no-logo.png"/></a>';
	}

	body.appendChild(newLibDiv);
    }
}

function drawGrid() {
    
    var left;
    var top;
    var i = 0;
    var dur = 1.0;
    
    var viewport = document.getElementById('logoViewPort');
    if (viewport===null) {
	var viewport = document.createElement('div');
	viewport.id = "logoViewPort";
	document.body.appendChild(viewport);
	var grid = document.createElement('div');
	grid.id = 'grid';
	viewport.appendChild(grid);
    } else {
	var grid = document.getElementById('grid');
    }
    
    while(i < newSession.entries.length) {  
	if (newSession.logos[newSession.libraries[i]]!=null) { 	    
	    if (newSession.logos[newSession.libraries[i]]["top"]!=null) {
		left = newSession.logos[newSession.libraries[i]]["left"];
		top = newSession.logos[newSession.libraries[i]]["top"];
	    } else {
		left = 500;//debug
		top = 100;//debug
	    }
	    
	    var lib = document.getElementById(newSession.libraries[i]);
	    grid.appendChild(lib);
	    
	    if (lib.style.display === "none") new Effect.Appear(lib); 
	    new Effect.Move(newSession.libraries[i], { x: left, y: top, mode: 'absolute', duration:dur }); 
	}    
	i++;
    }
    
    viewport.style.width = w;
    viewport.style.height = h-95;
    grid.style.width = w*4;
    grid.style.height = h-100;
    
    if (grid.ds === undefined) {
	jQuery('#logoViewPort').dragscrollable();
	grid.ds = true;
    }
}

function destroyGrid() {
    var i = 0;
    while(i<newSession.entries.length) { 
	new Effect.DropOut(newSession.libraries[i]);
	i++;
    }
    
    var viewport = document.getElementById('logoViewPort');
    if (viewport != undefined)
	document.body.removeChild(viewport);
}

function selectAnimate(library) {
    
    var viewport = document.getElementById('logoViewPort');
    
    var grid = document.getElementById('grid');
    var back = document.getElementById('back');
    back.innerHTML = '<a href="javascript:home(\'collections\');">'+
	'<img id="back-logo" src="images/ia-logo.png" ><div id="indicator" align="left"><b>B<br>A<br>C<br>K</b></div></a>';
    var i =0;
    while(i<newSession.entries.length) {
	if (newSession.libraries[i] != library) {
	    new Effect.DropOut(newSession.libraries[i]);
	} else {
	    
	    var lib = document.getElementById(newSession.libraries[i]);
	    var tmp = lib;
	    var libleft = lib.left;
	    grid.removeChild(lib);
	    tmp.style.left = libleft + viewport.scrollLeft; 
	    document.body.appendChild(tmp);
	    new Effect.Move(newSession.libraries[i], { x: 0, y: 0, mode: 'absolute', duration:1.0 });          
	    var img = newSession.libraries[i].concat("LOGO"); 
	    var scale;
	    var h_scale = 100 / newSession.logos[newSession.libraries[i]].height;
	    var w_scale = ((w*.3)-75) / newSession.logos[newSession.libraries[i]].width;
	    
	    if (h_scale < w_scale)
		scale = h_scale;
	    else
		scale = w_scale;
	    
	    if ( (newSession.logos[newSession.libraries[i]].height > 100) || 
		 (newSession.logos[newSession.libraries[i]].width  > ((w*.3)-75)) ) { 
		var width = newSession.logos[newSession.libraries[i]].width*scale;
		var height = newSession.logos[newSession.libraries[i]].height*scale;
		new Effect.Morph(img, { style: { width:width+'px', height:height+'px' } });
	    } 
	}

	i++;
    }
    
    getLatest(library,null);
}


function getLatest(library,start) {
    
    var list_load = null; 
    if (start===null) start = 0;
    
    var bookdiv = document.getElementById("book");
    var tableDiv = document.getElementById("tableDiv");
    if (tableDiv!=null) 
	tableDiv.innerHTML = '<div class="bookLoad" align="center"><h2>Waiting for Response...'+
	'<h2><img class="load" src="gifs/bar.gif"/> </div>';
    if (bookdiv===null) {
	var bookdiv = document.createElement("div");
	bookdiv.id = 'book';
	bookdiv.innerHTML = '<div class="bookLoad" align="center"><h2>Waiting for Response...'+
	    '<h2><img class="load" src="gifs/bar.gif"/> </div>';
	document.body.appendChild(bookdiv);
    } 
    
    for (var a=0; a < newSession.entries.length; a++) {
	if (newSession.entries[a].contributor === library) {
	    var collections = newSession.entries[a].collections;
	}
    }
    
    params = 'zone='+newSession.zone+'&contributor='+library+'&collections='+JSON.stringify(collections)+'&page='+newSession.page+'&page_amount='+newSession.page_amount; 
    
    new Ajax.Request('getLatest.php', {
	method:'get',
        parameters:params,
        onSuccess:function(transport) {
            if (newSession.page === 1) {  
		bookdiv.innerHTML = '<div class="bookLoad" align="center">'+
		    '<h2>Loading...<h2><img class="load" src="gifs/bar.gif"/>  </div>';        
            }
            var response = transport.responseText;         
            if (response==="No items Found.") {
		bookdiv.innerHTML = '<div class="bookLoad"><h2>'+response+'<h2>  </div>';
		return;
            }
            var idstmp = eval('('+response+')');   
            var total = idstmp.pop();
            var num_response = idstmp.length; 
            newSession.amount_loaded += num_response;
            
            if (num_response < newSession.page_amount) { 
		var list_load = num_response; 
            } 
            
            if (newSession.identifiers != null) { 
		newSession.identifiers = newSession.identifiers.concat(idstmp);
            } else { 
		newSession.identifiers = idstmp; 
		var selected = newSession.identifiers[0];
            }
            
            if (newSession.page === 1) { 
		var booktmp = document.createElement('div');
		booktmp.id = "booktmp";
		booktmp.style.visibility = 'hidden';
		booktmp.style.width = w*0.7;
		booktmp.innerHTML = '<iframe src=http://www.archive.org/stream/' +
		    selected+' width=100% height=100% onload="javascript:loadBook();" >'; 
		document.body.appendChild(booktmp);
		handleList(library,start,total,list_load);
            } else {
		handleList(library,start,total,list_load);
            }
            
            var toggleView = document.getElementById("toggleView");
            if (toggleView===null) {
		var toggleView = document.createElement("div");
		toggleView.id = 'toggleView';
		toggleView.style.left = (w*.30) - 45 + 'px';
		toggleView.innerHTML = '<a href=javascript:toggleView("Browse","'+
		    library+'","'+newSession.globalStart+'","'+total+'");> '+
		    '<img src="images/rightArrow.png"> </a>';
		document.body.appendChild(toggleView);
            }
	}
    });       
}

function handleList(library,start,total,load) {
    
    newSession.globalStart = start;
    
    var listDiv = document.getElementById("listDiv");
    if (listDiv===null) {
	var listDiv = document.createElement("div");
	listDiv.id = 'listDiv';
	var listH = window.innerHeight-200; 
	var listW = window.innerWidth*0.3;
	listDiv.style.height = listH;
	listDiv.style.width = listW;
	listDiv.style.overflow = "hidden";
	var tableDiv = document.createElement("div");
	tableDiv.id = 'tableDiv';
	tableDiv.style.height = window.innerHeight-300;
	listDiv.appendChild(tableDiv);   
    } else {
	var listH = listDiv.style.height; 
	var listW = listDiv.style.width; 
	listH = listH.split('px',1);
	listW = listW.split('px',1);
	var tableDiv = document.getElementById('tableDiv');   
	tableDiv.innerHTML = null;
    }
    
    var table = document.createElement("table");
    table.id = 'listTable';
    tableDiv.appendChild(table);
    
    var coverWidth = 60;
    var coverHeight = 100;
    
    newSession.columns = Math.round(listW/(coverWidth*2));
    newSession.rows = Math.floor(listH/(coverHeight*2));
    var capacity = newSession.rows * newSession.columns;
    if (capacity > newSession.page_amount)
	newSession.page_amount = capacity*2;
    if (load===null) { 
	load = capacity;
    } else { 
	var current = start + capacity;
	var left = total - start;
	if (left <= capacity) { 
	    load = left; 
	} else { 
	    load = left - (left - capacity); 
	}
    }
    
    var x = start; 
    
    for (i=0; i < load; i++) {
	if (i%newSession.columns===0) {
	    var tr = document.createElement("tr");
	    tr.id = 'row-'+i;
	    tr.style.width="100%";
	    tr.style.height=100/newSession.rows + '%';
	    if (i===0) { 
		tr.style.top = "0px";
		tr.style.position = 'absolute';
	    }
	    table.appendChild(tr);
	} 
	
	td = document.createElement("td");
	td.style.position = 'absolute';
	td.style.width = 100/newSession.columns + '%';;   
	td.style.height = "100%";
	var div = document.createElement('div');
	div.id = 'port-'+i;
	div.align = "center";
	div.innerHTML = '<img class="load" src="gifs/dots.gif" style="position:relative;top:50px;" />';
	td.appendChild(div);
	var numeric = total - x;
	td.style.position = "absolute"; 
	td.style.left = (((100/newSession.columns) * (i%newSession.columns))) + '%';
	tr.appendChild(td);
	var url = 'http://www.archive.org/download/'+newSession.identifiers[x]+'/page/cover_thumb.jpg';
	var tmp = document.createElement('div');
	tmp.id = 'tmp-'+i;
	tmp.style.visibility = 'hidden'; 
	tmp.innerHTML = '<a href="javascript:handleBook(\''+newSession.identifiers[x]+'\');" '+
	    'class="cover_thumb"> <div style="height:20px;"><h5>'+numeric+'</h5></div>  '+
	    '<img src='+url+' onload="javascript:loadImage(\''+i+'\');" id="'+newSession.identifiers[x]+
	    '" width='+coverWidth+'px height='+coverHeight+'px />  </a>';
	//<h6>'+newSession.identifiers[x]+'</h6>
	document.body.appendChild(tmp); 
	x++; 
    }
    
    //setSeekers(library,page,x,load,start,capacity,total);
    
    var moreDiv = document.getElementById('moreDiv');
    if(moreDiv===null) {
	var moreDiv = document.createElement('div');
	moreDiv.id = 'moreDiv';
    }
    
    var lessDiv = document.getElementById('lessDiv');
    if(lessDiv===null) {
	var lessDiv = document.createElement('div');
	lessDiv.id ='lessDiv';
    }
    
    var lessLoad = capacity;
    var prev = start - lessLoad;
    if (prev < 0 ){
	lessLoad += prev; 
	prev = 0;
    }
    lessDiv.innerHTML = '<button onclick=javascript:getLess("'+
	library+'",\''+prev+'\',\''+lessLoad+'\',\''+total+'\'); id="lessButton" '+
	'style="height:50px; width:100%;" ><h2 valign="middle">'+lessLoad+' back</h2></a></button>';
    listDiv.appendChild(lessDiv);    
    document.body.appendChild(listDiv);
    
    var lessButton = document.getElementById('lessButton');
    if (start===0) lessButton.disabled = true;
    else  lessButton.disabled = false;
    
    if( x + load > total) { 
	load -= (x+load) - total;   
    }  
    moreDiv.innerHTML = '<button onclick=javascript:getMore("'+
	library+'",\''+x+'\',\''+load+'\',\''+total+'\'); id="moreButton" '+
	'style="height:50px; width:100%;" ><h2 valign="middle">'+load+' more</h2></a></button>';
    listDiv.appendChild(moreDiv);
    
    var moreButton = document.getElementById('moreButton');
    if (load === 0) { moreButton.disabled = true; }
    
}


function loadBook() {
    var bookdiv = document.getElementById('book');
    var booktmp = document.getElementById('booktmp');
    
    if (booktmp!=null) {    
	bookdiv.innerHTML = booktmp.innerHTML;
	document.body.removeChild(booktmp);
    }
}

function destroyOverlay() {
    var metaOverlay = document.getElementById("metaOverlay");
    var metaDetailsOverlay = document.getElementById("metaDetailsOverlay");
    document.body.removeChild(metaDetailsOverlay);
    document.body.removeChild(metaOverlay);
}

function readBook(id) {
    destroyOverlay();
    var bookdiv = document.getElementById("book");  
    bookdiv.innerHTML = '<div class="bookLoad" align="center"> '+
	'<h2>Loading...</h2><img class="load" src="gifs/bar.gif"/> </div>'; 
    var booktmp = document.createElement('div');
    booktmp.id = "booktmp";
    booktmp.style.visibility = 'hidden';
    booktmp.style.width = bookdiv.style.width;
    booktmp.innerHTML = '<iframe onload="javascript:loadBook();" '+
	'src="http://www.archive.org/stream/' +id+ '" width=100% height=100% >'; 
    document.body.appendChild(booktmp);
}

function handleBook(id) {
    var img = '<img src="http://www.archive.org/download/'+id+
	'/page/cover_medium.jpg" class="cover_large" width="25%" height="60%"/>';
    var metaOverlay = document.createElement('div');
    metaOverlay.setAttribute("class","metaOverlay");
    metaOverlay.setAttribute("id","metaOverlay");
    metaOverlay.style.display = 'none';
    var metaDetailsOverlay = document.createElement('div');
    metaDetailsOverlay.style.display = 'none';
    metaDetailsOverlay.setAttribute("class", "metaDetailsOverlay");
    metaDetailsOverlay.setAttribute("id","metaDetailsOverlay");
    metaDetailsOverlay.innerHTML = img;  
    var idHeader = document.createElement('div');
    idHeader.innerHTML = '<span style="color:slategray;"><h2>'+id+'</h2></span>';
    idHeader.style.position = 'inherit';
    idHeader.style.left = '10%';
    metaDetailsOverlay.appendChild(idHeader);
    var details = document.createElement('div');
    details.setAttribute("class","details");
    metaDetailsOverlay.appendChild(details);
    var close = document.createElement('div');
    close.style.position = 'inherit';
    close.style.top = '0px';
    close.style.right = '0px';
    close.innerHTML = '<a href="javascript:destroyOverlay();" style="color:#EEAD0E"><b>Close</b></a>';
    metaDetailsOverlay.appendChild(close);
    var detailsTable = document.createElement('div');
    var table = document.createElement('table');
    table.style.overflow = 'auto';
    table.style.color = '#A39480';
    detailsTable.appendChild(table);
    details.appendChild(detailsTable);
    var read = document.createElement('div');
    read.style.position = 'inherit';
    read.style.left = '10%';
    read.style.bottom = '10%';
    read.innerHTML = '<a href="javascript:readBook(\''+id+'\');" style="color:#856363"><b><h1>Read</h1></b></a>';
    metaDetailsOverlay.appendChild(read);
    document.body.appendChild(metaDetailsOverlay);
    document.body.appendChild(metaOverlay);
    new Effect.Appear(metaOverlay);
    new Effect.Appear(metaDetailsOverlay);
    
    params = 'identifier='+id;
    new Ajax.Request('getItemMetaData.php', {
	method:'get',
        parameters:params,
        onSuccess:function(transport) {
            var response     = transport.responseText;
            var detailsJSON  = JSON.parse(response);
	    var metafields = new Array("title", 
				       "creator",
				       "description",
				       "publisher",
				       "date",
				       "language",
				       "sponsor",
				       "contributor",
				       "addeddate",
				       "ppi",
				       "camera",
				       "operator",
				       "scanner",
				       "imagecount",
				       "foldoutcount");

	    var field;
	    for (i=0;i<metafields.length;i++) {
		field = metafields[i];
		value = detailsJSON[field];
		if (value!=null) {
		    field: value;
		    var tr = document.createElement('tr');
		    tr.innerHTML = '<b class="metaField";>'+field+':</b>'+value;
		    table.appendChild(tr);
		}

	    }
	}
    });
    
}

function loadImage(i){
    var id = 'tmp-'+i; 
    var tmp = document.getElementById(id); 
    if (tmp!=null) {
	var x = tmp.innerHTML; 
	id = 'port-'+i; 
	var td = document.getElementById(id);
	td.innerHTML = x; 
	document.body.removeChild(tmp);  
    }
}

function getMore(library,start,load,total) {
    var start = parseInt(start); 
    newSession.globalStart = start;
    var load = parseInt(load); 
    if (start + load > newSession.amount_loaded) { 	
	load = null; 
	newSession.prev_page=newSession.page;
	newSession.page=newSession.next_page; 
	newSession.next_page++;	
	getLatest(library,start,load);
    } else {
	if (start+load === total) {
	    handleList(library,start,total,load); 
	} else if (start+load > total) {
	    load = (start+load) - ((start+load)-total);
	    handleList(library,start,total,load); 
	} else {
	    handleList(library,start,total);
	}
    }
    
    var moreButton = document.getElementById('moreButton');
    if (start+load >= total) { moreButton.disabled = true; }
    
}

function getLess(library,start,load,total) {
    var start = parseInt(start); 
    newSession.global_start = start;
    var load = parseInt(load);    
    handleList(library,start,total,load);
}

function toggleView(view,library,start,total) {
    start = newSession.globalStart;
    var load = null;
    var capacity = newSession.rows * newSession.columns;
    if (start + capacity > total) load = total;
    
    var listDiv = document.getElementById('listDiv');
    var book = document.getElementById('book');
    var toggleView = document.getElementById('toggleView');
    var refresh = setTimeout('handleList("'+library+'",\''+start+'\',\''+total+'\',\''+load+'\')', 1500);
    
    if (view==="Browse") { 
	new Effect.Morph('book', { style: 'width:'+window.innerWidth*0.3+'', 
				   duration: 0.5 });
	new Effect.Morph('listDiv', { style: 'width:'+window.innerWidth*0.7+'', 
				      duration: 0.5 }, { afterFinish:refresh });     
	var p = (w*.70) - 45 + 'px';
	new Effect.Morph('toggleView', { style: 'left: '+p+' ', 
					 duration: 0.5 });      
	toggleView.innerHTML ='<a href=javascript:toggleView("Read","'+
	    library+'","'+start+'","'+total+'");> <img src="images/leftArrow.png"> </a> '; 
    }
    
    if (view==="Read") {
	new Effect.Morph('book', { style: 'width:'+window.innerWidth*0.7+'', 
				   duration: 0.5 });
	new Effect.Morph('listDiv', { style: 'width:'+window.innerWidth*0.3+'', 
				      duration: 0.5 }, { afterFinish:refresh});     
	var p = (w*.30) - 45 + 'px';
	new Effect.Morph('toggleView', { style: 'left: '+p+' ', 
					 duration: 0.5 });
	toggleView.innerHTML ='<a href=javascript:toggleView("Browse","'+
	    library+'","'+start+'","'+total+'");> <img src = "images/rightArrow.png"> </a> '; 
    }
}