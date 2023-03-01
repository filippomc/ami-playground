export const file = 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/adi_brain/adi_brain.nii.gz';
export const file2 = 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/eun_brain/eun_uchar_8.nii.gz';
export const colors = {
  red: 0xff0000,
  blue: 0x0000ff,
  green: 0x00ff00,
  darkGrey: 0x353535,
  black: 0x00000000,
};
export const orderSeries = (files, series) => {
  return files.map((uri) => {
    return series.find((modelSeries) => modelSeries._seriesInstanceUID === uri);
  });
}