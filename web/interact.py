#from ezdxf.addons.drawing.dxf import ColorMode
import matplotlib.pyplot as plt
import io
import numpy as np
import cv2
# import detectron2repo
# from detectron2.config import get_cfg
# from detectron2.data import MetadataCatalog
# from detectron2.engine import DefaultPredictor
# from detectron2.model_zoo import model_zoo
# from detectron2.utils.visualizer import Visualizer
#
# cfg = get_cfg()
# keys = ['\\lim_', 'a', '\\to', '\\frac', '\\pi', '4', 'd', '\\left(',
#         '\\sin', '+', '-', '6', '\\sec', '\\right)', 'w', '/', '5', '\\tan', '2', '3', 'e', 'b', '7',
#         '\\cos', '\\theta', '8', '=', 'x', '9', '1', 'y', 'h', 'k', 'g', '\\csc', '\\infty', '0', '\\sqrt', 'r',
#         '\\ln', 'n', 'u', '\\cot', '\\left|', '\\right|', 'p', 't', 'z', '\\log', 'v', 's', 'c', '\\cdot', '.']
# MetadataCatalog.get("math_metadata").thing_classes = list(keys)
#
#
# def init(model_yaml, model_weights):
#     cfg.merge_from_file(model_zoo.get_config_file(model_yaml))
#     cfg.MODEL.WEIGHTS = model_weights
#     cfg.MODEL.ROI_HEADS.NUM_CLASSES = 54
#
#
# def interpret(png_image):
#     # convert png image to cv2
#     png_np_array = np.frombuffer(png_image, np.uint8)
#     cv2_image = cv2.imdecode(png_np_array, cv2.IMREAD_COLOR)
#
#     # send through model
#     predictor = DefaultPredictor(cfg)
#     outputs = predictor(cv2_image)
#     print(outputs)
#     v = Visualizer(cv2_image[:, :, ::-1],
#                    metadata=MetadataCatalog.get("math_metadata"),
#                    scale=0.5,
#                    instance_mode=ColorMode.IMAGE_BW   # remove the colors of unsegmented pixels. This option is only available for segmentation models
#     )
#     # draw output from model as plot
#     out = v.draw_instance_predictions(outputs["instances"].to("cpu"))
#     plt.imshow(out.get_image()[:, :, ::-1], cmap = 'gray', interpolation = 'bicubic')
#     plt.xticks([]), plt.yticks([])  # to hide tick values on X and Y axis
#
#     # save plot as image
#     buffer = io.BytesIO()
#     plt.savefig(buffer, format='png')
#     buffer.seek(0)
#
#     return buffer.getvalue()


def get_center(bounding_rect):
    return (bounding_rect[0] + bounding_rect[2]) / 2, (bounding_rect[1] + bounding_rect[3]) / 2


def get_intersection_ratio(bounding_rect1, bounding_rect2):
    min_x1, min_y1, max_x1, max_y1 = bounding_rect1
    min_x2, min_y2, max_x2, max_y2 = bounding_rect2

    dx = min(max_x1, max_x2) - max(min_x1, min_x2)
    dy = min(max_y1, max_y2) - max(min_y1, min_y2)

    if dx > 0 and dy > 0:
        return (dx * dy) / ((max_x2 - min_x2) * (max_y2 - min_y2))
    else:
        return 0


def nearest_limit_var_symbol(limit_coords, approach_sym_coords, components):
    nearest_symbol_idx = -1
    # tracking the smallest distance from symbol to limit
    smallest_x = 100000
    smallest_y = 100000

    for index, item in enumerate(components):
        if item == -1:
            continue
        if item[0] == '\\lim_' or item[0] == '\\to':
            continue
        symbol_center = get_center(item[1])

        x_distance = symbol_center[0] - limit_coords[0]
        y_distance = symbol_center[1] - limit_coords[3]

        # check symbol distance relative to limit
        if x_distance < smallest_x and y_distance < smallest_y:
            smallest_x = x_distance
            smallest_y = y_distance
            nearest_symbol_idx = index

        # check symbol distance relative to approach symbol
        elif (limit_coords[0] <= symbol_center[0] <= approach_sym_coords[0]) and (
                # multiply by factors of 0.8 and 1.2 to account for minor discrepancies in coordinates
                approach_sym_coords[1] * 0.8 <= symbol_center[1] <= approach_sym_coords[3] * 1.2):
            nearest_symbol_idx = index

    return nearest_symbol_idx


