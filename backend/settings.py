from pathlib import Path

import nibabel as nib

base_data = nib.load(f"{Path(__file__).absolute().parent}/data/base.mgz")
overlay_data = nib.load(f"{Path(__file__).absolute().parent}/data/overlay.nii.gz")

orientation_map = {
    'axial': 2,
    'sagittal': 0,
    'coronal': 1
}

VOXEL_SIZE = 1  # mm
