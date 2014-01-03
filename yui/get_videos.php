<?php
$collection_id = $_GET['collection_id'];

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

print json_encode(get_collection_videos($dbh, $collection_id));

function get_collection_videos($dbh, $collection_id) {
    $sql = 'SELECT video_file_name FROM aladdin.video v ' .
           'JOIN aladdin.collection_videos cv ON v.video_id = cv.video_id ' .
           'WHERE cv.collection_id = :collection_id';
    $select = $dbh->prepare($sql);
    $select->bindParam(':collection_id', $collection_id);
    $select->execute();

    $videos = array();
    while ($row = $select->fetch(PDO::FETCH_ASSOC)) {
        $videos[] = $row;
    }
    return $videos;
}