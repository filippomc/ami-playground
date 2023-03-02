import base64
import io

import mne as mne
import nibabel as nib
import numpy as np
import matplotlib.pyplot as plt

from backend.helpers.transforms_helpers import get_affine_matrix
from backend.settings import orientation_map, base_data, VOXEL_SIZE

base = nib.orientations.apply_orientation(
    np.asarray(base_data.dataobj), nib.orientations.axcodes2ornt(
        nib.orientations.aff2axcodes(base_data.affine))).astype(np.float32)


def _generate_image(overlay, orientation, alpha=0.5):
    """Define a helper function for comparing plots."""

    overlay = nib.orientations.apply_orientation(
        np.asarray(overlay.dataobj), nib.orientations.axcodes2ornt(
            nib.orientations.aff2axcodes(overlay.affine))).astype(np.float32)

    # Set the physical size of each voxel (in millimeters)
    voxel_size = VOXEL_SIZE

    image_size = len(base)

    # Calculate the appropriate figsize in inches
    figsize = (image_size * voxel_size / 25.4, image_size * voxel_size / 25.4)

    fig, ax = plt.subplots(1, 1, figsize=figsize)
    i = orientation_map[orientation]
    ax.imshow(np.take(base, [base.shape[i] // 2], axis=i).squeeze().T,
              cmap='gray')
    ax.imshow(np.take(overlay, [overlay.shape[i] // 2],
                      axis=i).squeeze().T, cmap='gist_heat', alpha=alpha)
    ax.invert_yaxis()
    ax.axis('off')

    fig.tight_layout()
    return fig


def get_image(overlay, orientation, alpha=0.5):
    fig = _generate_image(overlay, orientation, alpha)
    # Save the figure to a BytesIO object
    buf = io.BytesIO()
    fig.savefig(buf, format='png', transparent=True)
    buf.seek(0)
    plt.close('all')
    return base64.b64encode(buf.getvalue()).decode('utf-8')


def get_aligned_overlay(overlay, transform, axis, value):
    return mne.transforms.apply_volume_registration(base_data, overlay, get_affine_matrix(base, transform, axis, value),
                                                    cval='1%')
