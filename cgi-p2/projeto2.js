// GL
var canvas;
var gl;
var program;

var vColorLoc;
var drawModeFilled = false;
var colorMode = 0;
var vColorModeLoc;
var mProjectionLoc, mModelViewLoc;

var matrixStack = [];
var modelView;

var aspect;
const VP_DISTANCE = 60;
var eye = [VP_DISTANCE / 2, VP_DISTANCE / 2, VP_DISTANCE];
var up = [0, 1, 0];

// antenna controls
var antenna_elevation = 0;
var antenna_rotation = 0;

// physics
var time = 0;
var wheel_turn = 0;
var truck_turn = 0;
var wheel_rotation = 0;

var position = vec3(0, 0, 0);
var velocity = vec3(0, 0, 0);
var velocity_local_vp_forward = 0;
var acceleration_norm = 0;

const ELAPSED_TIME = 1 / 60;

// Max, Mins
const MAX_WHEEL_TURN = 45;
const MAX_ACCELERATION = 5;
const MAX_VELOCITY = 0.5;
const MIN_SPEED = 0.01;
const FRICTION_FORCE = 0.5;
const MIN_ANTENNA_ELEVATION = -90;
const MAX_ANTENNA_ELEVATION = 20;

// geometry
const SCENE_HEIGHT = -20;


const GROUND_NUM_BLOCKS_X = 15;
const GROUND_NUM_BLOCKS_Z = 15;
const GROUND_BLOCK_SIZE = 20;

const HALF_CUBE_SIZE = 0.5;


const TRUCK_BACK_WIDTH = 30;
const TRUCK_BACK_HEIGHT = 30;
const TRUCK_BACK_DEPTH = 50;

const TRUCK_FRONT_WIDTH = TRUCK_BACK_WIDTH;
const TRUCK_FRONT_HEIGHT = TRUCK_BACK_HEIGHT * 2 / 3;
const TRUCK_FRONT_DEPTH = TRUCK_BACK_DEPTH / 3;


const WHEEL_RADIUS = TRUCK_BACK_HEIGHT / 2;
const WHEEL_WIDTH = TRUCK_BACK_WIDTH / 3; // torus height scale is bad
const TRUCK_FRONT_WHEEL_DEPTH = 0;
const TRUCK_WHEELS_DISTANCE_APART = TRUCK_BACK_DEPTH * 4 / 5;
const CENTER_OF_ROTATION_X = -TRUCK_BACK_WIDTH / 2;
const CENTER_OF_ROTATION_Z = TRUCK_WHEELS_DISTANCE_APART;

const RIM_RADIUS = WHEEL_RADIUS / 2;
const RIM_WIDTH = TRUCK_BACK_WIDTH / 10;


const TRUCK_HEIGHT = WHEEL_RADIUS * 1 / 4;


const ANTENNA_X = TRUCK_BACK_WIDTH / 2;
const ANTENNA_Y = TRUCK_BACK_HEIGHT;
const ANTENNA_Z = TRUCK_BACK_DEPTH / 2;

const ANTENNA_1_WIDTH = TRUCK_BACK_WIDTH / 8;
const ANTENNA_1_HEIGHT = ANTENNA_1_WIDTH * 3;
const ANTENNA_1_DEPTH = ANTENNA_1_WIDTH;

const ANTENNA_ELBOW_RADIUS = ANTENNA_1_WIDTH * 1.5;

const ANTENNA_2_WIDTH = ANTENNA_1_WIDTH;
const ANTENNA_2_HEIGHT = ANTENNA_1_DEPTH;
const ANTENNA_2_DEPTH = ANTENNA_1_HEIGHT * 2;

const ANTENNA_3_WIDTH = ANTENNA_1_WIDTH * 1.2;
const ANTENNA_3_HEIGHT = ANTENNA_1_HEIGHT;
const ANTENNA_3_DEPTH = ANTENNA_1_DEPTH * 1.2;

const ANTENNA_PARABOLOID_RADIUS = ANTENNA_3_WIDTH * 3;
const ANTENNA_PARABOLOID_HEIGHT = ANTENNA_PARABOLOID_RADIUS;

const ANTENNA_TRASMITTER_RADIUS = ANTENNA_3_WIDTH;
const ANTENNA_TRASMITTER_HEIGHT = ANTENNA_PARABOLOID_HEIGHT * 1.2;

