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
        closeLineWidthPopup()
        if (erase === false) {
            selectOption('line')
        }
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

function selectOption(elementId) {
    const optionIds = ['erase', 'line', 'width', 'clear-button']

    // remove the selected style class from sidebar options before adding it to the given element 'elementId'
    for (const id of optionIds) {
        const element = document.getElementById(id)
        element.classList.remove('icon-unselected')
        element.classList.remove('icon-selected')

        if (id === elementId) {
            element.classList.add('icon-selected')
        } else {
            element.classList.add('icon-unselected')
        }
    }
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

        selectPen()
    });
}

function selectPen() {
    closeLineWidthPopup()
    erase = false
    selectOption('line')
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
    document.getElementById('erase').addEventListener('click', () => {
        closeLineWidthPopup()
        erase = true;
        selectOption('erase')
    });
    document.getElementById('line').addEventListener('click', () => {
        selectPen()
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
    const popup = document.getElementById('width-selector')

    if (widthPopupShowing === false) {
        widthPopupShowing = true
        const location = document.getElementById('width').getBoundingClientRect()
        popup.style.top = location.top + 'px';
        popup.style.left = location.right + 20 + 'px';

        popup.classList.remove('no-display')
        popup.classList.add('flex-display')

        erase = false
        selectOption('width')
    } else {
        closeLineWidthPopup()
    }
}

function closeLineWidthPopup() {
    if (widthPopupShowing === true) {
        widthPopupShowing = false
        const popup = document.getElementById('width-selector')
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

function loadHomePage() {
    initDrawingArea()
    sideBarActivity()
    document.getElementById('submit-button').onclick = () => translate()
}
