import base64
import io

import nibabel as nib
import numpy as np
import matplotlib.pyplot as plt

from backend.settings import orientation_map, base_file, overlay_file


def _generate_image(base, overlay, orientation, alpha=0.5):
    """Define a helper function for comparing plots."""
    base = nib.orientations.apply_orientation(
        np.asarray(base.dataobj), nib.orientations.axcodes2ornt(
            nib.orientations.aff2axcodes(base.affine))).astype(np.float32)
    overlay = nib.orientations.apply_orientation(
        np.asarray(overlay.dataobj), nib.orientations.axcodes2ornt(
            nib.orientations.aff2axcodes(overlay.affine))).astype(np.float32)

    # Set the physical size of each voxel (in millimeters)
    voxel_size = 1

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


def get_image(base, overlay, orientation, alpha=0.5):
    fig = _generate_image(base, overlay, orientation, alpha)

    # Save the figure to a BytesIO object
    buf = io.BytesIO()
    fig.savefig(buf, format='png', transparent=True)
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')


if __name__ == '__main__':
    _generate_image(base_file, overlay_file, 'sagittal')
    plt.show()
