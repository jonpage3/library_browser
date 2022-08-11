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
//print_r($csv);

$books = array_column($csv, null, 'id');
//print_r($books);
$book = $books[$book_id];
$output = "";

$output .= "<br><b>Title:</b> ". $book['title'] . " " . $book['title2'] ."</br>";
$output .= "<br><b>Author:</b> ". $book['author'] . "</br>";
$output .= "<br><b>Call Number:</b> ". $book['callnum'] . "</br>";
$output .= "<br><b>Length:</b>" . $book['clean_length'] . " pages</br>";
$output .= "<br><b>Publication info:</b> ". $book['pub_location'] . " ". $book['publisher']. "</br>";
$output .= "<br><b>Date:</b> ". $book['date'] ."</br>";
if (strlen($book['contents'])>0){
    $output .= "<br><b>Contents:</b> ". $book['contents'] ."</br>";
}
if (strlen($book['subjects'] . $book['subjects2']) > 0) {
    $output .= "<br><b>Subjects:</b> ". $book['subjects'] ." " . $book['subjects2'] ."</br>";
}
echo($output);
