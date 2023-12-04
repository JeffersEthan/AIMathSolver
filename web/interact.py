#from ezdxf.addons.drawing.dxf import ColorMode
import matplotlib.pyplot as plt
import io
import numpy as np
import cv2
import detectron2repo
from detectron2.config import get_cfg
from detectron2.data import MetadataCatalog
from detectron2.engine import DefaultPredictor
from detectron2.model_zoo import model_zoo
from detectron2.utils.visualizer import Visualizer

cfg = get_cfg()
keys = ['\\lim_', 'a', '\\to', '\\frac', '\\pi', '4', 'd', '\\left(', 
        '\\sin', '+', '-', '6', '\\sec', '\\right)', 'w', '/', '5', '\\tan', '2', '3', 'e', 'b', '7', 
        '\\cos', '\\theta', '8', '=', 'x', '9', '1', 'y', 'h', 'k', 'g', '\\csc', '\\infty', '0', '\\sqrt', 'r', 
        '\\ln', 'n', 'u', '\\cot', '\\left|', '\\right|', 'p', 't', 'z', '\\log', 'v', 's', 'c', '\\cdot', '.']
MetadataCatalog.get("math_metadata").thing_classes = list(keys)

def init(model_yaml, model_weights):
    cfg.merge_from_file(model_zoo.get_config_file(model_yaml))
    cfg.MODEL.WEIGHTS = model_weights
    cfg.MODEL.ROI_HEADS.NUM_CLASSES = 54


def interpret(png_image):
    # convert png image to cv2
    png_np_array = np.frombuffer(png_image, np.uint8)
    cv2_image = cv2.imdecode(png_np_array, cv2.IMREAD_COLOR)

    # send through model
    predictor = DefaultPredictor(cfg)
    outputs = predictor(cv2_image)
    print(outputs)
    v = Visualizer(cv2_image[:, :, ::-1],
                   metadata=MetadataCatalog.get("math_metadata"),
                   scale=0.5,
                   instance_mode=ColorMode.IMAGE_BW   # remove the colors of unsegmented pixels. This option is only available for segmentation models
    )
    # draw output from model as plot
    out = v.draw_instance_predictions(outputs["instances"].to("cpu"))
    plt.imshow(out.get_image()[:, :, ::-1], cmap = 'gray', interpolation = 'bicubic')
    plt.xticks([]), plt.yticks([])  # to hide tick values on X and Y axis

    # save plot as image
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)

    return buffer.getvalue()
