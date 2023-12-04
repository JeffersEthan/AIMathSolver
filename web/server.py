from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

from PIL import Image
from io import BytesIO
import base64

from interact import init, interpret

app = Flask(__name__)
CORS(app)


def display_img(img):
    image_data = base64.b64decode(img)
    image_stream = BytesIO(image_data)
    image = Image.open(image_stream)
    image.show()


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
    res_img = interpret(img)    # call to model api
    display_img(res_img)

    return jsonify({'message': 'Data received successfully'}), 200  # todo send back AI result


@app.route('/home', methods=['GET'])
def handle_home_request():
    return render_template('home.html')


@app.route('/', methods=['GET'])
def handle_idx_request():
    return render_template('title.html')


if __name__ == '__main__':
    # initialize model stuff
    init("COCO-Detection/faster_rcnn_R_50_FPN_3x.yaml",
         'web/finalweights.pth')

    app.run(debug=True, host='0.0.0.0')
