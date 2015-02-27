var globalCanvasContext;
var globalCanvasElement;
var globalAvailableShapes = ['square', 'triangle', 'circle'];
var globalCanvasWidth = 190;
var globalCanvasHeight = 170;
var globalMaxSquareSize = globalCanvasHeight;

function startSimpleCanvasCaptcha(idOfCanvasElement)
{
    initialiseCanvas(idOfCanvasElement);
    drawRandomShapeOnCanvas();
}

function initialiseCanvas(idOfCanvasElement)
{
    globalCanvasElement = document.getElementById(idOfCanvasElement);
    
    //if(canvas.getContext){}else{}
    
    
    globalCanvasContext = globalCanvasElement.getContext('2d');
    
    //do here? (or in CSS?)
    globalCanvasElement.width = globalCanvasWidth;
    globalCanvasElement.height = globalCanvasHeight;
    globalCanvasElement.style.border = '1px solid grey';
    globalCanvasElement.style.backgroundColor = '#ffa';
    globalCanvasElement.style.padding = '10px';
    //globalCanvasContext.
}

function drawRandomShapeOnCanvas()
{
    clearCanvas();
    
    var randomIndex = getRandomInt(0, globalAvailableShapes.length);
    
    var randomShape = globalAvailableShapes[randomIndex];
    
    drawShape(randomShape);
    
    stashPixelWidthHeightData();
}

function stashPixelWidthHeightData()
{
    var image = globalCanvasContext.getImageData(0, 0, globalCanvasWidth, globalCanvasHeight);
    
    var imageData = image.data;
    
    var pixelArray = [];
    
    for(var loop = 0; loop < imageData.length; loop += 4)
    {
        var red = imageData[loop];
        var green = imageData[loop + 1];
        var blue = imageData[loop + 2];
        var alpha = imageData[loop + 3];
        
        if(red != 0 || green != 0 || blue != 0)
        {
            pixelArray.push(1);
            
        }
        
        else
        {
            pixelArray.push(0);
        }
        
    }
    
    document.getElementById('pixel-data').value = pixelArray.toString() + ',' + globalCanvasWidth + ',' + globalCanvasHeight;
}

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min)) + min;
}

function clearCanvas()
{
    globalCanvasContext.clearRect(0, 0, globalCanvasWidth, globalCanvasHeight);
}

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

//put each point in a separate quadrant?
function drawTriangle_INITIAL_ATTEMPT_UNCONTROLLED()
{
    //get three random points (ideally checking they not on same line!)
    //("don't draw a triangle that's too slim" not yet supported)
    var points = [];
    
    points[0] = {x:getRandomInt(0, globalCanvasWidth), y:getRandomInt(0, globalCanvasHeight)};
    points[1] = {x:getRandomInt(0, globalCanvasWidth), y:getRandomInt(0, globalCanvasHeight)};
    points[2] = {x:getRandomInt(0, globalCanvasWidth), y:getRandomInt(0, globalCanvasHeight)};
    
    globalCanvasContext.fillStyle = '#0000ff';
    globalCanvasContext.beginPath();
    // Draw a triangle having each point (it will return to first point)
    globalCanvasContext.moveTo(points[0].x, points[0].y);
    globalCanvasContext.lineTo(points[1].x, points[1].y);
    globalCanvasContext.lineTo(points[2].x, points[2].y);
    globalCanvasContext.closePath();
    globalCanvasContext.fill();
    //globalCanvasContext.stroke();
}

