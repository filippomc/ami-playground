import math

import numpy as np

from backend.settings import VOXEL_SIZE


def _rotation_matrix(axis, angle):
    """
    The rotation_matrix function takes an angle (in degrees) and an axis of rotation as input,
    and returns the corresponding 3D rotation matrix.
    """
    # Convert angle to radians
    angle = math.radians(angle)
    # Compute the components of the rotation matrix
    cos_theta = math.cos(angle)
    sin_theta = math.sin(angle)
    if axis == 'x':
        rot_mat = np.array([[1, 0, 0],
                            [0, cos_theta, -sin_theta],
                            [0, sin_theta, cos_theta]])
    elif axis == 'y':
        rot_mat = np.array([[cos_theta, 0, sin_theta],
                            [0, 1, 0],
                            [-sin_theta, 0, cos_theta]])
    elif axis == 'z':
        rot_mat = np.array([[cos_theta, -sin_theta, 0],
                            [sin_theta, cos_theta, 0],
                            [0, 0, 1]])
    else:
        raise ValueError(f"Invalid axis: {axis}")
    return rot_mat


def _scale_matrix(axis, value):
    """
    The scale_matrix function takes a scalar value or a 3-element array of scaling factors as input, and returns the
    corresponding 3D scaling matrix.
    """
    # Build the scaling matrix
    scale_mat = np.eye(4)
    if axis == 'x':
        scale_mat[0, 0] = value
    elif axis == 'y':
        scale_mat[1, 1] = value
    elif axis == 'z':
        scale_mat[2, 2] = value
    else:
        raise ValueError(f"Invalid axis: {axis}")
    return scale_mat


def _position_matrix(axis, value):
    """
    The position_matrix function takes a 3-element array of translation values as input, and returns the corresponding 4x4
    translation matrix.
    """
    # Build the translation matrix
    pos_mat = np.eye(4)
    if axis == 'x':
        pos_mat[0, 3] = value
    elif axis == 'y':
        pos_mat[1, 3] = value
    elif axis == 'z':
        pos_mat[2, 3] = value
    else:
        raise ValueError(f"Invalid axis: {axis}")
    return pos_mat


def get_affine_matrix(base, transform_type, axis, value):
    # todo: Fix numpy.linalg.LinAlgError: Singular matrix
    # Build the appropriate affine transformation matrix
    if transform_type == 'rotation':
        aff_mat = np.eye(4)
        aff_mat[:3, :3] = _rotation_matrix(axis, value)
    elif transform_type == 'scale':
        aff_mat = _scale_matrix(axis, _get_effective_value(base, value, axis))
    elif transform_type == 'position':
        aff_mat = _position_matrix(axis, _get_effective_value(base, value, axis))
    else:
        raise ValueError(f"Invalid transform type: {transform_type}")
    return aff_mat


def _get_effective_value(voxels, percentage_value, axis, voxel_size=VOXEL_SIZE):
    # Calculate the physical dimensions of the object in each axis
    num_voxels = len(voxels)
    dimensions = num_voxels * voxel_size

    # Calculate the effective value in distance units
    effective_value = dimensions * percentage_value / 100.0

    return effective_value
