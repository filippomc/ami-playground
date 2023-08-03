from backend.helpers.images_helper import get_image
from backend.settings import orientation_map


def get_images(slice_index=None, alpha=0.5):
    images = []
    for key in orientation_map:
        images.append(get_image(key, slice_index, alpha))
    return images
