<?php
echo "<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js'></script>";
echo "<script src='https://ajax.aspnetcdn.com/ajax/jquery.ui/1.13.1/jquery-ui.js'></script>";
echo "<link rel='stylesheet' href='https://ajax.aspnetcdn.com/ajax/jquery.ui/1.13.1/themes/cupertino/jquery-ui.css'></link>";

$book_id = $_GET['book_id'];

echo "<div id=book_view></div>";

//https://www.php.net/manual/en/function.str-getcsv.php#117692
$csv = array_map('str_getcsv', file("book_data.csv"));
array_walk($csv, function(&$a) use ($csv) {
      $a = array_combine($csv[0], $a);
});
array_shift($csv); # remove column header
$book = $csv[$book_id];
$output = "";

$output .= "<br>Title: ". $book['title'] . " " . $book['title2'] ."</br>";
$output .= "<br>Author: ". $book['author'] . "</br>";
$output .= "<br>Call Number: ". $book['callnum'] . "</br>";
$output .= "<br>Length: " . $book['clean_length'] . " pages</br>";
$output .= "<br>Publication info: ". $book['pub_location'] . " ". $book['publisher']. "</br>";
$output .= "<br>Date: ". $book['date'] ."</br>";
if (strlen($book['contents'])>0){
    $output .= "<br>Contents: ". $book['contents'] ."</br>";
}
if (strlen($book['subjects'] . $book['subjects2']) > 0) {
    $output .= "<br>Subjects: ". $book['subjects'] ." " . $book['subjects2'] ."</br>";
}
echo($output);
