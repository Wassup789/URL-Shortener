<?php
include("connection.php");
if(!isset($_GET["url"])){
	header("HTTP/1.1 400 Bad Request");
	exit();
}
$longUrl = $_GET["url"];

$origin = $_SERVER["HTTP_ORIGIN"];

if($origin != "chrome-extension://nmmlgajflaadkcfcdiblldhdhpnbmhii" && $origin != "chrome-extension://inkbdhkochhhjjbckkejpganmobahlpj")
	exit();

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "http://tinyurl.com/api-create.php?url={$longUrl}");
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.3 Safari/537.36");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_VERBOSE, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$shortUrl = curl_exec($ch);

curl_close($ch);

$ip = getenv('HTTP_CLIENT_IP')?:
getenv('HTTP_X_FORWARDED_FOR')?:
getenv('HTTP_X_FORWARDED')?:
getenv('HTTP_FORWARDED_FOR')?:
getenv('HTTP_FORWARDED')?:
getenv('REMOTE_ADDR');

$num = 0;
$navcmd = "SELECT * FROM tinyurl WHERE ip=\"$ip\" AND timestamp > " . (time() - 10);
$navquery = mysqli_query($mysql_link, $navcmd) or die (mysql_error());
while ($row = mysqli_fetch_array($navquery)) {
	$num++;
}

if($num >= 5)
	echo "Too many requests";
else{
	echo $shortUrl;
	$query = 'INSERT INTO tinyurl (ip, timestamp, link) VALUES ("'.$ip.'", "'.time().'", "'.$shortUrl.'")';
	mysqli_query($mysql_link, $query) OR die (mysql_error());
}

$navcmd = "SELECT * FROM tinyurl WHERE timestamp < " . (time() - 20);
$navquery = mysqli_query($mysql_link, $navcmd) or die (mysql_error());
while ($row = mysqli_fetch_array($navquery)) {
	$query = 'DELETE FROM tinyurl WHERE id="'.$row["id"].'"';
	mysqli_query($mysql_link, $query) OR die (mysql_error());
}