<?php

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
 header('Access-Control-Allow-Origin: *');
 exit;
}

print 'Uploading ' . $_FILES['Filedata']['name'] . ' to ' . $_FILES['Filedata']['tmp_name'] .
      ' for the collection ' . $_POST['collection'] . '(' . $_POST['collection_id'] . ')' . "\n";
var_dump($_FILES);
print "\n";
var_dump($_POST);

exit;