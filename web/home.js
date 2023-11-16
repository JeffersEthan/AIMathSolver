
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

function convertToPng() {
    const canvas = document.getElementsByTagName('canvas')[0]
    return canvas.toDataURL('image/png')
}

function displayTranslation(data) {
    // this will be for displaying the response from the server containing the translated expression (the data parameter)
}

function sendData(data) {
    return fetch(`http://127.0.0.1:5000/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            'image': data
        }
    });
}

// this will be the base method for sending image to the server and displaying the response
function translate() {
    const data = convertToPng()
    sendData(data)
        .then(response => console.log(response))
        .catch(error => console.error(error))
}

window.onload = () => {
    initDrawingArea()
    document.getElementsByTagName('button')[0].onclick = translate
}