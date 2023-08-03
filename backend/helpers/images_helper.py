import base64
import io

import matplotlib.pyplot as plt
import nibabel as nib
import numpy as np

from backend.settings import orientation_map, base_data, overlay_data, VOXEL_SIZE

base = nib.orientations.apply_orientation(
    np.asarray(base_data.dataobj), nib.orientations.axcodes2ornt(
        nib.orientations.aff2axcodes(base_data.affine))).astype(np.float32)

overlay = nib.orientations.apply_orientation(
    np.asarray(overlay_data.dataobj), nib.orientations.axcodes2ornt(
        nib.orientations.aff2axcodes(overlay_data.affine))).astype(np.float32)


def _generate_image(orientation, slice_index=None, alpha=0.5):
    """Define a helper function for comparing plots."""

    # Set the physical size of each voxel (in millimeters)
    voxel_size = VOXEL_SIZE

    image_size = len(base)

    # Calculate the appropriate figsize in inches
    figsize = (image_size * voxel_size / 25.4, image_size * voxel_size / 25.4)

    fig, ax = plt.subplots(1, 1, figsize=figsize)
    i = orientation_map[orientation]

    print(base.shape[i])
    if slice_index is None:
        slice_index = base.shape[i] // 2

    ax.imshow(np.take(base, [slice_index], axis=i).squeeze().T,
              cmap='gray')
    ax.imshow(np.take(overlay, [slice_index],
                      axis=i).squeeze().T, cmap='gist_heat', alpha=alpha)
    ax.invert_yaxis()
    ax.axis('off')

    fig.tight_layout()
    return fig


def get_image(orientation, slice_index=None, alpha=0.5):
    fig = _generate_image(orientation, slice_index, alpha)
    # Save the figure to a BytesIO object
    buf = io.BytesIO()
    fig.savefig(buf, format='png', transparent=True)
    buf.seek(0)
    plt.close('all')
    return base64.b64encode(buf.getvalue()).decode('utf-8')