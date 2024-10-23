
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { keyStates, setupKeyControls} from './controls.js';
import { getGameOver, setGameOver, PAD_MOVE_STEP_LENGTH, TABLE_HEIGHT, TABLE_LENGTH, PAD_LENGTH, BK_COLOR, RGB_BALL, RGB_PAD_ENAMY, RGB_PAD_PLAYER, RGB_TABLE, PAD_WIDTH, BALL_RADIUS, getBallSpeed, setBallSpeed} from './constants.js';
import { padEdgeCorrect} from './edgeJudge.js';
import { GameInfoHandler } from './infoHandler.js';
//import { OrbitControls } from './OrbitControls.js';



let padYPositionPlayer = 0;
let padYPositionEnamy = 0;
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
let table2;
let materialTable2;
let meshTable2;
//let controls; // OrbitControls no funciona en este caso, por lo tanto lo emimino
// let gameOver = false;
let axesOn = false;

export function openAxes() {

    if (axesOn) {

        scene.remove(axesHelper);
        axesOn = false;
    } else {

        scene.add(axesHelper);
        axesOn = true;
    }
}

// improved collision detection logic
export function keyMovePad() {

    if (gameType === 'online') {

        if (keyStates['w'])
            resetPositionPadPlayer (padEdgeCorrect(padYPositionPlayer -= PAD_MOVE_STEP_LENGTH, PAD_LENGTH, TABLE_HEIGHT));
        if (keyStates['s'])
            resetPositionPadPlayer (padEdgeCorrect(padYPositionPlayer += PAD_MOVE_STEP_LENGTH, PAD_LENGTH, TABLE_HEIGHT));
        GameInfoHandler.sendPlayerPadPosition();

    } else if (gameType === 'local') {

        if (keyStates['w'])
            resetPositionPadPlayer (padEdgeCorrect(padYPositionPlayer -= PAD_MOVE_STEP_LENGTH, PAD_LENGTH, TABLE_HEIGHT));
        if (keyStates['s'])
            resetPositionPadPlayer(padEdgeCorrect(padYPositionPlayer += PAD_MOVE_STEP_LENGTH, PAD_LENGTH, TABLE_HEIGHT));
        if (keyStates['p'] && gameType === 'local')
            resetPositionPadEnamy (padEdgeCorrect(padYPositionEnamy -= PAD_MOVE_STEP_LENGTH, PAD_LENGTH, TABLE_HEIGHT));
        if (keyStates['l'] && gameType === 'local')
            resetPositionPadEnamy (padEdgeCorrect(padYPositionEnamy += PAD_MOVE_STEP_LENGTH, PAD_LENGTH, TABLE_HEIGHT));
    }
    
    let newPositionX = ballDirectionX + ballSpeedX;
    let newPositionY = ballDirectionY + ballSpeedY;

    // improved collision detection logic, add buffer
    const collisionBuffer = BALL_RADIUS * 1.2 ; // for x-axis
    const radiusBuffer = BALL_RADIUS * 1.1 ; // for y-axis

    // check if the ball hits the player's pad
    if (newPositionX < -TABLE_LENGTH / 2 + PAD_WIDTH + collisionBuffer) {
        if (newPositionY < padYPositionPlayer + PAD_LENGTH / 2 + radiusBuffer && newPositionY > padYPositionPlayer - PAD_LENGTH / 2 - radiusBuffer) {

            let collidePoint = newPositionY - (padYPositionPlayer);
            let normalizedCollidePoint = collidePoint / (PAD_LENGTH / 2);
            let angle = normalizedCollidePoint * Math.PI / 4; //set the angle maximum to 60 degrees
            adjustBallSpeed();
            ballSpeedX = getBallSpeed() * Math.cos(angle);
            ballSpeedY = getBallSpeed() * Math.sin(angle);
        } else {

            resetBall();
            domEnamyScore.innerHTML = ++enamyScore;
        }
    }

    // check if the ball hits the enamy's pad
    if (newPositionX > TABLE_LENGTH / 2 - PAD_WIDTH - collisionBuffer) {
        if (newPositionY < padYPositionEnamy + PAD_LENGTH / 2 + radiusBuffer && newPositionY > padYPositionEnamy - PAD_LENGTH / 2 - radiusBuffer) {

            let collidePoint = newPositionY - (padYPositionEnamy); 
            let normalizedCollidePoint = collidePoint / (PAD_LENGTH / 2); 
            let angle = normalizedCollidePoint * Math.PI / 4;
            adjustBallSpeed();
            ballSpeedX = -getBallSpeed() * Math.cos(angle);
            ballSpeedY = getBallSpeed() * Math.sin(angle);
        } else {

            resetBall();
            domPlayerScore.innerHTML = ++playerScore;
        }
    }

    if (ifGameOver(playerScore, enamyScore, GameInfoHandler.sendGameOver)) {

        setTimeout(() => window.location.reload(), 0);
        return;
    }

    // check if the ball hits the top or bottom edge of the table
    if (newPositionY > TABLE_HEIGHT / 2 - collisionBuffer || newPositionY < -TABLE_HEIGHT / 2 + collisionBuffer) {
        ballSpeedY = -ballSpeedY;
    }

    // update the position of the ball
    ballDirectionX += ballSpeedX;
    ballDirectionY += ballSpeedY;

    resetPositionBall(ballDirectionX, ballDirectionY);
    //controls.update();
    renderer.render(scene, camera);
}


