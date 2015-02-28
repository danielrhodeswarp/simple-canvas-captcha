# simple-canvas-captcha

Unsophisticated, shape-based CAPTCHA using HTML5 &lt;canvas>

Sample server is PHP but could be any old gubbins.

## TODO

* reduce data length of hidden field that we submit with the form
* add colour question as well? (but colour-blind people / contrast with background etc etc)
* options to click the shape points as well / instead of answering the shape? (circle obvs excluded)
* certain sizes / shapes of triangles get detected as circles - clearly no good! Tends to be smaller, flatter triangles that are mostly vertical or mostly horizontal ifyouknowwhatimean