<?php

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
 header('Access-Control-Allow-Origin: *');
 exit;
}

$video_name = $_FILES['Filedata']['name'];
$dir_name = $_FILES['Filedata']['tmp_name'];
$collection_name = $_POST['collection'];

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

$dir_id = get_folder_id($dbh, $dir_name);
if ($dir_id == 0) {
    $dir_id = add_folder($dbh, $dir_name);
}
$collection_id = get_collection_id($dbh, $collection_name);
if ($collection_id == 0) {
    $collection_id = add_collection($dbh, $collection_name);
}
add_video($dbh, $video_name, $dir_id, $collection_id);
print "Upload Success";

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

function get_folder_id($dbh, $dir_name) {
    $sql = 'SELECT fd_id FROM aladdin.file_directory WHERE directory = :dir_name';
    $select = $dbh->prepare($sql);
    $select->bindParam(':dir_name', $dir_name);
    $select->execute();

    $id = 0;
    while ($row = $select->fetch(PDO::FETCH_ASSOC)) {
        $id = $row['fd_id'];
    }
    return $id;
}

function add_folder($dbh, $dir_name) {
    $sql = 'INSERT INTO aladdin.file_directory (directory) VALUES (:dir_name)';
    $insert = $dbh->prepare($sql);
    $insert->bindParam(':dir_name', $dir_name);
    $insert->execute();

    return get_folder_id($dbh, $dir_name);
}

function add_video($dbh, $name, $dir_id, $source_id) {
    $sql = 'INSERT INTO aladdin.VIDEO (video_file_name, video_file_directory_id, source_collection_id) ' .
            'VALUES (:name, :dir_id, :source_id)';
    $insert = $dbh->prepare($sql);
    $insert->bindParam(':name', $name);
    $insert->bindParam(':dir_id', $dir_id);
    $insert->bindParam(':source_id', $source_id);
    $insert->execute();
}

