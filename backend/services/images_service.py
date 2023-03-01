from backend.helpers.images_helper import get_image
from backend.settings import orientation_map, base_file, overlay_file


def get_images():
    images = []
    for key in orientation_map:
        images.append(get_image(base_file, overlay_file, key))
    return images
