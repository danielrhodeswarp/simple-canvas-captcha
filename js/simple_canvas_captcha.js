/**
 * JavaScript client for simple-canvas-captcha
 *
 * @copyright Copyright (c) 2015, Daniel Rhodes
 * @author Daniel Rhodes
 * @package simple-canvas-captcha
 * @link https://github.com/danielrhodeswarp/simple-canvas-captcha
 * 
 */

//Mouldy global variables that smell a bit funny
var globalCanvasContext;
var globalCanvasElement;
var globalAvailableShapes = ['square', 'triangle', 'circle'];
var globalCanvasWidth = 90; //NOTE canvas must be square or wide, not tall!
var globalCanvasHeight = 70;    //NOTE canvas must be square or wide, not tall!

//Get the ball rolling
function startSimpleCanvasCaptcha(idOfCanvasElement)
{
    if(initialiseCanvas(idOfCanvasElement))
    {
        drawRandomShapeOnCanvas();
    }
}

//Get - and style - the canvas context of the specified element
//Returns false if specified element not exist OR can't get canvas context for it
function initialiseCanvas(idOfCanvasElement)
{
    globalCanvasElement = document.getElementById(idOfCanvasElement);
    
    if(!globalCanvasElement)
    {
        return false;
    }
    
    globalCanvasContext = globalCanvasElement.getContext('2d');
    
    if(!globalCanvasContext)
    {
        return false;
    }
    
    //do here? (or in HTML)
    globalCanvasElement.width = globalCanvasWidth;
    globalCanvasElement.height = globalCanvasHeight;
    
    //do here? (or in CSS?)
    globalCanvasElement.style.border = '1px solid grey';
    globalCanvasElement.style.backgroundColor = '#ffa';
    globalCanvasElement.style.padding = '10px';
    
    return true;
}

//Draw one of our available shapes on the canvas
//(and then put its pixel data in the hidden form input)
function drawRandomShapeOnCanvas()
{
    clearCanvas();
    
    var randomIndex = getRandomInt(0, globalAvailableShapes.length);
    
    var randomShape = globalAvailableShapes[randomIndex];
    
    drawShape(randomShape);
    
    stashPixelWidthHeightData();
}

//Put pixel data of canvas into a string list (boolean on / off for each pixel)
//in the hidden form input (id="pixel-data")
//NOTE we also stash the canvas size
//TODO make the data length shorter somehow
function stashPixelWidthHeightData()
{
    var image = globalCanvasContext.getImageData(0, 0, globalCanvasWidth, globalCanvasHeight);
    
    var imageData = image.data;
    
    var pixelList = '';
    
    for(var loop = 0; loop < imageData.length; loop += 4)
    {
        var red = imageData[loop];
        var green = imageData[loop + 1];
        var blue = imageData[loop + 2];
        var alpha = imageData[loop + 3];
        
        if(red != 0 || green != 0 || blue != 0)
        {
            pixelList += 1;
        }
        
        else
        {
            pixelList += 0;
        }
    }
    
    document.getElementById('pixel-data').value = pixelList + ',' + globalCanvasWidth + ',' + globalCanvasHeight;
}

//Returns a random integer between min (included) and max (excluded)
//Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min)) + min;
}

//Clear all drawings from canvas
function clearCanvas()
{
    globalCanvasContext.clearRect(0, 0, globalCanvasWidth, globalCanvasHeight);
}

//Draw the specified shape
//Return false if a duff shape is specified
function drawShape(shape)
{
    if(shape == 'square')
    {
        return drawSquare();
    }
    
    else if(shape == 'circle')
    {
        return drawCircle();
    }
    
    else if(shape == 'triangle')
    {
        return drawTriangle();
        
    }
    
    return false;   //duff shape specified
}

