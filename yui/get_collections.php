<?php

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
 header('Access-Control-Allow-Origin: *');
 exit;
}

$user = "root";
$password = "makingthemoney";
$dbh = null;
try {
    $dbh = new PDO('mysql:host=localhost;dbname=aladdin', $user, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "<br/>";
    die();
}

print json_encode(get_collections($dbh));

function get_collections($dbh) {
    $sql = 'SELECT collection_id, name FROM aladdin.collection';
    $select = $dbh->prepare($sql);
    $select->execute();

    $collections = array();
    while ($row = $select->fetch(PDO::FETCH_ASSOC)) {
        $collections[] = $row;
    }
    return $collections;
}