from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
from PIL import Image
from io import BytesIO
import base64

from interact import init, interpret

app = Flask(__name__)
CORS(app)


def create_img(png):
    """
    The image is transparent when it is received, need to add a white background
    """
    image_data = base64.b64decode(png)
    image_stream = BytesIO(image_data)
    foreground = Image.open(image_stream)
    background = Image.new('RGB', foreground.size, 'white')
    background.paste(foreground, (0, 0), foreground.convert("RGBA"))
    background.save("input_image.png")


@app.route('/image/', methods=['POST'])
def handle_img_post():
    img = request.get_json()['image']

    if not img:
        return jsonify({'error': 'Invalid body'}), 400

    # check image is a PNG
    img_start = str(img).find('iVBOR')
    if img_start == -1:
        return jsonify({'error': 'Invalid image format'}), 400

    img = str(img)[img_start:]
    create_img(img)
    buffer, res_latex = interpret("")    # call to model api
    encoded_image = base64.b64encode(buffer.read()).decode('utf-8')
    return jsonify({'latex': res_latex, 'image': encoded_image})


@app.route('/home', methods=['GET'])
def handle_home_request():
    return render_template('home.html')


@app.route('/', methods=['GET'])
def handle_idx_request():
    return render_template('title.html')


if __name__ == '__main__':
    init("COCO-Detection/faster_rcnn_R_50_FPN_3x.yaml",
         'web/finalweights.pth')

    app.run(debug=True, host='0.0.0.0')
