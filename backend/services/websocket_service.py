from backend.helpers.images_helper import get_image, get_aligned_overlay
from backend.settings import orientation_map, overlay_data


def get_images(o_data=overlay_data):
    images = []
    for key in orientation_map:
        images.append(get_image(o_data, key))
    return images


def get_aligned_images(transform, axis, value):
    aligned_overlay = get_aligned_overlay(overlay_data, transform, axis, value)
    return get_images(aligned_overlay)
