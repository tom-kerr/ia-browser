<?
$id = $_REQUEST['identifier'];
$metaXML = "http://www.archive.org/download/{$id}/{$id}_meta.xml";
$JSON_ARRAY = array();
$XML = file_get_contents($metaXML);
if ($XML) {
  $dom = new DOMDocument();
  $dom->loadXML($XML);
  $title = $dom->getElementsbyTagName('title')->item(0)->nodeValue;
  $creator = $dom->getElementsbyTagName('creator')->item(0)->nodeValue; 
  $description = $dom->getElementsbyTagName('description')->item(0)->nodeValue;
  $publisher  = $dom->getElementsbyTagName('publisher')->item(0)->nodeValue;
  $date = $dom->getElementsbyTagName('date')->item(0)->nodeValue;
  $language = $dom->getElementsbyTagName('language')->item(0)->nodeValue;
  $sponsor = $dom->getElementsbyTagName('sponsor')->item(0)->nodeValue;
  $contributor = $dom->getElementsbyTagName('contributor')->item(0)->nodeValue;
  $addeddate = $dom->getElementsbyTagName('addeddate')->item(0)->nodeValue;
  $ppi = $dom->getElementsbyTagName('ppi')->item(0)->nodeValue;
  $camera = $dom->getElementsbyTagName('camera')->item(0)->nodeValue;
  $operator = $dom->getElementsbyTagName('operator')->item(0)->nodeValue;
  $scanner = $dom->getElementsbyTagName('scanner')->item(0)->nodeValue;
  $imagecount = $dom->getElementsbyTagName('imagecount')->item(0)->nodeValue;
  $foldoutcount = $dom->getElementsbyTagName('foldoutcount')->item(0)->nodeValue;

  $JSON_ARRAY = array("title"        => $title,
                      "creator"      => $creator,
                      "description"  => $description,
                      "publisher"    => $publisher,
                      "date"         => $date,
                      "language"     => $language,
                      "sponsor"      => $sponsor,
                      "contributor"  => $contributor,
                      "addeddate"    => $addeddate,
                      "ppi"          => $ppi,
                      "camera"       => $camera,
                      "operator"     => $operator,
                      "scanner"      => $scanner,
                      "imagecount"   => $imagecount,
                      "foldoutcount" => $foldoutcount);
  
  $JSON = json_encode($JSON_ARRAY);
  echo $JSON;
 } else 
  error_log("Problem Getting XML...");

?>