//Draw a triangle using three different, random quadrants to put each point in
//(to avoid very odd-looking shapes that confuse the user *and* our server!)
function drawTriangle()
{
    //map four quadrants of the canvas (from top-left clockwise)
    var quads = [{x1:0, y1:0, x2:globalCanvasWidth / 2, y2:globalCanvasHeight / 2},
        {x1:globalCanvasWidth / 2, y1:0, x2:globalCanvasWidth, y2:globalCanvasHeight / 2},
        {x1:globalCanvasWidth / 2, y1:globalCanvasHeight / 2, x2:globalCanvasWidth, y2:globalCanvasHeight},
        {x1:0, y1:globalCanvasHeight / 2, x2:globalCanvasWidth / 2, y2:globalCanvasHeight}];
    
    //get three random quadrants to put our triangle points in
    var quadsToUse = [];
    quadsToUse.push(getRandomInt(0, 4));    //index into quads[]
    
    //add next two quads
    quadsToUse.push(quadsToUse[0] + 1);
    quadsToUse.push(quadsToUse[1] + 1);
    
    //clip in case we've gone higher than index of 3 (4 => 0, 5 => 1, etc)
    for(var loop = 0; loop < quadsToUse.length; loop++)
    {
        if(quadsToUse[loop] > 3)
        {
            quadsToUse[loop] -= 4;
        }
    }
    
    var points = [];
    
    points[0] = {x:getRandomInt(quads[quadsToUse[0]].x1, quads[quadsToUse[0]].x2), y:getRandomInt(quads[quadsToUse[0]].y1, quads[quadsToUse[0]].y2)};
    points[1] = {x:getRandomInt(quads[quadsToUse[1]].x1, quads[quadsToUse[1]].x2), y:getRandomInt(quads[quadsToUse[1]].y1, quads[quadsToUse[1]].y2)};
    points[2] = {x:getRandomInt(quads[quadsToUse[2]].x1, quads[quadsToUse[2]].x2), y:getRandomInt(quads[quadsToUse[2]].y1, quads[quadsToUse[2]].y2)};
    
    globalCanvasContext.fillStyle = '#0000ff';
    globalCanvasContext.beginPath();
    
    //Draw a triangle having each point (it will return to first point)
    globalCanvasContext.moveTo(points[0].x, points[0].y);
    globalCanvasContext.lineTo(points[1].x, points[1].y);
    globalCanvasContext.lineTo(points[2].x, points[2].y);
    globalCanvasContext.closePath();
    globalCanvasContext.fill();
}

//Draw a square
//TODO rotated square not yet supported (but would be lovely) 
function drawSquare()
{
    var maxSquareSize = globalCanvasHeight;
    var minSquareSize = 30;
    
    var squareSize = getRandomInt(minSquareSize, maxSquareSize);
    
    //get four points (that are joined by *straight* lines)
    var points = [];
    
    //first point, anywhere on canvas
    points[0] = {x:getRandomInt(0, globalCanvasWidth), y:getRandomInt(0, globalCanvasHeight)};
    
    //next point, same y as first point but plus squareSize on the x
    points[1] = {x:points[0].x + squareSize, y:points[0].y};
    
    //next point, same x as previous point but plus squareSize on the y
    points[2] = {x:points[1].x, y:points[1].y + squareSize};
    
    //last point, same y as previous point but minus squareSize on the x
    points[3] = {x:points[2].x - squareSize, y:points[2].y};
    
    //nudge if square won't fit on canvas entirely
    if(points[0].x < 0)
    {
        var difference = 0 - points[0].x;
        
        points[0].x += difference;
        points[1].x += difference;
        points[2].x += difference;
        points[3].x += difference;
        
    }
    
    if(points[1].x > globalCanvasWidth)
    {
        var difference = points[1].x - globalCanvasWidth;
        
        points[0].x -= difference;
        points[1].x -= difference;
        points[2].x -= difference;
        points[3].x -= difference;
    }
    
    if(points[0].y < 0)
    {
        var difference = 0 - points[0].y;
        
        points[0].y += difference;
        points[1].y += difference;
        points[2].y += difference;
        points[3].y += difference;
    }
    
    if(points[2].y > globalCanvasHeight)
    {
        var difference = points[2].y - globalCanvasHeight;
        
        points[0].y -= difference;
        points[1].y -= difference;
        points[2].y -= difference;
        points[3].y -= difference;
    }
    //----/end nudging
    
    globalCanvasContext.fillStyle = '#0000ff';
    globalCanvasContext.beginPath();

    //Draw a square having each point (it will return to first point)
    globalCanvasContext.moveTo(points[0].x, points[0].y);
    globalCanvasContext.lineTo(points[1].x, points[1].y);
    globalCanvasContext.lineTo(points[2].x, points[2].y);
    globalCanvasContext.lineTo(points[3].x, points[3].y);
    globalCanvasContext.closePath();
    globalCanvasContext.fill();
}

//Draw a circle
function drawCircle()
{
    var maxRadius = globalCanvasHeight / 2;
    var minRadius = 20;
    
    var radius = getRandomInt(minRadius, maxRadius);
    
    var centreX = getRandomInt(0, globalCanvasWidth);
    var centreY = getRandomInt(0, globalCanvasHeight);
    
    //nudge if circle won't fit on canvas entirely
    if(centreX - radius < 0)
    {
        centreX = radius;
    }
    
    if(centreX + radius > globalCanvasWidth)
    {
        centreX = globalCanvasWidth - radius;
    }
    
    if(centreY - radius < 0)
    {
        centreY = radius;
    }
    
    if(centreY + radius > globalCanvasHeight)
    {
        centreY = globalCanvasHeight - radius;
    }
    //----/end nudging
    
    globalCanvasContext.fillStyle = '#0000ff';
    globalCanvasContext.beginPath();
    globalCanvasContext.arc(centreX, centreY, radius, 0, 2 * Math.PI);
    globalCanvasContext.fill();
}
