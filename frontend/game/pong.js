
import * as THREE from './node_modules/three/build/three.module.js';
import { keyStates, setupKeyControls} from './controls.js';
import { padMoveStepLength, tableHeight, tableLength, padLength, FPS, RGB_BALL, RGB_PAD_ENAMY, RGB_PAD_PLAYER, RGB_TABLE, padWidth, BALL_RADIUS, getBallSpeed, setBallSpeed} from './constants.js';
import { padEdgeCorrect} from './edgeJudge.js';
import { getPositionPadJSON, getPositionBallJSON } from './infoHandler.js';
import { sendInfoWS, closeWebSocket } from './socket.js';
import { OrbitControls } from './node_modules/three/build/OrbitControls.js';



var padYPositionPlayer = 0;
var padYPositionEnamy = 0;
let ballDirectionX = 0;
let ballDirectionY = 0;
let domPlayerScore;
let domEnamyScore;
let enamyScore;
let playerScore;
let ballSpeedX = getBallSpeed();
let ballSpeedY = getBallSpeed();
let gameType = '';
let Id = '';
let canvas;
let scene;
let geometry;
let padPlayer;
let padEnamy;  
let ball;
let materialTable;
let materialPadPlayer;
let materialPadEnamy;
let materialBall;
let mesh;
export let meshPadPlayer;
export let meshPadEnamy;
export let meshBall;
let axesHelper;
let light;
let computedStyle;
let width;
let height;
let fov;
let aspect;
let camera;
let renderer;
let controls;



// 改进碰撞检测逻辑
// improved collision detection logic
export function keyMovePad() {

    if (gameType === 'online') {

        if (keyStates['w'])
            meshPadPlayer.position.set(-tableLength / 2 + padWidth / 2, 10, padEdgeCorrect(padYPositionPlayer -= padMoveStepLength, padLength, tableHeight));
        if (keyStates['s'])
            meshPadPlayer.position.set(-tableLength / 2 + padWidth / 2, 10, padEdgeCorrect(padYPositionPlayer += padMoveStepLength, padLength, tableHeight));
        sendInfoWS(getPositionPadJSON(meshPadPlayer, Id));

    } else if (gameType === 'local') {

        if (keyStates['w'])
            meshPadPlayer.position.set(-tableLength / 2 + padWidth / 2, 10, padEdgeCorrect(padYPositionPlayer -= padMoveStepLength, padLength, tableHeight));
        if (keyStates['s'])
            meshPadPlayer.position.set(-tableLength / 2 + padWidth / 2, 10, padEdgeCorrect(padYPositionPlayer += padMoveStepLength, padLength, tableHeight));
        if (keyStates['p'] && gameType === 'local')
            meshPadEnamy.position.set(tableLength / 2 - padWidth / 2, 10, padEdgeCorrect(padYPositionEnamy -= padMoveStepLength, padLength, tableHeight));
        if (keyStates['l'] && gameType === 'local')
            meshPadEnamy.position.set(tableLength / 2 - padWidth / 2, 10, padEdgeCorrect(padYPositionEnamy += padMoveStepLength, padLength, tableHeight));
    }
    
    let newPositionX = ballDirectionX + ballSpeedX;
    let newPositionY = ballDirectionY + ballSpeedY;

    // 改进的碰撞检测逻辑，增加缓冲区
    // improved collision detection logic, add buffer
    const collisionBuffer = BALL_RADIUS ; // for x-axis
    const radiusBuffer = BALL_RADIUS ; // for y-axis

    // 检测球是否碰到玩家的挡板
    // check if the ball hits the player's pad
    if (newPositionX < -tableLength / 2 + padWidth + collisionBuffer) {
        if (newPositionY < padYPositionPlayer + padLength / 2 + radiusBuffer && newPositionY > padYPositionPlayer - padLength / 2 - radiusBuffer) {

            let collidePoint = newPositionY - (padYPositionPlayer);
            let normalizedCollidePoint = collidePoint / (padLength / 2);
            let angle = normalizedCollidePoint * Math.PI / 4;
            adjustBallSpeed();
            ballSpeedX = getBallSpeed() * Math.cos(angle);
            ballSpeedY = getBallSpeed() * Math.sin(angle);
        } else {

            resetBall(meshBall);
            domEnamyScore.innerHTML = ++enamyScore;
            if (enamyScore === 5) {

                if (gameType === 'online') {

                    closeWebSocket();
                }
                alert('Game Over! Enamy wins!');
            }
            return;
        }
    }

    // 检测球是否碰到敌方的挡板
    // check if the ball hits the enamy's pad
    if (newPositionX > tableLength / 2 - padWidth - collisionBuffer) {
        if (newPositionY < padYPositionEnamy + padLength / 2 + radiusBuffer && newPositionY > padYPositionEnamy - padLength / 2 - radiusBuffer) {

            let collidePoint = newPositionY - (padYPositionEnamy); 
            let normalizedCollidePoint = collidePoint / (padLength / 2); 
            let angle = normalizedCollidePoint * Math.PI / 4;
            adjustBallSpeed();
            ballSpeedX = -getBallSpeed() * Math.cos(angle);
            ballSpeedY = getBallSpeed() * Math.sin(angle);
        } else {

            resetBall(meshBall);
            domPlayerScore.innerHTML = ++playerScore;
            if (playerScore === 5) {

                if (gameType === 'online') {
                        
                        closeWebSocket();
                }
                alert('Game Over! Player wins!');
            }
            return;
        }
    }

    // 检测球是否碰到桌子的上或下边界
    // check if the ball hits the top or bottom edge of the table
    if (newPositionY > tableHeight / 2 - collisionBuffer || newPositionY < -tableHeight / 2 + collisionBuffer) {
        ballSpeedY = -ballSpeedY;
    }

    // 更新球的位置
    // update the position of the ball
    ballDirectionX += ballSpeedX;
    ballDirectionY += ballSpeedY;

    resetPositionBall(meshBall, ballDirectionX, ballDirectionY);
    controls.update();
    renderer.render(scene, camera);
}


