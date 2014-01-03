<?php
$collection_name = $_GET['name'];

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

$collection_id = get_collection_id($dbh, $collection_name);
if ($collection_id == 0) {
    $collection_id = add_collection($dbh, $collection_name);
}

print json_encode(array(id => $collection_id));

function get_collection_id($dbh, $collection_name) {
    $sql = 'SELECT collection_id FROM aladdin.collection WHERE name = :collection_name';
    $select = $dbh->prepare($sql);
    $select->bindParam(':collection_name', $collection_name);
    $select->execute();

    $id = 0;
    while ($row = $select->fetch(PDO::FETCH_ASSOC)) {
        $id = $row['collection_id'];
    }
    return $id;

}

function add_collection($dbh, $collection_name) {
    $sql = 'INSERT INTO aladdin.collection (name, created_on, owner_id) VALUES (:collection_name, NOW(), :owner)';
    $insert = $dbh->prepare($sql);
    $insert->bindParam(':collection_name', $collection_name);
    $owner_id = 1;
    $insert->bindParam(':owner', $owner_id);
    $insert->execute();

    return get_collection_id($dbh, $collection_name);
}
