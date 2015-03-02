<?php

/**
 * Server (this one is PHP) for simple-canvas-captcha
 *
 * @copyright Copyright (c) 2015, Daniel Rhodes
 * @author Daniel Rhodes
 * @package simple-canvas-captcha
 * @link https://github.com/danielrhodeswarp/simple-canvas-captcha
 * 
 */

//get POSTed CAPTCHA answer
$answer = trim($_POST['captcha-answer']);

//get POSTed pixel data
$pixelString = $_POST['pixel-data'];

//see if user was right
$correct = check_simple_canvas_captcha($answer, $pixelString, true);

var_dump($correct);

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

//deduce the shape from the list of pixels (and canvas dimensions)
function deduce_simple_canvas_captcha($pixelString, $reporting = false)
{
    //make into an array
    $pixelArray = explode(',', $pixelString);

    //take canvas height and width off the array
    $height = array_pop($pixelArray);
    $width = array_pop($pixelArray);
    
    //arrayify per pixel
    $pixelArray = str_split($pixelArray[0]);    //strangely will give array(1) { [0]=> string(0) "" }  if input is null or empty string
    //$pixelArray = preg_split('//', $pixelArray[0], -1, PREG_SPLIT_NO_EMPTY);    //intuitively will give array(0) { } if input is null or empty string
    
    //put pixel data into a 2D array--------------------------------------------
    $pixelGrid = array();

    for($loop = 0; $loop < count($pixelArray); $loop += $width)
    {
        $row = array_slice($pixelArray, $loop, $width);

        $pixelGrid[] = $row;
    }

    //get bounding box coords---------------------------------------------------
    //AND pixel area of shape at same time--------------------------------------
    //get leftmost x, rightmost x, uppermost y, lowermost(?) y
    //then we can do some cheesy image proc'ing

    $leftmostX = $width;
    $rightmostX = 0;
    $uppermostY = $height;
    $lowermostY = 0;    //is "lowermost" an actual word?!
    $shapeArea = 0;

    foreach($pixelGrid as $yValue => $row)
    {
        $litPixels = array_keys($row, 1);   //get only the keys whose value is 1

        if(empty($litPixels))
        {
            continue;
        }

        //increase total area
        $shapeArea += count($litPixels);

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

    $boundArea = (($rightmostX - $leftmostX) + 1 ) * (($lowermostY - $uppermostY) + 1);
    $areaPercentage = $shapeArea / $boundArea;
    $areaPercentageHuman = $areaPercentage * 100;

    $shape = '';
    $CUTOFF = 0.75; //see percentage_difference_results.txt

    if($areaPercentage == 1)
    {
        $shape = 'square';
    }

    elseif($areaPercentage < $CUTOFF)
    {
        $shape = 'triangle';
    }

    elseif($areaPercentage >= $CUTOFF)
    {
        $shape = 'circle';
    }

    if($reporting)
    {
        echo "<p>Bounding rectangle is [{$leftmostX}, {$uppermostY}, {$rightmostX}, {$lowermostY}]</p>";
        echo "<p>Bounding rectangle area is: {$boundArea}</p>";
        echo "<p>Shape area is: {$shapeArea}</p>";
        echo "<p>Shape area / bounding rectangle area is: {$areaPercentageHuman}%</p>";
        echo "<p>I deduce that the shape is a: {$shape}</p>";
    }
    
    return $shape;
}

//check that user's answer matches what we deduce the shape to be
function check_simple_canvas_captcha($answer, $pixelString, $reporting = false)
{
    //support UPPERCASE answers
    $answer = strtolower($answer);

    //remove 'a' or 'an' article from answer (to support "a square" and etc)
    $answer = preg_replace('/^a[n]{0,1}[ ]/', '', $answer);

    $answer = trim($answer);

    $shape = deduce_simple_canvas_captcha($pixelString, $reporting);
    
    $correct = ($answer == $shape);

    if($reporting)
    {
        $correctWord = '<span style="background-color:green; color:white;">correct!</span>';
        if(!$correct)
        {
            $correctWord = '<span style="background-color:red;">incorrect :-(</span>';
        }
        
        echo "<p>You answered: {$answer}, so you are {$correctWord}</p>";
    }
    
    return $correct;
}