function resetPositionBall(objBall, newPositionX, newPositionY) {

    objBall.position.set(newPositionX, 10, newPositionY);
}

function resetBall(objBall) {

    ballDirectionX = 0;
    ballDirectionY = 0;

    adjustBallSpeed();
    // 更新球的位置
    // update the position of the ball
    resetPositionBall(objBall, ballDirectionX, ballDirectionY);
}

function adjustBallSpeed() {

    if (getBallSpeed() < 3) {
        
        setBallSpeed(getBallSpeed() + 0.1);
    }
    console.log(getBallSpeed());
}

export function setGameType(type) {

    gameType = type;
    console.log("gameType selected: " + type);
}

export function getGameType() {
    
    return gameType;
}

export function setPlayerId(id) {

    Id = id;
}

export function uploadPositionBall() {
    
        sendInfoWS(getPositionBallJSON(meshBall, Id));
}

export function setDomPlayerScore(id) {

    domPlayerScore = document.getElementById(id);
    playerScore = parseInt(domPlayerScore.innerHTML);
}

export function setDomEnamyScore(id) {

    domEnamyScore = document.getElementById(id);
    enamyScore = parseInt(domEnamyScore.innerHTML);
}

export function setDomCanvas(id) {

    canvas = document.getElementById(id);

    // 获取 canvas 元素
    // get the canvas element

    // 创建场景
    // create a scene
    scene = new THREE.Scene();

    // 创建一个长方形几何体
    // create a box geometry
    geometry = new THREE.BoxGeometry(tableLength, 10, tableHeight);
    padPlayer = new THREE.BoxGeometry(padWidth, 10, padLength);
    padEnamy = new THREE.BoxGeometry(padWidth, 10, padLength);
    ball = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);

    // 创建一个材质
    // create a material
    // const material = new THREE.MeshBasicMaterial({ 

    // 	color: 0x00ff00,
    // 	transparent: true,
    // 	opacity: 0.5
    // });

    materialTable = new THREE.MeshLambertMaterial({

        color: RGB_TABLE,
    })
    materialPadPlayer = new THREE.MeshLambertMaterial({

        color: RGB_PAD_PLAYER,
    })

    materialPadEnamy = new THREE.MeshLambertMaterial({

        color: RGB_PAD_ENAMY,
    })

    materialBall = new THREE.MeshLambertMaterial({

        color: RGB_BALL,
        wireframe: true
    })


    // 创建一个网格
    // create a mesh
    mesh = new THREE.Mesh(geometry, materialTable);
    mesh.position.set(0, 0, 0);
    // 将网格添加到场景
    // add the mesh to the scene
    scene.add(mesh);

    meshPadPlayer = new THREE.Mesh(padPlayer, materialPadPlayer);
    meshPadPlayer.position.set(-tableLength / 2 + padWidth / 2, 10, padYPositionPlayer);
    scene.add(meshPadPlayer);

    meshPadEnamy = new THREE.Mesh(padEnamy, materialPadEnamy);
    meshPadEnamy.position.set(tableLength / 2 - padWidth / 2, 10, padYPositionEnamy);
    scene.add(meshPadEnamy);

    meshBall = new THREE.Mesh(ball, materialBall);
    meshBall.position.set(ballDirectionX, 10, ballDirectionY);
    scene.add(meshBall);

    // 创建一个坐标轴
    // create an axes helper
    axesHelper = new THREE.AxesHelper(300);
    scene.add(axesHelper);

    // 创建一个光源
    // create a light

    //const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light = new THREE.PointLight(0xffffff, 1.0);
    // 设置光线不随距离的衰减
    // set the light decay with distance
    light.decay = 0.0;
    light.intensity = 2.0;
    light.position.set(0, 300, 800);
    scene.add(light);



    computedStyle = window.getComputedStyle(canvas);
    width = parseInt(computedStyle.getPropertyValue('width'));
    height = parseInt(computedStyle.getPropertyValue('height'));
    fov = 65;
    aspect = width / height;

    // 创建相机
    // create a camera
    camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 3000);
    // 设置相机位置
    // set the camera position
    camera.position.set(0, 80, 140);
    //camera.position.set(-210, 90, 0); // player view
    // 设置相机朝向
    // set the camera look at
    camera.lookAt(0, 0, 0);







    // 创建渲染器
    // create a renderer
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(width, height);


    /////////////////////////////////////////////////////
    //create controls
    controls = new OrbitControls(camera, renderer.domElement);

    //设置控制器的属性
    controls.enableDamping = true; // 启用惯性
    controls.dampingFactor = 0.05; // 惯性系数
    controls.enableZoom = true;    // 启用缩放
    controls.enablePan = false;    // 禁用平移
    controls.minDistance = 50;     // 最小缩放距离
    controls.maxDistance = 500;    // 最大缩放距离
    controls.maxPolarAngle = Math.PI / 2; // 垂直旋转的最大角度（限制为 90 度）
    /////////////////////////////////////////////////////


    // 进行渲染
    // render the scene
    renderer.render(scene, camera);

    setupKeyControls();
    //window.onload = setupKeyControls;

    //setInterval(keyMovePad, 1000 / FPS);
}