def nearest_limit_lim_symbol(limit_coords, approach_sym_coords, components):
    nearest_symbol_idx = -1
    # tracking the smallest distance from symbol to limit
    smallest_x = 100000
    smallest_y = 100000

    for index, item in enumerate(components):
        if item == -1:
            continue
        if item[0] == '\\lim_' or item[0] == '\\to':
            continue
        symbol_center = get_center(item[1])

        x_distance = symbol_center[0] - limit_coords[2]
        y_distance = symbol_center[1] - limit_coords[3]

        # check symbol distance relative to limit
        if x_distance < smallest_x and y_distance < smallest_y:
            smallest_x = x_distance
            smallest_y = y_distance
            nearest_symbol_idx = index

        # check symbol distance relative to approach symbol
        elif (approach_sym_coords[2] <= symbol_center[0] <= limit_coords[2]) and (
                # multiply by factors of 0.8 and 1.2 to account for minor discrepancies in coordinates
                approach_sym_coords[1] * 0.8 <= symbol_center[1] <= approach_sym_coords[3] * 1.2):
            nearest_symbol_idx = index

    return nearest_symbol_idx


def nearest_approach_symbol(limit_coords, components):
    nearest_symbol_idx = -1
    smallest_x = 100000
    smallest_y = 100000

    for index, item in enumerate(components):
        if item == -1:
            continue
        if item[0] == '\\to':
            symbol_coords = item[1]
            x_distance = symbol_coords[0] - limit_coords[0]  # use lower x coords of each bounding rect
            y_distance = symbol_coords[3] - limit_coords[1]  # use higher y coord of limit and lower y coord of symbol

            if x_distance < smallest_x and y_distance < smallest_y:
                smallest_x = x_distance
                smallest_y = y_distance
                nearest_symbol_idx = index  # track where to find the symbol in the component list

    return nearest_symbol_idx


def parse_limit(limit_idx, limit_coords, components):
    approach_idx = nearest_approach_symbol(limit_coords, components)
    variable_idx = nearest_limit_var_symbol(limit_coords, components[approach_idx][1], components)
    lim_idx = nearest_limit_lim_symbol(limit_coords, components[approach_idx][1], components)

    expression = '\\lim_{{' + components[variable_idx][0] + ' \\to ' + components[lim_idx][0] + '}} '

    # mark the above components as being added to expression, so they aren't reused
    indices = [limit_idx, approach_idx, variable_idx, lim_idx]
    for i in indices:
        components[i] = -1

    return expression


def parse_fraction(frac_bar_idx, frac_bar_coords, components):
    numerator_components = []
    denominator_components = []

    for index, component in enumerate(components):
        if component == -1 or index == frac_bar_idx:
            continue

        if get_center(component[1])[1] <= get_center(frac_bar_coords)[1]:
            numerator_components.append(component)
        else:
            denominator_components.append(component)

        components[index] = -1

    components[frac_bar_idx] = -1
    return numerator_components, denominator_components


def parse_sqrt(sqrt_idx, sqrt_coords, components):
    inner_components = []

    for index, component in enumerate(components):
        if component == -1 or index == sqrt_idx:
            continue

        # if more than 80% of this components area is within the bounding rectangle of the sqrt symbol
        if get_intersection_ratio(sqrt_coords, component[1]) >= 0.8:
            components[index] = -1
            inner_components.append(component)

    components[sqrt_idx] = -1
    return inner_components


