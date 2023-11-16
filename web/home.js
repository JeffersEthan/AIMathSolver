/**
 * Initializes event handlers for the core elements of the page
 * (i.e. canvas, eraser button)
 */
function initDrawingArea() {
    const canvas = document.getElementsByTagName('canvas')[0];

    let isDragging = false;
    // update boolean value 'isDragging' when mouse is pressed down over canvas.
    canvas.onmousedown = () => {
        isDragging = true;
    };
    // update boolean value 'isDragging' when mouse is pressed down anywhere on document.
    // the event handler is set to the whole document in case the user drags their mouse off the canvas.
    document.onmouseup = () => {
        isDragging = false;
    };
    // turn off eraser when user selects color chooser.
    // event handler for drawing to/erasing from the canvas.
    canvas.onmousemove = (event) => {
        if (isDragging) {
            draw(canvas, event);
        }
    };
}

/**
 * Draws a shape to the canvas at the location of the user's mouse.
 * @param canvas Canvas element being drawn to.
 * @param event Mouse event within the canvas.
 * @param erase True if the user wants to erase from the canvas;
 *              false if the user wants to draw to the canvas
 */
function draw(canvas, event, erase=false) {

    const context = canvas.getContext('2d');
    const canvasLocation = canvas.getBoundingClientRect();
    const xCoordinate = event.clientX - canvasLocation.left;
    const yCoordinate = event.clientY - canvasLocation.top;

    if (erase) {    // erase from canvas
        context.globalCompositeOperation = 'destination-out';
        context.arc(xCoordinate, yCoordinate, 5, 0, 2 * Math.PI);
        context.fill();
    } else {        // draw to canvas
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = '#000';
        context.fillRect(xCoordinate, yCoordinate, 8, 8);
    }
}

window.onload = initDrawingArea