export function resetPositionBall(newPositionX, newPositionY) {

    meshBall.position.set(newPositionX, 3 + BALL_RADIUS, newPositionY);
}

export function resetPositionPadPlayer(newPositionY) {
    
    meshPadPlayer.position.set(-TABLE_LENGTH / 2 + PAD_WIDTH / 2, 3, newPositionY);
}

export function resetPositionPadEnamy(newPositionY) {
    
    meshPadEnamy.position.set(TABLE_LENGTH / 2 - PAD_WIDTH / 2, 3, newPositionY);
}

export function resetBall() {

    ballDirectionX = 0;
    ballDirectionY = 0;

    adjustBallSpeed();

    // update the position of the ball
    resetPositionBall(ballDirectionX, ballDirectionY);
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

export function getPlayerId() {

    return Id;
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
    // get the canvas element

    // create a scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(BK_COLOR);

    // create a box geometry
    geometry = new THREE.BoxGeometry(TABLE_LENGTH, 3, TABLE_HEIGHT);
    table2 = new THREE.BoxGeometry(TABLE_LENGTH + 10, 2, TABLE_HEIGHT + 10);
    padPlayer = new THREE.BoxGeometry(PAD_WIDTH, 10, PAD_LENGTH);
    padEnamy = new THREE.BoxGeometry(PAD_WIDTH, 10, PAD_LENGTH);
    //ball = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    ball = new THREE.BoxGeometry (BALL_RADIUS * 2, BALL_RADIUS * 2, BALL_RADIUS * 2);

    // create a material
    // const material = new THREE.MeshBasicMaterial({ 

    // 	color: 0x00ff00,
    // 	transparent: true,
    // 	opacity: 0.5
    // });

    materialTable2 = new THREE.MeshLambertMaterial({
            
        color: 0xffffff,
    })

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
    })

    meshTable2 = new THREE.Mesh(table2, materialTable2);
    meshTable2.position.set(0, 0, 0);
    scene.add(meshTable2);

    // create a mesh
    mesh = new THREE.Mesh(geometry, materialTable);
    mesh.position.set(0, 0, 0);
    // add the mesh to the scene
    scene.add(mesh);

    meshPadPlayer = new THREE.Mesh(padPlayer, materialPadPlayer);
    meshPadPlayer.position.set(-TABLE_LENGTH / 2 + PAD_WIDTH / 2, 3, padYPositionPlayer);
    scene.add(meshPadPlayer);

    meshPadEnamy = new THREE.Mesh(padEnamy, materialPadEnamy);
    meshPadEnamy.position.set(TABLE_LENGTH / 2 - PAD_WIDTH / 2, 3, padYPositionEnamy);
    scene.add(meshPadEnamy);

    meshBall = new THREE.Mesh(ball, materialBall);
    meshBall.position.set(ballDirectionX, 3 + BALL_RADIUS, ballDirectionY);
    scene.add(meshBall);

    // create an axes helper
    axesHelper = new THREE.AxesHelper(300);
    //scene.add(axesHelper);

    // create a light
    light = new THREE.DirectionalLight(0xffffff, 1.5);
    // light = new THREE.PointLight(0xffffff, 1.0);
    // set the light decay with distance
    // light.decay = 0.0;
    // light.intensity = 2.0;
    // light.position.set(0, 300, 800);
    light.position.set(500, 300, 500);
    scene.add(light);
    /////////////////////////////////////
    // Set the target for the light
    light.target.position.set(0, 0, 0);
    scene.add(light.target);


    // Add some ambient light to soften the shadow and brighten the scene
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    scene.add(ambientLight);
    /////////////////////////////////////



    computedStyle = window.getComputedStyle(canvas);
    width = parseInt(computedStyle.getPropertyValue('width'));
    height = parseInt(computedStyle.getPropertyValue('height'));
    fov = 65;
    aspect = width / height;

    // create a camera
    camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 3000);
    // set the camera position
    camera.position.set(0, 120, 120);
    // camera.position.set(-210, 90, 0); // player view
    // set the camera look at
    camera.lookAt(0, 0, 0);


    // create a renderer
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(width, height);


    /////////////////////////////////////////////////////
    //create controls
    // controls = new OrbitControls(camera, renderer.domElement);

    // //设置控制器的属性
    // controls.enableDamping = true; // 启用惯性
    // controls.dampingFactor = 0.05; // 惯性系数
    // controls.enableZoom = true;    // 启用缩放
    // controls.enablePan = false;    // 禁用平移
    // controls.minDistance = 50;     // 最小缩放距离
    // controls.maxDistance = 500;    // 最大缩放距离
    // controls.maxPolarAngle = Math.PI / 2; // 垂直旋转的最大角度（限制为 90 度）
    /////////////////////////////////////////////////////


    // render the scene
    renderer.render(scene, camera);

    setupKeyControls();
    //window.onload = setupKeyControls;

    //setInterval(keyMovePad, 1000 / FPS);
}

function ifGameOver(scorePlayer, scoreEnamy, callback) {

    if (getGameOver() === true) {
        return false;
    }

    if (scorePlayer === 5) {

        setGameOver(true);
        window.location.hash = '#home';
        alert('Game Over! Player wins!');
        if (typeof callback === 'function' && callback()) {
            callback();
        }
        return true;
    } else if (scoreEnamy === 5) {

        setGameOver(true);
        window.location.hash = '#home';
        alert('Game Over! Enamy wins!');
        if (typeof callback === 'function' && callback()) {
            callback();
        }
        return true;
    } else
        return false;
}