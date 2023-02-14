/*

This script shows a strategy to load two nifti volumes and display them one above the other.
The strategy used is to display the two volumes in two different scenes and render them in two
different canvases, which are placed with css.

*/

import * as THREE from 'three';
window.THREE = THREE;
import * as AMI from 'ami.js';
import { colors } from './utils';
import dat from 'dat.gui';

window.AMI = AMI;

const StackHelper = AMI.stackHelperFactory(THREE);
const OrthographicCamera = AMI.orthographicCameraFactory(THREE);
const TrackballOrthoControl = AMI.trackballOrthoControlFactory(THREE);
const HelpersLut = AMI.lutHelperFactory(THREE);

// Setup renderer
const container = document.getElementById('r3d');
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setClearColor(colors.darkGrey, 1);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const container2 = document.getElementById('r3d2');
const renderer2 = new THREE.WebGLRenderer({
  antialias: true,
});
renderer2.setSize(container2.offsetWidth, container2.offsetHeight);
renderer2.setClearColor(colors.darkGrey, 1);
renderer2.setPixelRatio(window.devicePixelRatio);
container2.appendChild(renderer2.domElement);

const scene = new THREE.Scene();
const scene2 = new THREE.Scene();

const camera = new OrthographicCamera(
  container.clientWidth / -2,
  container.clientWidth / 2,
  container.clientHeight / 2,
  container.clientHeight / -2,
  0.1,
  10000
);



// Setup controls

const controls = new TrackballOrthoControl(camera, container);
controls.staticMoving = true;
controls.noRotate = true;
camera.controls = controls;

const onWindowResize = () => {
  camera.canvas = {
    width: container.offsetWidth,
    height: container.offsetHeight,
  };
  camera.fitBox(2);

  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer2.setSize(container.offsetWidth, container.offsetHeight);
};
window.addEventListener('resize', onWindowResize, false);


const lutLayer0 = new HelpersLut(
    'my-lut-canvases-l0',
    'default',
    'linear',
    [[0, 0, 0, 0], [1, 1, 1, 1]],
    [[0, 1], [1, 1]]
  );
lutLayer0.luts = HelpersLut.presetLuts();

lutLayer0.lut = "spectrum"; //lutLayer0.lutsAvailable()[3]
let data = [
    'patient2/7002_t1_average_BRAINSABC.nii.gz',
    'patient1/7001_t1_average_BRAINSABC.nii.gz',
    
  ];
let files = data.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/slicer_brain/' + v;
  });


const loader = new AMI.VolumeLoader(container);
loader
  .load(files)
  .then(() => {
    const series = loader.data[0].mergeSeries(loader.data);
    const stack = series[0].stack[0];
    const stack2 = series[1].stack[0];

    loader.free();

    const stackHelper = new StackHelper(stack);
    
    
    stackHelper.bbox.visible = false;
    stackHelper.border.color = colors.red;
    
    stackHelper.slice.lut = lutLayer0.lut;
    stackHelper.slice.lutTexture = lutLayer0.texture;
    scene.add(stackHelper);
    
    

    const stackHelper2 = new StackHelper(stack2);
    stackHelper2.bbox.visible = false;
    stackHelper2.border.color = colors.darkGrey;
    scene2.add(stackHelper2);

    gui(stackHelper, stackHelper2);

    // center camera and interactor to center of bouding box
    // for nicer experience
    // set camera
    const worldbb = stack.worldBoundingBox();
    const lpsDims = new THREE.Vector3(
      worldbb[1] - worldbb[0],
      worldbb[3] - worldbb[2],
      worldbb[5] - worldbb[4]
    );

    const box = {
      center: stack.worldCenter().clone(),
      halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10),
    };

    // init and zoom
    const canvas = {
      width: container.clientWidth,
      height: container.clientHeight,
    };

    camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
    camera.box = box;
    camera.canvas = canvas;
    camera.update();
    camera.fitBox(2);
  })
  .catch(error => {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });


const animate = () => {
  controls.update();
  renderer.render(scene, camera);
  renderer2.render(scene2, camera);

  requestAnimationFrame(function() {
    animate();
  });
};

animate();

const gui = (stackHelper, stackHelper2) => {
  const gui = new dat.GUI({
    autoPlace: false,
  });

  const customContainer = document.getElementById('my-gui-container');
  customContainer.appendChild(gui.domElement);
  const camUtils = {
    invertRows: false,
    invertColumns: false,
    rotate45: false,
    rotate: 0,
    orientation: 'default',
    convention: 'radio',
  };

  // camera
  const cameraFolder = gui.addFolder('Camera');
  const invertRows = cameraFolder.add(camUtils, 'invertRows');
  invertRows.onChange(() => {
    camera.invertRows();
  });

  const invertColumns = cameraFolder.add(camUtils, 'invertColumns');
  invertColumns.onChange(() => {
    camera.invertColumns();
  });

  const rotate45 = cameraFolder.add(camUtils, 'rotate45');
  rotate45.onChange(() => {
    camera.rotate();
  });

  cameraFolder
    .add(camera, 'angle', 0, 360)
    .step(1)
    .listen();

  const orientationUpdate = cameraFolder.add(camUtils, 'orientation', [
    'default',
    'axial',
    'coronal',
    'sagittal',
  ]);
  orientationUpdate.onChange(value => {
    camera.orientation = value;
    camera.update();
    camera.fitBox(2);
    stackHelper.orientation = camera.stackOrientation;
  });

  const conventionUpdate = cameraFolder.add(camUtils, 'convention', ['radio', 'neuro']);
  conventionUpdate.onChange(value => {
    camera.convention = value;
    camera.update();
    camera.fitBox(2);
  });

  cameraFolder.open();

  

  const stackFolder = gui.addFolder('Stack');

  
  const indexUpdate = stackFolder
    .add(stackHelper, 'index', 0, stackHelper.stack.dimensionsIJK.z - 1)
    .step(1)
    .listen();

  indexUpdate.onChange(function() {
    stackHelper2.index = stackHelper.index; // The two stack move together!
  });
  stackFolder
    .add(stackHelper.slice, 'interpolation', 0, 1)
    .step(1)
    .listen();

    let lutUpdate = stackFolder.add(stackHelper.slice, 'lut', lutLayer0.lutsAvailable());
    lutUpdate.onChange(function(value) {
      lutLayer0.lut = value;
      stackHelper.slice.lutTexture = lutLayer0.texture;
    });
  stackFolder.open();


};
