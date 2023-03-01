from pathlib import Path

import nibabel as nib

base_file = nib.load(f"{Path(__file__).absolute().parent}/data/base.nii.gz")
overlay_file = nib.load(f"{Path(__file__).absolute().parent}/data/overlay.nii.gz")

orientation_map = {
    'axial': 2,
    'sagittal': 0,
    'coronal': 1
}