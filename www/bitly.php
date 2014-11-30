<?php
header("Access-Control-Allow-Origin: *");

include("connection.php");
if(!isset($_GET["url"])){
	header("HTTP/1.1 400 Bad Request");
	exit();
}
$longUrl = $_GET["url"];

$origin = $_SERVER["HTTP_ORIGIN"];

if($origin != "chrome-extension://inkbdhkochhhjjbckkejpganmobahlpj")
	exit();

$loginName = "BITLYLOGINNAMEHERE";
$apiKey = "BITLYAPIKEY";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "http://api.bit.ly/v3/shorten?apiKey={$apiKey}&login={$loginName}&longUrl={$longUrl}&format=json");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type:application/json'));

$shortUrl = json_decode(curl_exec($ch)) -> data -> url;

curl_close($ch);

$ip = getenv('HTTP_CLIENT_IP')?:
getenv('HTTP_X_FORWARDED_FOR')?:
getenv('HTTP_X_FORWARDED')?:
getenv('HTTP_FORWARDED_FOR')?:
getenv('HTTP_FORWARDED')?:
getenv('REMOTE_ADDR');

$num = 0;
$navcmd = "SELECT * FROM bitly WHERE ip=\"$ip\" AND timestamp > " . (time() - 10);
$navquery = mysqli_query($mysql_link, $navcmd) or die (mysql_error());
while ($row = mysqli_fetch_array($navquery)) {
	$num++;
}

if($num >= 5)
	echo "Too many requests";
else{
	echo $shortUrl;
	$query = 'INSERT INTO bitly (ip, timestamp, link) VALUES ("'.$ip.'", "'.time().'", "'.$shortUrl.'")';
	mysqli_query($mysql_link, $query) OR die (mysql_error());
}

$navcmd = "SELECT * FROM bitly WHERE timestamp < " . (time() - 20);
$navquery = mysqli_query($mysql_link, $navcmd) or die (mysql_error());
while ($row = mysqli_fetch_array($navquery)) {
	$query = 'DELETE FROM bitly WHERE id="'.$row["id"].'"';
	mysqli_query($mysql_link, $query) OR die (mysql_error());
}
