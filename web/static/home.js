let colorLine = '#000'
let erase = false;
let widthPopupShowing = false;

function initDrawingArea() {
    const canvas = document.getElementsByTagName('canvas')[0];
    const context = canvas.getContext('2d');
    context.fillStyle = colorLine;
    context.lineWidth = 5;

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
        context.beginPath();
        context.arc(target[0], target[1], 20, 0, 2 * Math.PI);
        context.fillStyle = "#ffffff";
        context.fill();
        context.closePath();
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

function getCanvasBoundingRect(canvas, ctx) {
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    // Find top and bottom boundaries
    let top = null;
    let bottom = null;
    let left = canvas.width;
    let right = 0;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4; // Each pixel has 4 values (R, G, B, A)

            // Check if the pixel is white (assuming white is [255, 255, 255, 255])
            if (pixels[index] === 255 && pixels[index + 1] === 255 && pixels[index + 2] === 255 && pixels[index + 3] === 255) {
                if (top === null) top = y;
                bottom = y;

                if (x < left) left = x;
                if (x > right) right = x;
            }
        }
    }
    // If no white pixels were found, set default values
    if (top === null) top = 0;
    if (bottom === null) bottom = canvas.height - 1;
    if (left === canvas.width) left = 0;
    if (right === 0) right = canvas.width - 1;

    return { top, bottom, left, right };
}

function convertToPng() {
    const canvas = document.getElementsByTagName('canvas')[0]
    return canvas.toDataURL('image/png')
}

function pngToCanvas(img) {
    let canvas1 = document.createElement("canvas");
    canvas1.width = 500
    canvas1.height = 500
    let ctx1 = canvas1.getContext("2d");

    ctx1.drawImage(img, 0, 0, canvas1.width, canvas1.height);

    let bounds = getCanvasBoundingRect(canvas1, ctx1)
    console.log(bounds)

    const newCanvas = document.createElement("canvas")
    newCanvas.width = bounds.right-bounds.left
    newCanvas.height = bounds.bottom - bounds.top
    let newCtx = newCanvas.getContext('2d')
    newCtx.drawImage(canvas1, bounds.left, bounds.top, bounds.right-bounds.left,
        bounds.bottom - bounds.top, 0, 0, bounds.right-bounds.left,
        bounds.bottom - bounds.top);

    const dialImg = document.getElementById('result-image');
    dialImg.width = 650
    dialImg.height = 650
    dialImg.src = newCanvas.toDataURL('image/png')
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

function sendDataGetLatec(data) {
    return fetch(`http://127.0.0.1:5000/image-latex/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'image': data
        })
    });
}

function translate() {
    const data = convertToPng()

    sendData(data)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(json => {
            let image = json.image;
            let latex = json.latex;

            const newImg = new Image();
            newImg.src = `data:image/png;base64,${image}`;
            newImg.width = 700;
            newImg.height = 700;

            newImg.onload = () => {
                document.getElementById('result-image').src = newImg.src
            }
            document.getElementById("latex-view").innerHTML = latex
    })
    .catch(error => console.error('Error: ', error))
}

function submitImage() {
    const submitButton = document.getElementById('submit-button')
    const dialog = document.querySelector("dialog");
    const closeButton = document.querySelector("dialog button");
    submitButton.onclick = () => {
        document.getElementById('result-image').src = ''
        document.getElementById('latex-view').innerHTML = ''

        translate()
        dialog.showModal();
        closeButton.addEventListener("click", () => {
            dialog.close();
        });
    }
}

window.onload = () => {
    initDrawingArea()
    sideBarActivity()
    submitImage()
}