// colors
const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];
const RED = [255, 0, 0];
const LIME = [0, 255, 0];
const SKY_BLUE = [135, 206, 235];
const BLUE = [0, 0, 255];
const YELLOW = [255, 255, 0];
const CYAN = [0, 255, 255];
const MAGENTA = [255, 0, 255];
const SILVER = [192, 192, 192];
const GREY = [128, 128, 128];
const MAROON = [128, 0, 0];
const OLIVE = [128, 128, 0];
const GREEN = [0, 128, 0];
const PURPLE = [128, 0, 128];
const TEAL = [0, 128, 128];
const NAVY = [0, 0, 128];

// Stack related operations
function pushMatrix()
{
    var m = mat4(modelView[0], modelView[1],
            modelView[2], modelView[3]);
    matrixStack.push(m);
}

function popMatrix()
{
    modelView = matrixStack.pop();
}
// Append transformations to modelView
function multMatrix(m)
{
    modelView = mult(modelView, m);
}
function multTranslation(t)
{
    modelView = mult(modelView, translate(t));
}
function multScale(s)
{
    modelView = mult(modelView, scalem(s));
}
function multRotationX(angle)
{
    modelView = mult(modelView, rotateX(angle));
}
function multRotationY(angle)
{
    modelView = mult(modelView, rotateY(angle));
}
function multRotationZ(angle)
{
    modelView = mult(modelView, rotateZ(angle));
}

function fit_canvas_to_window()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    aspect = canvas.width / canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

window.onresize = function ()
{
    fit_canvas_to_window();
}

document.addEventListener("DOMContentLoaded", function(event) 
{
    canvas = document.getElementById('gl-canvas');

    gl = WebGLUtils.setupWebGL(document.getElementById('gl-canvas'));
    fit_canvas_to_window();

    gl.clearColor(SKY_BLUE[0] / 255, SKY_BLUE[1] / 255, SKY_BLUE[2] / 255, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, 'default-vertex', 'default-fragment');

    gl.useProgram(program);

    mModelViewLoc = gl.getUniformLocation(program, "mModelView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");

    sphereInit(gl);
    cubeInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    paraboloidInit(gl);

    vColorModeLoc = gl.getUniformLocation(program, "vColorMode");
    gl.uniform1i(vColorModeLoc, colorMode);

    vColorLoc = gl.getUniformLocation(program, "vColor");

    addEventListener("keydown", onKeyDownEvent);

    render();
})

function setColor(color)
{
    color = [color[0] / 255, color[1] / 255, color[2] / 255];
    gl.uniform3fv(vColorLoc, color);
}

function limitRange(a, min, max)
{
    return Math.min(Math.max(a, min), max);
}

function toRadians(degrees)
{
    return degrees * Math.PI / 180;
}

function toDegrees(radians)
{
    return radians / Math.PI * 180;
}

function onKeyDownEvent(k)
{
    switch (k.key)
    {
    case "a":
        wheel_turn += 5;
        break;
    case "d":
        wheel_turn -= 5;
        break;
    case "w":
        if (velocity_local_vp_forward == 0 && wheel_turn != 0)
            wheel_turn = 0;
        acceleration_norm = MAX_ACCELERATION;
        break;
    case "s":
        if (velocity_local_vp_forward == 0 && wheel_turn != 0)
            wheel_turn = 0;
        acceleration_norm = -MAX_ACCELERATION;
        break;
    case "i":
        antenna_elevation -= 2;
        break;
    case "k":
        antenna_elevation += 2;
        break;
    case "j":
        antenna_rotation -= 2;
        break;
    case "l":
        antenna_rotation += 2;
        break;
    case " ":
        colorMode = colorMode == 0 ? 1 : 0;
        gl.uniform1i(vColorModeLoc, colorMode);
        break;
    case "0":
        eye = [VP_DISTANCE / 2, VP_DISTANCE / 2, VP_DISTANCE];
        up = [0, 1, 0];
        break;
    case "1":
        eye = [0, VP_DISTANCE, 0];
        up = [1, 0, 0];
        break;
    case "2":
        eye = [VP_DISTANCE, 0, 0];
        up = [0, 1, 0];
        break;
    case "3":
        eye = [0, 0, VP_DISTANCE];
        up = [0, 1, 0];
        break;
    case "f":
        drawModeFilled = !drawModeFilled;
        break;
    default:
    }
    acceleration_norm = limitRange(acceleration_norm, -MAX_ACCELERATION, MAX_ACCELERATION);
    wheel_turn = limitRange(wheel_turn, -MAX_WHEEL_TURN, MAX_WHEEL_TURN);
    antenna_elevation = limitRange(antenna_elevation, MIN_ANTENNA_ELEVATION, MAX_ANTENNA_ELEVATION);
}
function drawCube()
{
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    cubeDraw(gl, program, drawModeFilled);
}

