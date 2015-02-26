<?php

//get POSTed CAPTCHA answer
$answer = trim($_POST['captcha-answer']);

//get POSTed pixel data
$pixelString = $_POST['pixel-data'];

//make into an array
$pixelArray = explode(',', $pixelString);

//take canvas height and width off the array
$height = array_pop($pixelArray);
$width = array_pop($pixelArray);

//put pixel data into a 2D array------------------------------------------------
$pixelGrid = array();

for($loop = 0; $loop < count($pixelArray); $loop += $width)
{
    $row = array_slice($pixelArray, $loop, $width);
    
    $pixelGrid[] = $row;
}

//get bounding box coords-------------------------------------------------------
//get leftmost x, rightmost x, uppermost y, lowermost(?) y
//then we can do some cheesy image proc'ing

$leftmostX = $width;
$rightmostX = 0;
$uppermostY = $height;
$lowermostY = 0;    //is "lowermost" an actual word?!

foreach($pixelGrid as $yValue => $row)
{
    $litPixels = array_keys($row, 1);   //get only the keys whose value is 1
    
    if(empty($litPixels))
    {
        continue;
    }
    
    //y check--------
    if($yValue < $uppermostY)
    {
        $uppermostY = $yValue;
    }
    
    if($yValue > $lowermostY)
    {
        $lowermostY = $yValue;
    }
    
    //x check--------
    $rowMinX = min($litPixels);
    $rowMaxX = max($litPixels);
    
    if($rowMinX < $leftmostX)
    {
        $leftmostX = $rowMinX;
    }
    
    if($rowMaxX > $rightmostX)
    {
        $rightmostX = $rowMaxX;
    }
}

echo "<p>Bounding square is [{$leftmostX}, {$uppermostY}, {$rightmostX}, {$lowermostY}]</p>";

//make a blank 2D pixel array---------------------------------------------------
$blank = array();

for($loop = 0; $loop < $height; $loop++)
{
    $blank[$loop] = array_fill(0, $width, 0);
}

//put calculated bounding square on blank canvas--------------------------------
$square = $blank;

for($loop = $uppermostY; $loop <= $lowermostY; $loop++)
{
    for($innerLoop = $leftmostX; $innerLoop <= $rightmostX; $innerLoop++)
    {
        $square[$loop][$innerLoop] = 1;
    }
}

//compare original against $square using some statistical jiggery-pokery--------
$totalPercentageDiff = 0;

for($loop = 0; $loop < $height; $loop++)
{
    //get original and bounding square rows as strings of zeros and ones
    $originalString = implode('', $pixelGrid[$loop]);
    $boundSquareString = implode('', $square[$loop]);
    
    //----using levenshtein() [returns the difference or "distance"] we can
    //get the count of "pixel" (actually character) changes needed to go from the original
    //to our bounding square)
    $distance = levenshtein($originalString, $boundSquareString);
        
    //calc difference percentage
    $percentageDiff = 0;
    
    if($distance != 0)  //ie. if pixel rows differ
    {
        //extraneous (or missing) pixels per total count of pixels in source row
        $percentageDiff = $distance / count(array_keys($pixelGrid[$loop], 1));
    }
    
    $totalPercentageDiff += $percentageDiff;
}

$averagePercentageDiff = $totalPercentageDiff / $height;

//show what *we* know about the shape-------------------------------------------
echo "<p>Percentage difference (of actual shape) from bounding square = {$averagePercentageDiff}%</p>";

$shape = '';

if($averagePercentageDiff == 0)
{
    $shape = 'square';
}

elseif($averagePercentageDiff < 1)
{
    $shape = 'circle';
}

elseif($averagePercentageDiff > 1)
{
    $shape = 'triangle';
}

echo "<p>I deduce that the shape is a: {$shape}</p>";

//see if user was right---------------------------------------------------------

//support UPPERCASE answers
$answer = strtolower($answer);

//remove 'a' or 'an' article from answer (to support "a square" and etc)
$answer = preg_replace('/^a[n]{0,1}[ ]/', '', $answer);

$answer = trim($answer);

$correct = ($answer == $shape);

$correctWord = '<span style="background-color:green; color:white;">correct!</span>';
if(!$correct)
{
    $correctWord = '<span style="background-color:red;">incorrect :-(</span>';
}

echo "<p>You answered: {$answer}, so you are {$correctWord}</p>";