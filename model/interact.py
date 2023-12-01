import detectron2
from detectron2 import model_zoo
from detectron2.engine import DefaultPredictor
from detectron2.config import get_cfg
from detectron2.utils.visualizer import Visualizer
from detectron2.data import MetadataCatalog, DatasetCatalog
from detectron2.structures import BoxMode
from ezdxf.addons.drawing.dxf import ColorMode
import matplotlib.pyplot as plt
import io
import numpy as np
import cv2

cfg = get_cfg()


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
    v = Visualizer(cv2_image[:, :, ::-1],
                   metadata=MetadataCatalog.get("calc_testing"),
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