function drawSphere()
{
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    sphereDraw(gl, program, drawModeFilled);
}

function drawCylinder()
{
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    cylinderDraw(gl, program, drawModeFilled);
}

function drawTorus()
{
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    torusDraw(gl, program, drawModeFilled);
}

function drawParaboloid()
{
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    paraboloidDraw(gl, program, drawModeFilled);
}

function wheel()
{
    multRotationX(toDegrees(wheel_rotation));
    multRotationZ(90);
    pushMatrix();
        multScale([WHEEL_RADIUS, WHEEL_WIDTH, WHEEL_RADIUS]);
        setColor(BLACK);
        drawTorus();
    popMatrix();
        multScale([RIM_RADIUS, RIM_WIDTH, RIM_RADIUS]);
        setColor(SILVER);
        drawCylinder();
}

function ground()
{
    for (var i = 0; i < GROUND_NUM_BLOCKS_X; ++i)
    {
        for (var j = 0; j < GROUND_NUM_BLOCKS_Z; ++j)
        {
            pushMatrix();
            multTranslation([-position[1] % GROUND_BLOCK_SIZE, 
                            -position[2] % GROUND_BLOCK_SIZE, 
                            -position[0] % GROUND_BLOCK_SIZE]);

            multTranslation(
                [i * GROUND_BLOCK_SIZE - GROUND_NUM_BLOCKS_X / 2 * GROUND_BLOCK_SIZE,
                    -GROUND_BLOCK_SIZE / 2,
                    j * GROUND_BLOCK_SIZE - GROUND_NUM_BLOCKS_Z / 2 * GROUND_BLOCK_SIZE]);
            multScale([GROUND_BLOCK_SIZE, GROUND_BLOCK_SIZE, GROUND_BLOCK_SIZE]);
            setColor(WHITE);
            drawCube();
            popMatrix();
        }
    }
}

