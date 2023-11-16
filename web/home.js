
let colorLine = '#000'

function initDrawingArea() {
    const canvas = document.getElementsByTagName('canvas')[0];
    const context = canvas.getContext('2d');
    context.fillStyle = colorLine;


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

const sideBarActivity = () => {
    onClearButton();
    onWidthChange();
    onRadioChange();
}

const onClearButton = () => {
    let clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', () => {
        let canvas = document.getElementsByTagName('canvas')[0];
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    });


}

const onRadioChange = () => {
    let erase = document.getElementById('erase');
    let regLine = document.getElementById('line');

    erase.addEventListener('click', () => {
        erase.checked = true;
        regLine.checked = false;
        let canvas = document.getElementsByTagName('canvas')[0];
        const context = canvas.getContext('2d');
        context.fillStyle = "FFF";

    });

    regLine.addEventListener('click', () => {
        erase.checked = false;
        regLine.checked = true;
        let canvas = document.getElementsByTagName('canvas')[0];
        const context = canvas.getContext('2d');
        context.fillStyle = '#000';
    });

}

const onWidthChange = () => {

}

window.onload = () => {
    sideBarActivity()
    initDrawingArea()

}
