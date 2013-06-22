<?

class Env {
  
  static $zone;
  static $window_width;
  static $window_height;
  static $max_area = 67500;
  static $max_height = 70;
  static $max_width = 400;
  static $logo_dir  = null;
}

Env::$zone = $_REQUEST['zone'];
Env::$window_width = $_REQUEST['w'];
Env::$window_height = $_REQUEST['h'];
Env::$logo_dir .= getcwd()."/logos/zones/".Env::$zone;    

$raw_data = get_raw_collection_data();
$entries = [];
$entries['entries'] = parse_collection_data($raw_data);
$entries["logos"] = get_logos($entries);
encode_and_emit_json($entries);  


function get_raw_collection_data() {
  $url  = 'http://yaz.us.archive.org/biblio.php?f=biblio_ws&collections_list=1&center='.Env::$zone;
  if (Env::$zone == "Bali") 
    $json = '[{"sponsor":"Internet Archive","contributor":"Bali","collections":["Bali"]}]';
  else
    $json = file_get_contents($url);
  if (!$json) {
    echo "There was a problem retrieving the collection information for Env::$zone...";
    exit(0);
  }
  if ($json==="[]") {
    echo "No Collections Found";
    exit(0);
  }
  
  return json_decode($json,true);
}

function encode_and_emit_json($array) {
  $json = json_encode($array);
  echo $json;
}


function parse_collection_data($raw_data) {
  $contributors = [];
  $entries = [];
  foreach ($raw_data as $array) {
    $collection_string = implode(';', $array["collections"]);
    $array["contributor"] = preg_replace("/(\/|\(|\)|&|\'[a-zA-Z]|`)/",
					 '', $array["contributor"]);
    if (in_array($array["contributor"], $contributors)) {
      $contributor_key = array_search($array["contributor"], $contributors);
    } else {
      $contributor_key = count($contributors);
      $contributors[] = $array["contributor"];
      $entries[] = ["contributor" => $array["contributor"],
		    "sponsor"     => $array["sponsor"],
		    "collections" => [] ];
    }
    if (!in_array($collection_string, $entries[$contributor_key]["collections"]) &&
	!preg_match('[test]', $collection_string)) {  
      $collections_key = count($entries[$contributor_key]["collections"]);          
      $entries[$contributor_key]["collections"][$collections_key] = $collection_string; 
    }  
  }
  
  return $entries;
}


function get_logos($entries) {
  
  if (count(glob(Env::$logo_dir."/*")) < 1)       
    download_logos($entries);      
  
  $logos = glob(Env::$logo_dir."/*");
  $logo_data = [];
  foreach ($logos as $key => $logo) { 
      $info = pathinfo($logo);
      $ext  = $info['extension'];
      $path = $info['dirname']; 
      $name = $info['filename'];
      $basename = $info['basename'];
      $logo_data[$name] = get_logo_dimensions($logo, $basename); 
  } 
 
  $logo_data = calculate_positions($logo_data);
  return $logo_data;
}


function download_logos($entries) {
  $count = count($entries["entries"]);
  foreach($entries["entries"] as $con_key => $contributor) { 
    error_log("DOWNLOADING LOGO -----> $con_key of $count ".$contributor["contributor"]);
    foreach($contributor["collections"] as $col_key => $collections) {
      $collection = explode(';', $collections);
      $url_prefix = "http://www.archive.org/download";
      $page_contents = file_get_contents("{$url_prefix}/{$collection[0]}");
      preg_match('/.+(jpeg|jpg|gif|png)/', $page_contents, $matches);
      if ($matches) {
	foreach($matches as $match_key => $match) {
	  $tmp = explode('>', $match);
	  if (array_key_exists(1, $tmp)) {
	    $logo_url = $url_prefix.'/'.$collection[0].'/'.$tmp[1];
	    error_log($logo_url);
	    $filename = explode(".",$tmp[1]);
	    $name = explode(' ', $contributor["contributor"]);
	    $name = implode('_', $name);
	    error_log($name);
	    $ext  = $filename[count($filename)-1];
	    $logo_file = Env::$logo_dir.'/'.$name.'.'.$ext;
	    if ( $ext=="jpeg" || $ext=="jpg" || $ext=="gif" || $ext=="png") {
	      if (!is_dir(Env::$logo_dir)) 
		exec('mkdir '.Env::$logo_dir);
	      if (!file_exists($logo_file)) {
		$logo = file_get_contents($logo_url);
		if ($logo) {
		  $handle = fopen($logo_file,'w');
		  fwrite($handle, $logo); 
		  optimize_logo_size($logo_file);
		}
	      }
	    }
	  }
	}
      } else {
	$logo = file_get_contents(getcwd().'/images/no-logo.png');
	$name = explode(' ', $contributor["contributor"]);
	$name = implode('_', $name);
	$handle = fopen(Env::$logo_dir.'/'.$name.'.png','w');
	fwrite($handle, $logo);
      }
    }
  }
}


function optimize_logo_size($logo_file) {
  //lets hope imagemagick is installed!
  if (file_exists($logo_file)) {
    $dimensions = getimagesize($logo_file);
    if (($dimensions[0]>Env::$max_width  && ($dimensions[0]>0 && $dimensions[0]!=null)) ||
	($dimensions[1]>Env::$max_height && ($dimensions[1]>0 && $dimensions[1]!=null)) ) {
      $cmd = 'convert '.$logo_file.' -resize '.Env::$max_width.'x'.Env::$max_height.' '.$logo_file;
      system($cmd);
    }
  }
}