function drawScene()
{
    multTranslation([0, SCENE_HEIGHT, 0]);
    pushMatrix();
        ground();
    popMatrix();

    multRotationY(truck_turn);
    // truck height position (above ground) and center of rotation
    multTranslation([CENTER_OF_ROTATION_X, WHEEL_RADIUS * 2 / 3, 
                     CENTER_OF_ROTATION_Z]);

    pushMatrix();
        multTranslation([0, -TRUCK_HEIGHT, 0]);
        //////// TRUCK BACK ///////
        pushMatrix();
            multScale([TRUCK_BACK_WIDTH, TRUCK_BACK_HEIGHT, TRUCK_BACK_DEPTH]);
            multTranslation([HALF_CUBE_SIZE, HALF_CUBE_SIZE, -HALF_CUBE_SIZE]);
            setColor(NAVY);
            drawCube();
        popMatrix();
        //////// TRUCK FRONT ///////
        pushMatrix();
            multScale([TRUCK_FRONT_WIDTH, TRUCK_FRONT_HEIGHT, TRUCK_FRONT_DEPTH]);
            multTranslation([HALF_CUBE_SIZE, HALF_CUBE_SIZE, HALF_CUBE_SIZE]);
            setColor(RED);
            drawCube();
        popMatrix();

        //////// ANTENNA //////
            multTranslation([ANTENNA_X, ANTENNA_Y + ANTENNA_1_HEIGHT / 2, -ANTENNA_Z]);
            //////// ANTENNA 1 ///////
            pushMatrix();
                multScale([ANTENNA_1_WIDTH, ANTENNA_1_HEIGHT, ANTENNA_1_DEPTH]);
                setColor(GREEN);
                drawCube();
            popMatrix();
                multTranslation([0, ANTENNA_1_HEIGHT - ANTENNA_ELBOW_RADIUS, 0]);
                multRotationY(antenna_rotation);
                multRotationX(antenna_elevation);
                //////// ANTENNA ELBOW ///////
                pushMatrix();
                    multScale([ANTENNA_ELBOW_RADIUS, ANTENNA_ELBOW_RADIUS, ANTENNA_ELBOW_RADIUS]);
                    setColor(LIME);
                    drawSphere();
                popMatrix();
                //////// ANTENNA 2 ///////
                pushMatrix();
                    multTranslation([0, -ANTENNA_1_HEIGHT / 2 + ANTENNA_ELBOW_RADIUS, ANTENNA_2_DEPTH / 2]);
                    multScale([ANTENNA_2_WIDTH, ANTENNA_2_HEIGHT, ANTENNA_2_DEPTH]);
                    setColor(PURPLE);
                    drawCube();
                popMatrix();
                //////// ANTENNA 3 ///////
                pushMatrix();
                    multTranslation([0, -ANTENNA_3_HEIGHT / 3 + ANTENNA_ELBOW_RADIUS, ANTENNA_2_DEPTH * 3 / 4]);
                    multScale([ANTENNA_3_WIDTH, ANTENNA_3_HEIGHT, ANTENNA_3_DEPTH]);
                    setColor(YELLOW);
                    drawCube();
                popMatrix();
                multTranslation([0, ANTENNA_ELBOW_RADIUS, ANTENNA_2_DEPTH * 3 / 4])
                //////// ANTENNA PARABOLOID ///////
                pushMatrix();
                    multScale([ANTENNA_PARABOLOID_RADIUS, ANTENNA_PARABOLOID_HEIGHT, ANTENNA_PARABOLOID_RADIUS]);
                    setColor(MAGENTA);
                    drawParaboloid();
                popMatrix();
                //////// ANTENNA TRANSMITTER ///////
                    multTranslation([0, ANTENNA_TRASMITTER_HEIGHT / 2, 0]);
                    multScale([ANTENNA_TRASMITTER_RADIUS, ANTENNA_TRASMITTER_HEIGHT, ANTENNA_TRASMITTER_RADIUS]);
                    setColor(WHITE);
                    drawCylinder();
    popMatrix();
    //////// WHEELS ///////
        multTranslation([0, 0, -TRUCK_FRONT_WHEEL_DEPTH]);
        pushMatrix();
            //////// FRONT ///////
            pushMatrix();
                multRotationY(wheel_turn);
                wheel();
            popMatrix();
                multTranslation([TRUCK_BACK_WIDTH, 0, 0]);
                multRotationY(wheel_turn);
                wheel();
        popMatrix();
            //////// BACK ///////
            multTranslation([0, 0, -TRUCK_WHEELS_DISTANCE_APART ]);
            pushMatrix();
                wheel();
            popMatrix();
                multTranslation([TRUCK_BACK_WIDTH, 0, 0]);
                wheel();
}

function rotateVector(vec, angle)
{
    angle = -angle * (Math.PI / 180);
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var x = Math.round(10000 * (vec[0] * cos - vec[1] * sin)) / 10000;
    var y = Math.round(10000 * (vec[0] * sin + vec[1] * cos)) / 10000;
    return vec2(x, y);
};

function truckMovement()
{
    velocity_local_vp_forward += acceleration_norm * ELAPSED_TIME;
    velocity_local_vp_forward -= velocity_local_vp_forward * FRICTION_FORCE * ELAPSED_TIME;
    velocity_local_vp_forward = limitRange(velocity_local_vp_forward, -MAX_VELOCITY, MAX_VELOCITY);

    var rotatedVector = rotateVector(vec2(0, velocity_local_vp_forward), truck_turn);
    velocity[1] = rotatedVector[0];
    velocity[0] = rotatedVector[1];

    if (acceleration_norm == 0 && Math.abs(velocity_local_vp_forward) < MIN_SPEED)
        velocity_local_vp_forward = 0;

    position[0] += velocity[0];
    position[1] += velocity[1];

    wheel_rotation += velocity_local_vp_forward / WHEEL_RADIUS;
    wheel_turn -= wheel_turn * Math.abs(velocity_local_vp_forward) * ELAPSED_TIME;
    truck_turn += wheel_turn * velocity_local_vp_forward * ELAPSED_TIME;

    acceleration_norm = 0; // only accelerate when user input is detected
}

function render()
{
    setTimeout(function ()
    {
        requestAnimFrame(render);
        time += ELAPSED_TIME;

        truckMovement();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var projection = ortho(-VP_DISTANCE * aspect, VP_DISTANCE * aspect, -VP_DISTANCE, VP_DISTANCE, -3 * VP_DISTANCE, 3 * VP_DISTANCE);

        gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

        modelView = lookAt(eye, [0, 0, 0], up);

        drawScene();
    }, ELAPSED_TIME);
}
