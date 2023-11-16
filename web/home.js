
function initDrawingArea() {
    const canvas = document.getElementsByTagName('canvas')[0];
    const context = canvas.getContext('2d');
    context.fillStyle = '#000';

    let source = [];
    let isDragging = false;

    canvas.onmousedown = (e) => {
        source = getCurrentCoordinates(e)
        isDragging = true;
    };
    document.onmouseup = () => {
        isDragging = false;
    };
    canvas.onmousemove = (event) => {
        if (isDragging) {
            const target = getCurrentCoordinates(event)
            draw(source, target, canvas);
            source = target
        }
    };
}

function getCurrentCoordinates(event) {
    const canvasLocation = document.getElementsByTagName('canvas')[0].getBoundingClientRect();
    return [event.clientX - canvasLocation.left, event.clientY - canvasLocation.top];
}

function draw(source, target, canvas) {
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(source[0], source[1]);
    ctx.lineTo(target[0], target[1]);
    ctx.stroke();
}

window.onload = initDrawingArea