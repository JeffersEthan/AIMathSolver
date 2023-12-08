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

// function getCanvasBoundingRect(canvas, ctx) {
//     let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     let counter = 0;
//     const pixels = Array.from(imgData.data).filter(() => {
//         if (counter === 3) {
//             counter = 0;
//             return true;
//         }
//         counter++;
//         return false;
//     });
//     //  Find top and bottom boundaries
//     let top = null;
//     let bottom = null;
//     let left = canvas.width;
//     let right = 0;
//
//     //console.log(pixels)
//
//     for (let y = 0; y < pixels.length - canvas.width; y += canvas.width) {
//         const row = pixels.slice(y, y + canvas.width);
//         if (row.some(pixel => pixel > 0)) {
//             //  If we have no top yet, then this is it
//             if (top === null)
//                 top = y == 0 ? 0 : y / canvas.width;
//             //  This is the bottommost row we found so far
//             bottom = y / canvas.width;
//
//             //  Find leftmost and rightmost pixels
//             let leftmost = null;
//             let rightmost = null;
//             for (x = 0; x < row.length; x++) {
//                 if (!!row[x]) {
//                     if (leftmost === null)
//                         leftmost = x;
//                     rightmost = x;
//                 }
//             }
//
//             if (leftmost < left) left = leftmost;
//             if (rightmost > right) right = rightmost;
//         }
//     }
//
//     console.log(`${left} ; ${top} - ${right} ; ${bottom}`);
//     return {left: left, top: top, right: right, bottom: bottom}
// }

function convertToPng() {
    const canvas = document.getElementsByTagName('canvas')[0]
    //ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    //return croppedCanvas.toDataURL('image/png')
    return canvas.toDataURL('image/png')
}

function pngToCanvas(img) {
    let canvas1 = document.createElement("canvas");
    canvas1.width = 500
    canvas1.height = 500

    let ctx1 = canvas1.getContext("2d");

    ctx1.drawImage(img, 0, 0, canvas1.width, canvas1.height);


    // let centerX = canvas1.width / 2 + 100;
    // let centerY = canvas1.height / 2;
    // ctx1.fillStyle = "black";
    // ctx1.beginPath();
    // ctx1.arc(centerX, centerY, 100, 0, 2 * Math.PI);
    // ctx1.fill();
    // ctx1.closePath();



    //-------------------------------------------
    ////let img = new Image();
    // img.src = "https://pbs.twimg.com/profile_images/1385590079117303810/SZDo82wS_400x400.jpg";
    //
    // const canvas = document.createElement("canvas")
    // canvas.width = 500;
    // canvas.height = 500;
    // let ctx = canvas.getContext('2d')
    // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // let bounds = getCanvasBoundingRect(canvas, ctx)
    // console.log(bounds)
    //-------------------------------------------------
    // img.src = canvas1.toDataURL();
    //
    // const canvas2 = document.createElement("canvas")
    // canvas2.width = 500;
    // canvas2.height = 500;
    // let ctx = canvas2.getContext('2d')
    // ctx.drawImage(img, 0, 0, canvas2.width, canvas2.height);
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
    dialImg.width = 400
    dialImg.height = 400
    dialImg.src = newCanvas.toDataURL('image/png')



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

// this will be the base method for sending image to the server and displaying the response
function translate() {
    const data = convertToPng()


    //   sendDataGetLatec(data)
    //       .then(response => {
    //           if (!response.ok) {
    //               throw new Error(`HTTP error! Status: ${response.status}`);
    //           }
    //           // Assuming the server sends the image as a response
    //           return response.blob();
    //       })
    //       .then(blob => {
    //   return blob.text();
    // })
    // .then(textContent => {
    //     let paragraph = document.querySelector('dialog p');
    //     paragraph.innerHTML = textContent
    //     console.log(textContent)
    // })
    // .catch(error => {
    //   console.error('Error:', error);
    // });


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
    //const img = document.getElementById('result-image');
            const newImg = new Image();
            newImg.src = `data:image/png;base64,${image}`;
            newImg.width = 500
            newImg.height = 500

            newImg.onload = () => {
                pngToCanvas(newImg)
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
        translate()
        dialog.showModal();
        closeButton.addEventListener("click", () => {
            dialog.close();
        });
    }

}

function loadHomePage() {
    initDrawingArea()
    sideBarActivity()
    submitImage()

}

window.onload = () => {
    initDrawingArea()
    sideBarActivity()
    submitImage()
}
