<?
$zone = $_REQUEST["zone"];
$page = $_REQUEST["page"];
$num = $_REQUEST["page_amount"];
$contributor = explode("_", $_REQUEST["contributor"]);
$contributor = implode("+", $contributor);
$contributor = preg_replace("/('|-)/",'',$contributor);
$collections = json_decode($_REQUEST["collections"],true); 

if ($zone=="toronto") 
  $zone = "uoft";
if ($zone=="shenzhen") {
  $url = "http://www.archive.org/advancedsearch.php?".
    "q=(scanningcenter%3A{$zone}+OR+scanningcentre%3A{$zone})".
    "&fl[]=identifier&sort[]=addeddate+desc&sort[]=&sort[]=".
    "&rows={$num}&page={$page}&callback=callback&output=xml";
  retrieve_identifiers($url);
 } else {
  $url = cook_string($zone, $contributor, $collections, $page, $num);
  retrieve_identifiers($url);
 }


function cook_string($zone, $contributor, $collections, $page, $num) {
  $auery_string = '';
  $collections = explode('[',$collections);
  $collections = explode(']',$collections[1]);
  $collections = explode(',',$collections[0]);
  if ($zone=="Bali") 
    $query_string = "(";
  else
    $query_string = "contributor%3A{$contributor}+AND+".
      "(scanningcenter%3A{$zone}+OR+scanningcentre%3A{$zone})+AND+(";
  foreach ($collections as $KEY=>$collection) {
    $query_string .= "(collection%3A(";
    $collection = explode('"',$collection);
    $sub_collections = explode(';', $collection[1]);
    foreach ($sub_collections as $key=>$sub_collection) {
      $query_string .= "{$sub_collection}";
      if ($key!=count($sub_collections)-1)
	$query_string .= "+AND+";
    }
    if ($KEY!=count($collections)-1)
      $query_string .= "))OR";
    else 
      $query_string .= "))";
  }
  $query_string .= ")";    
  $url = "http://www.archive.org/advancedsearch.php?q={$query_string}".
    "&fl[]=identifier&sort[]=addeddate+desc&sort[]=&sort[]=&rows=".
    "{$num}&page={$page}&callback=callback&output=xml";

  return $url;
}

function retrieve_identifiers($url) {
  $XML = file_get_contents($url);
  if (!$XML) {
    echo "Server Error.";
    return;
  }
  $handle = fopen("XML.xml", 'w');
  fwrite($handle, $XML);
  $dom = new DOMDocument();
  $dom->load("XML.xml");
  $dom->formatOutput = true;
  $dom->preserveWhiteSpace = false;
  $xpath = new DOMXPath($dom);
  $query = "/response/result/doc/str";
  $entries = $xpath->query($query);
  $data[]=null; $i=0; 
  foreach($entries as $page) {
    $ids[$i] = $page->nodeValue;
    $data[$i]=$ids[$i];
    $i++;
  }
  $xpath = new DOMXPath($dom);
  $query = "/response/result";
  $entries = $xpath->query($query);
  $var = null;
  foreach($entries as $page) 
    $var = $page->getAttribute('numFound');
  if ($var==0) {
    echo "No items Found.";
    return;
  } else {
    $data[$i]=$var;
    $json  = json_encode($data);
    echo $json;
  }
}


?>