//choose, randomly, three different quadrants and put a point in each
//(to avoid odd-looking shapes that confuse the user *and* our server algo's!)
function drawTriangle()
{
    //map four quadrants of the canvas (from top-left clockwise)
    var quads = [{x1:0, y1:0, x2:globalCanvasWidth / 2, y2:globalCanvasHeight / 2},
        {x1:globalCanvasWidth / 2, y1:0, x2:globalCanvasWidth, y2:globalCanvasHeight / 2},
        {x1:globalCanvasWidth / 2, y1:globalCanvasHeight / 2, x2:globalCanvasWidth, y2:globalCanvasHeight},
        {x1:0, y1:globalCanvasHeight / 2, x2:globalCanvasWidth / 2, y2:globalCanvasHeight}];
    console.log(quads);
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
    console.log(quadsToUse);
    
    var points = [];
    
    points[0] = {x:getRandomInt(quads[quadsToUse[0]].x1, quads[quadsToUse[0]].x2), y:getRandomInt(quads[quadsToUse[0]].y1, quads[quadsToUse[0]].y2)};
    points[1] = {x:getRandomInt(quads[quadsToUse[1]].x1, quads[quadsToUse[1]].x2), y:getRandomInt(quads[quadsToUse[1]].y1, quads[quadsToUse[1]].y2)};
    points[2] = {x:getRandomInt(quads[quadsToUse[2]].x1, quads[quadsToUse[2]].x2), y:getRandomInt(quads[quadsToUse[2]].y1, quads[quadsToUse[2]].y2)};
    
    globalCanvasContext.fillStyle = '#0000ff';
    globalCanvasContext.beginPath();
    // Draw a triangle having each point (it will return to first point)
    globalCanvasContext.moveTo(points[0].x, points[0].y);
    globalCanvasContext.lineTo(points[1].x, points[1].y);
    globalCanvasContext.lineTo(points[2].x, points[2].y);
    globalCanvasContext.closePath();
    globalCanvasContext.fill();
    //globalCanvasContext.stroke();
}

function drawSquare()
{
    //rotated square not yet supported (but would be lovely)
    //ignoring of a too small square not yet supported
    
    //get four points (that are joined by *straight* lines)
    var points = [];
    
    //first point, anywhere in top-left quad
    points[0] = {x:getRandomInt(0, globalCanvasWidth / 2), y:getRandomInt(0, globalCanvasHeight / 2)};
    
    //next point, anywhere in top-right quad BUT level with previous point
    //(AND not so that the square's dimension is greater than globalMaxSquareSize)
    points[1] = {x:getRandomInt(globalCanvasWidth / 2, globalCanvasWidth), y:points[0].y};
    
    //size limiting (to avoid rectangles which nobody likes!)
    if(points[1].x - points[0].x > globalMaxSquareSize)
    {
        points[1].x = globalMaxSquareSize + points[0].x;
    }
    
    var squareSize = points[1].x - points[0].x;
    
    //next point, the point in bottom-right quad that's level with previous point and same length as point 0 x to point 1 x
    points[2] = {x:points[1].x, y:points[1].y + squareSize};
    
    //last point, the point in bottom-left quad that is level with previous point and first point
    points[3] = {x:points[0].x, y:points[2].y};
    
    //now, square could be cut off at the bottom if it has a large height but starts low
    //so let's fix that
    var overflow = (points[0].y + squareSize) - globalCanvasHeight;
    
    if(overflow > 0)
    {
        //alert('overflowed');
        for(var loop = 0; loop < points.length; loop++)
        {
            points[loop].y = points[loop].y - overflow;
        }
    }
    
    
    globalCanvasContext.fillStyle = '#0000ff';
    globalCanvasContext.beginPath();
    // Draw a square having each point (it will return to first point)
    globalCanvasContext.moveTo(points[0].x, points[0].y);
    globalCanvasContext.lineTo(points[1].x, points[1].y);
    globalCanvasContext.lineTo(points[2].x, points[2].y);
    globalCanvasContext.lineTo(points[3].x, points[3].y);
    globalCanvasContext.closePath();
    globalCanvasContext.fill();
    //globalCanvasContext.stroke();
}

//TODO make drawSquare use sizing and positioning logic more like this function
function drawCircle()
{
    var maxRadius = globalMaxSquareSize / 2;
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
    
    globalCanvasContext.fillStyle = '#0000ff';
    globalCanvasContext.beginPath();
    globalCanvasContext.arc(centreX, centreY, radius, 0, 2 * Math.PI);
    globalCanvasContext.fill();
    //globalCanvasContext.stroke();
}