function get_logo_dimensions($logo, $basename) {
  $dimensions = getimagesize($logo);
  return ["filename" => $basename,
	  "height" => $dimensions[1], 
	  "width" => $dimensions[0]];
}

 
function calculate_positions($logo_data) {

  $averageWidth = 0;
  $averageHeight = 0;
  $logo_area_array = [];
  $num_logos = count($logo_data);
  $bins = [];
  $logos = [];
  
  $i=1;
  foreach ($logo_data as $library => $logo) {
 
    $logos[$i]= ["library"=>$library, 
		 "width"=>$logo["width"], 
		 "height"=>$logo["height"]];
    
    $averageWidth += $logo["width"];
    $averageHeight += $logo["height"];
    $logo_area_array[$i] = $logo["width"] * $logo["height"];
    
    $i++;
  }
  
  $averageWidth  /= $num_logos;
  $averageHeight /= $num_logos;
  
  $total_logo_area    = array_sum($logo_area_array);
  $page_area          = Env::$window_height * Env::$window_width;
  $area_ratio         = $page_area/$total_logo_area;
  $area_diff          = $page_area - $total_logo_area;
  $singleColumnHeight = null;
  
  $space = null;
  $numRows = null;
  while ($space < 25) {
    if ($numRows==null) 
      $numRows = round((Env::$window_height-100)/(70));
    $numRows--;
    $space = ((Env::$window_height-100) - $numRows*70)/$numRows; 
  }
  
  $vertical_space   = $space;
  $horizontal_space = $space;     
  
  if ($num_logos < $numRows)
    $AlignHeight = true; 
  else 
    $AlignHeight = false; 
  
  foreach ($logos as $key=>$logo) {
    $width_delta_array[$key] = abs($averageWidth - $logo["width"]);
    $height_delta_array[$key] = abs($averageHeight - $logo["height"]);
  } 
  
  asort($width_delta_array);
  asort($height_delta_array);
  
  $row = 1;
  $top = 10;
  $left = 10;
  foreach ($height_delta_array as $key => $delta) {
    if ($row <= $numRows) {
      $bins[$row] = new Row($logo_data[$logos[$key]["library"]],
			    $logos[$key]["library"],
			    $logos[$key]["width"],
			    $logos[$key]["height"],
			    $top,
			    $left);
      
      $top += ($logos[$key]["height"] + $vertical_space);
      if ($AlignHeight==true) 
	$singleColumnHeight += ($logos[$key]["height"] + $vertical_space);
      
      $logos[$key]=null;
    }
    $row++;
    if ($row>$numRows)
      break;
  }
  
  $logos = array_filter($logos);
  
  $row = 1;
  foreach($logos as $key => $logo) {
    foreach($bins as $KEY=>$bin)
      $bins_WIDTHS[$KEY] = $bin->currentWidth;
    
    $shortest = min($bins_WIDTHS);
    $shortest_bin = array_search($shortest, $bins_WIDTHS);
    
    $binsabove = $shortest_bin-1;
    $binsbelow = $shortest_bin+1;
    
    $left = $bins[$shortest_bin]->currentWidth + $horizontal_space;
    
    if ($logo["height"] < $bins[$shortest_bin]->initialHeight)
      $top = $bins[$shortest_bin]->top + ($bins[$shortest_bin]->initialHeight - $logo["height"])/2;
    else
      $top = $bins[$shortest_bin]->top;
    
    $bins[$shortest_bin]->PlugIn($logo_data[$logos[$key]["library"]],
				 $logos[$key]["library"],
				 $logos[$key]["width"],
				 $logos[$key]["height"],
				 $top,
				 $left);
  }  
  
  foreach($bins as $key => $bin) {
    $bin->AlignCenter($logo_data,
		      Env::$window_width,
		      Env::$window_height,
		      $singleColumnHeight);
  }

  return $logo_data;
}


class Row {

  public $count = 1;
  public $currentWidth;
  public $initialHeight;
  public $maxHeight;
  public $top;
  public $left;
  public $sockets;
  public $logo_data;
  public $library;

  public function __construct(&$logo_data, $library, 
			      $width, $height, $top, $left) {

    $logo_data["left"] = $left;
    $logo_data["top"] = $top;
    
    $this->library = $library;    
    $this->sockets = [];
    $this->top = $top;
    $this->left = $left;
    $this->currentWidth = $width;
    $this->initialHeight = $height;
    $this->maxHeight = $height;
    $this->sockets[$this->count] = ["library"=> $library,
				    "width"  => $width,
				    "height" => $height,
				    "top"    => $top,
				    "left"   => $left];
    $this->count++;
  }
  
  public function PlugIn(&$logo_data, $library, 
			 $width, $height, $top, $left) {  

    $logo_data["left"] = $left;
    $logo_data["top"] = $top;    
    
    $this->currentWidth = $left + $width;
    if ($height > $this->maxHeight)
      $this->maxHeight = $height;
    $this->sockets[$this->count] = ["library" => $library,
				    "width"   => $width,
				    "height"  => $height,
				    "top"     => $top,
				    "left"    => $left];
    $this->count++;
  }

  public function AlignCenter(&$logo_data, $pageWidth, $pageHeight,
			      $singleColumnHeight) {
    
    if ($this->currentWidth < $pageWidth) {
      $giveWidth = ($pageWidth - $this->currentWidth)/2;
      foreach($this->sockets as $socket) {
        $socket["left"] += $giveWidth;
        $logo_data[$socket["library"]]["left"] += $giveWidth;
      }
    }      
    if ($singleColumnHeight < $pageHeight && $singleColumnHeight!=null ) {
      $giveHeight = ($pageHeight - $singleColumnHeight)/2;
      foreach($this->sockets as $socket) {
        $socket["top"] += $giveHeight;
        $logo_data[$socket["library"]]["top"] += $giveHeight;
      }
    } 
  } 
}

?>