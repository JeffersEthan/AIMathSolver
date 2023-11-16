let colorLine = '#000'
let erase = false;
let widthPopupShowing = false;

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

const onClearButton = () => {
    let clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', () => {
        let canvas = document.getElementsByTagName('canvas')[0];
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    });
}

function draw(source, target, canvas) {
    const context = canvas.getContext('2d');

    if (erase === true) {
        context.globalCompositeOperation = 'destination-out';
        context.arc(target[0], target[1], 5, 0, 2 * Math.PI);
        context.fill();
    } else {
        context.globalCompositeOperation = 'source-over';
        context.beginPath();
        context.moveTo(source[0], source[1]);
        context.lineTo(target[0], target[1]);
        context.stroke();
    }
}

const onToolChange = () => {
    const eraseOption = document.getElementById('erase');
    const lineOption = document.getElementById('line');

    eraseOption.addEventListener('click', () => {
        erase = true;
        lineOption.classList.remove('icon-selected');
        lineOption.classList.add('icon-unselected');
        eraseOption.classList.remove('icon-unselected');
        eraseOption.classList.add('icon-selected');
    });
    lineOption.addEventListener('click', () => {
        erase = false
        eraseOption.classList.remove('icon-selected');
        eraseOption.classList.add('icon-unselected');
        lineOption.classList.remove('icon-unselected');
        lineOption.classList.add('icon-selected');
    });
}

const onWidthChange = () => {
    const widthOption = document.getElementById('width');
    widthOption.onclick = toggleSliderPopup;

    const widthAdjuster = document.getElementById('width-adjustment')
    widthAdjuster.addEventListener('change', () => {
        let canvas = document.getElementsByTagName('canvas')[0];
        const context = canvas.getContext('2d');
        context.lineWidth = widthAdjuster.value;
    });
}

function toggleSliderPopup() {
    const widthOption = document.getElementById('width')
    const popup = document.getElementById('width-selector')

    if (widthPopupShowing === false) {
        widthPopupShowing = true
        const location = widthOption.getBoundingClientRect()
        popup.style.top = location.top + 'px';
        popup.style.left = location.right + 20 + 'px';

        popup.classList.remove('no-display')
        popup.classList.add('flex-display')
    } else {
        widthPopupShowing = false
        popup.classList.remove('flex-display');
        popup.classList.add('no-display')
    }

}

const sideBarActivity = () => {
    onClearButton();
    onWidthChange();
    onToolChange();
}

function convertToPng() {
    const canvas = document.getElementsByTagName('canvas')[0]
    return canvas.toDataURL('image/png')
}

function displayTranslation(data) {
    // this will be for displaying the response from the server containing the translated expression (the data parameter)
}

function sendData(data) {
    return fetch(`http://127.0.0.1:5000/image/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'image': data
        })
    });
}

// this will be the base method for sending image to the server and displaying the response
function translate() {
    const data = convertToPng()
    sendData(data)
        .then(response => console.log('Responded: ', response))
        .catch(error => console.error('Error: ', error))
}

window.onload = () => {
    initDrawingArea()
    sideBarActivity()
    document.getElementById('submit-button').onclick = () => translate()
}