def rec_parse_res(components, end_index, index=0, exp_builder='', close_parenthesis=False):
    if index == end_index:  # base case
        return exp_builder

    component = components[index]
    if component == -1:  # symbol has already been added to exp_builder, so we move on
        return rec_parse_res(components, end_index, index + 1, exp_builder)

    symbol = component[0]
    if symbol == '\\lim_':
        return rec_parse_res(components, end_index, index + 1, exp_builder + parse_limit(index, component[1], components))

    elif symbol in ['\\sec', '\\tan', '\\cos', '\\csc', '\\cot', '\\sin']:
        # todo close_parenthesis only works if the following symbol is a variable.
        #  Change this approach to something like how sqrt is handled
        return rec_parse_res(components, end_index, index + 1, exp_builder + symbol + '(', close_parenthesis=True)

    elif symbol == '\\frac':
        numerator_components, denominator_components = parse_fraction(index, component[1], components)
        return (exp_builder + '(' + rec_parse_res(numerator_components, len(numerator_components)) +
                ') / (' + rec_parse_res(denominator_components, len(denominator_components)) + ')')

    # elif symbol in ['\\log', '\\ln']:
        # todo this will just be appended as a normal symbol for now

    elif symbol == '\\sqrt':
        inner_components = parse_sqrt(index, component[1], components)
        sqrt_latex = '\\sqrt{' + rec_parse_res(inner_components, len(inner_components)) + '}'

        return rec_parse_res(components, end_index, index + 1, exp_builder + sqrt_latex)

    else:
        components[index] = -1
        # may need closing parenthesis depending on previous symbol
        exp_builder += symbol + ')' if close_parenthesis else symbol
        return rec_parse_res(components, end_index, index + 1, exp_builder)


def parse_res(expression_boxes, predicted_labels, latex_keys):
    components = map_labels(expression_boxes, predicted_labels, latex_keys)
    expression = rec_parse_res(components, len(components))

    # todo send expression to some api
    return expression


def map_labels(expression_boxes, predicted_labels, latex_keys):
    expressions = list(zip(predicted_labels, expression_boxes))
    expressions.sort(key=lambda exp: exp[1][0])

    return [[latex_keys[exp[0]], exp[1]] for exp in expressions]


def invert(original_dict):
    return {value: key for key, value in original_dict.items()}


# ------- for testing -------
exp_boxes = [
    [10.8068, 73.4069, 220.5727, 187.0229],
    [54.5637, 222.9166, 113.1743, 250.4551],
    [482.0543, 100.2875, 548.4798, 117.3341],
    [568.0111, 26.9270, 688.7905, 129.0062],
    [129.4416, 188.8115, 175.1222, 255.6254],
    [679.0231, 305.3786, 757.3752, 322.7954],
    [548.4131, 240.2029, 663.1025, 352.3607],
    [5.2613, 194.7897, 53.5480, 250.6182],
    [363.9603, 42.4444, 468.4120, 146.9426],
    [683.0955, 32.6520, 767.7201, 179.8736],
    [325.3777, 174.5259, 647.8566, 474.2382],
    [275.9488, 169.0730, 745.0270, 180.1284],
]

labels = [0, 2, 10, 25, 11, 10, 27, 27, 27, 16, 37, 3]
symbols = {'\\lim_': 0, 'a': 1, '\\to': 2, '\\frac': 3, '\\pi': 4, '4': 5, 'd': 6, '\\left(': 7, '\\sin': 8, '+': 9,
           '-': 10, '6': 11, '\\sec': 12, '\\right)': 13, 'w': 14, '/': 15, '5': 16, '\\tan': 17, '2': 18, '3': 19,
           'e': 20, 'b': 21, '7': 22, '\\cos': 23, '\\theta': 24, '8': 25, '=': 26, 'x': 27, '9': 28, '1': 29, 'y': 30,
           'h': 31, 'k': 32, 'g': 33, '\\csc': 34, '\\infty': 35, '0': 36, '\\sqrt': 37, 'r': 38, '\\ln': 39, 'n': 40,
           'u': 41, '\\cot': 42, '\\left|': 43, '\\right|': 44, 'p': 45, 't': 46, 'z': 47, '\\log': 48, 'v': 49,
           's': 50, 'c': 51, '\\cdot': 52, '.': 53}

print(parse_res(exp_boxes, labels, invert(symbols)))