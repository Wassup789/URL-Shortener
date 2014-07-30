<?php
//-----------Database Details------------------------------------

$server["host"] = "HOSTNAME";//Host
$server["username"] = "USERNAME";//Database Username
$server["password"] = "PASSWORD";//Database Password
$server["db"] = "DATABASENAME";// Database

//-----------Dont Touch This-------------------------------------

$mysql_link = mysqli_connect($server["host"], $server["username"], $server["password"]) OR die ('Cant connect to the database');
mysqli_select_db($mysql_link, $server["db"]);
?>
