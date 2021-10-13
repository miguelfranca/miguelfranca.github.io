// GL
var canvas;
var ctx;
var gl;
var program;

var drawModeFilled = false;
var mProjectionLoc, mViewLoc, mViewNormalsLoc, mNormalsLoc;
var mView, mViewNormals;

var lightPositionLoc, lightLoc, lightAmbLoc, lightDifLoc, lightSpeLoc;
var materialAmbLoc, materialDifLoc, materialSpeLoc, shininessLoc;

var lpx,lpy,lpz;
var lightque;

var lar,lag,lab;
var ldr,ldg,ldb;
var lsr,lsg,lsb;

var mdr,mdg,mdb;
var msr,msg,msb;
var shiny;

var z_buffer;
var bfc;

var gamma;
var theta;

var axonometric_theta = 0;
var axonometric_gamma = 0;

var projection_type;

var aspect;
var VP_DISTANCE = 1;
const ZOOM_SENSIBILITY = 0.03;
const DRAG_SENSITIVITY = 2.0;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.5;
var eye;
var up;

var d;
var fovy;

var ELAPSED_TIME = 1 / 60;

var rotationMat;
var last_rotationMat = mat4();
var mousePressed = false;
var anchorPosition;

function setCube()
{
    shape = "cube";
}

function setSphere()
{
    shape = "sphere";
}

function setParaboloid()
{
    shape = "paraboloid";
}

function setCylinder()
{
    shape = "cylinder";
}

function setTorus()
{
    shape = "torus";
}

function setLightON()
{
    gl.uniform1f(lightLoc,1.0);
    light_sliders_setDisabled(false);
}

function setLightOFF()
{
    gl.uniform1f(lightLoc,0.0);
    light_sliders_setDisabled(true);
}

function light_sliders_setDisabled(b)
{
    document.getElementById("lightPontual").disabled = b;
    document.getElementById("lightDirecional").disabled = b;
    document.getElementById("lpx").disabled = b;
    document.getElementById("lpy").disabled = b;
    document.getElementById("lpz").disabled = b;
    document.getElementById("lar").disabled = b;
    document.getElementById("lag").disabled = b;
    document.getElementById("lab").disabled = b;
    document.getElementById("ldr").disabled = b;
    document.getElementById("ldg").disabled = b;
    document.getElementById("ldb").disabled = b;
    document.getElementById("lsr").disabled = b;
    document.getElementById("lsg").disabled = b;
    document.getElementById("lsb").disabled = b;
    document.getElementById("mdr").disabled = b;
    document.getElementById("mdg").disabled = b;
    document.getElementById("mdb").disabled = b;
    document.getElementById("msr").disabled = b;
    document.getElementById("msg").disabled = b;
    document.getElementById("msb").disabled = b;
    document.getElementById("shiny").disabled = b;
}

function setLightPontual() 
{
    lightque = 1.0;
    gl.uniform4f(lightPositionLoc,lpx,lpy,lpz,lightque);
}

function setLightDirecional() 
{
    lightque = 0.0;
    gl.uniform4f(lightPositionLoc,lpx,lpy,lpz,lightque);
}

function select_light_position_x()
{
    lpx = document.getElementById("lpx").value;
    gl.uniform4f(lightPositionLoc,lpx,lpy,lpz,lightque);
}

function select_light_position_y()
{
    lpy = document.getElementById("lpy").value;
    gl.uniform4f(lightPositionLoc,lpx,lpy,lpz,lightque);
}

function select_light_position_z()
{
    lpz = document.getElementById("lpz").value;
    gl.uniform4f(lightPositionLoc,lpx,lpy,lpz,lightque);
}

function select_light_color_amb_r()
{
    lar = document.getElementById("lar").value;
    gl.uniform3f(lightAmbLoc,lar,lag,lab);
}

function select_light_color_amb_g()
{
    lag = document.getElementById("lag").value;
    gl.uniform3f(lightAmbLoc,lar,lag,lab);
}

function select_light_color_amb_b()
{
    lab = document.getElementById("lab").value;
    gl.uniform3f(lightAmbLoc,lar,lag,lab);
}

function select_light_color_dif_r()
{
    ldr = document.getElementById("ldr").value;
    gl.uniform3f(lightDifLoc,ldr,ldg,ldb);
}

function select_light_color_dif_g()
{
    ldg = document.getElementById("ldg").value;
    gl.uniform3f(lightDifLoc,ldr,ldg,ldb);
}

function select_light_color_dif_b()
{
    ldb = document.getElementById("ldb").value;
    gl.uniform3f(lightDifLoc,ldr,ldg,ldb);
}

function select_light_color_spe_r()
{
    lsr = document.getElementById("lsr").value;
    gl.uniform3f(lightSpeLoc,lsr,lsg,lsb);
}

function select_light_color_spe_g()
{
    lsg = document.getElementById("lsg").value;
    gl.uniform3f(lightSpeLoc,lsr,lsg,lsb);
}

function select_light_color_spe_b()
{
    lsb = document.getElementById("lsb").value;
    gl.uniform3f(lightSpeLoc,lsr,lsg,lsb);
}

function select_material_color_dif_r()
{
    mdr = document.getElementById("mdr").value;
    gl.uniform3f(materialDifLoc,mdr,mdg,mdb);
    gl.uniform3f(materialAmbLoc, mdr, mdg, mdb);
}

function select_material_color_dif_g()
{
    mdg = document.getElementById("mdg").value;
    gl.uniform3f(materialDifLoc,mdr,mdg,mdb);
    gl.uniform3f(materialAmbLoc, mdr, mdg, mdb);
}

function select_material_color_dif_b()
{
    mdb = document.getElementById("mdb").value;
    gl.uniform3f(materialDifLoc,mdr,mdg,mdb);
    gl.uniform3f(materialAmbLoc, mdr, mdg, mdb);
}

function select_material_color_spe_r()
{
    msr = document.getElementById("msr").value;
    gl.uniform3f(materialSpeLoc,msr,msg,msb);
}

function select_material_color_spe_g()
{
    msg = document.getElementById("msg").value;
    gl.uniform3f(materialSpeLoc,msr,msg,msb);
}

function select_material_color_spe_b()
{
    msb = document.getElementById("msb").value;
    gl.uniform3f(materialSpeLoc,msr,msg,msb);
}

function select_material_shininess()
{
    shiny = document.getElementById("shiny").value;
    console.log(shiny);
    gl.uniform1f(shininessLoc, shiny);
}

function select_perspective_d()
{
    var max = document.getElementById("perspective_d").max;
    var min = document.getElementById("perspective_d").min;
    var scale = Math.log(max) / (max - min);
    var v = document.getElementById("perspective_d").value;
    d = Math.exp(scale * (v - min));
    eye = [0, 0, d];
}


function axonometric_eye_up()
{
    eye = [0, 0, VP_DISTANCE];
    up = [0, 1, 0];

    var aux_eye = mat4([eye[0], eye[1], eye[2], 0.0]);
    aux_eye = mult(aux_eye,
            mult(rotateX(gamma), rotateY(theta)));
    eye = [aux_eye[0][0], aux_eye[0][1], aux_eye[0][2]];

    var aux_up = mat4([up[0], up[1], up[2], 1.0]);
    aux_up = mult(aux_up,
            mult(rotateX(gamma), rotateY(theta)));
    up = [aux_up[0][0], aux_up[0][1], aux_up[0][2]];
}

function select_axonometric_theta()
{
    theta = document.getElementById("axonometric_theta").value;
    axonometric_eye_up();
}

function select_axonometric_gamma()
{
    gamma = document.getElementById("axonometric_gamma").value;
    axonometric_eye_up();
}

function sliders_setDisabled(b)
{
    document.getElementById("axonometric_theta").disabled = b;
    document.getElementById("axonometric_gamma").disabled = b;
}

function axonometric_user_input()
{
    select_axonometric_gamma();
    select_axonometric_theta();
    sliders_setDisabled(false);
}

function axonometric_isometric()
{
    calculate_theta_gamma(30, 30);
    axonometric_eye_up();
    sliders_setDisabled(true);
}

function axonometric_dimetric()
{
    calculate_theta_gamma(42, 7);
    axonometric_eye_up();
    sliders_setDisabled(true);
}

function axonometric_trimetric()
{
    calculate_theta_gamma(54 + 16 / 60, 23 + 16 / 60);
    axonometric_eye_up();
    sliders_setDisabled(true);
}

function ortho_frontView()
{
    eye = [0, 0, VP_DISTANCE];
    up = [0, 1, 0];
}

function ortho_rightSideView()
{
    eye = [VP_DISTANCE, 0, 0];
    up = [0, 1, 0];
}

function ortho_blueprintView()
{
    eye = [0, VP_DISTANCE, 0];
    up = [1, 0, 0];
}

function select_orthogonal()
{
    projection_type = "orthogonal";
    if (document.getElementById("Orthogonal_FrontView").checked)
        ortho_frontView();
    if (document.getElementById("Orthogonal_RightSideView").checked)
        ortho_rightSideView();
    if (document.getElementById("Orthogonal_BlueprintView").checked)
        ortho_blueprintView();
}

function select_axonometric()
{
    projection_type = "axonometric";
    if (document.getElementById("Axonometric_Free").checked)
        axonometric_user_input();
    if (document.getElementById("Axonometric_Isometric").checked)
        axonometric_isometric();
    if (document.getElementById("Axonometric_Dimetric").checked)
        axonometric_dimetric();
    if (document.getElementById("Axonometric_Trimetric").checked)
        axonometric_trimetric();
    axonometric_eye_up();
}

function select_perspective()
{
    projection_type = "perspective";
    select_perspective_d();
    up = [0, 1, 0];
}

function select_projection(name)
{
    switch (name)
    {
    case "Orthogonal":
        select_orthogonal();
        break;
    case "Axonometric":
        select_axonometric();
        break;
    case "Perspective":
        select_perspective();
        break;
    }
}

function calculate_theta_gamma(A, B)
{
    A = toRadians(A);
    B = toRadians(B);
    theta = toDegrees(Math.atan(Math.sqrt(Math.tan(A) / Math.tan(B))) - Math.PI / 2);
    gamma = toDegrees(Math.asin(Math.sqrt(Math.tan(A) * Math.tan(B))));
    // console.log(theta);
    // console.log(gamma);
}

function toRadians(degrees)
{
    return degrees * Math.PI / 180;
}

function toDegrees(radians)
{
    return radians / Math.PI * 180;
}

window.onmousemove = function (e)
{
    if (mousePressed && projection_type == "perspective")
    {
        rotationMat = mult(mult(
            rotateX(toDegrees(Math.atan((e.clientY - anchorPosition[1]) / 
                canvas.height * DRAG_SENSITIVITY / VP_DISTANCE))),
            rotateY(toDegrees(Math.atan((e.clientX - anchorPosition[0]) / 
                canvas.width * DRAG_SENSITIVITY / VP_DISTANCE))),
            ),
            last_rotationMat);
    }
}

window.onmousedown = function (e)
{
    if (e.button == 0 && e.clientX < canvas.width && e.clientY < canvas.height)
    {
        console.log(e);
        anchorPosition = [e.clientX, e.clientY];
        mousePressed = true;
    }
}

window.onmouseup = function (e)
{
    if (e.button == 0)
    {
        last_rotationMat = rotationMat;
        mousePressed = false;
    }
}

// https://www.w3schools.com/howto/howto_js_full_page_tabs.asp
function openPage(pageName, elmnt, color)
{
    // Hide all elements with class="tabcontent" by default */
    var i,
    tabcontent,
    tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++)
    {
        tabcontent[i].style.display = "none";
    }

    // Remove the background color of all tablinks/buttons
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++)
    {
        tablinks[i].style.backgroundColor = "";
    }

    // Show the specific tab content
    document.getElementById(pageName).style.display = "block";

    select_projection(pageName);

    // Add the specific color to the button used to open the tab content
    elmnt.style.backgroundColor = color;
}

function onKeyDownEvent(k)
{
    switch (k.key)
    {
    case "w":
        drawModeFilled = false;
        break;
    case "f":
        drawModeFilled = true;
        break;
    case "z":
        if (z_buffer)
            gl.disable(gl.DEPTH_TEST);
        else
            gl.enable(gl.DEPTH_TEST);
        z_buffer = !z_buffer;
        document.getElementById("z_buffer").checked = z_buffer;
        break;
    case "b":
        if (bfc)
            gl.disable(gl.CULL_FACE);
        else
            gl.enable(gl.CULL_FACE);
        bfc = !bfc;
        document.getElementById("bfc").checked = bfc;
        break;
    default:
    }
}

window.onresize = function ()
{
    fit_canvas_to_window();
}

function fit_canvas_to_window()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 2 / 3;

    aspect = canvas.width / canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

window.onwheel = function (event)
{
    var v = ZOOM_SENSIBILITY * Math.sign(event.deltaY);
    if (VP_DISTANCE + v > MIN_ZOOM && VP_DISTANCE + v < MAX_ZOOM)
        VP_DISTANCE += v;
}

window.onload = function ()
{
    canvas = document.getElementById('gl-canvas');

    // start with front view of orthogonal projection
    axonometric_dimetric()
    // Get the element with id="defaultOpen" and click on it
    document.getElementById("defaultOpen").click();
    // default shape is a cube
    shape = "cube";

    gamma = 0;
    theta = 0;

    z_buffer = false;
    bfc = false;

    addEventListener("keydown", onKeyDownEvent);

    gl = WebGLUtils.setupWebGL(document.getElementById('gl-canvas'));
    fit_canvas_to_window();
    gl.clearColor(0, 0, 0, 1.0);

    program = initShaders(gl, 'default-vertex', 'default-fragment');
    gl.useProgram(program);
    
    lightLoc = gl.getUniformLocation(program, "light");
    setLightON();
    
    lpx = document.getElementById("lpx").value;
    lpy = document.getElementById("lpy").value;
    lpz = document.getElementById("lpz").value;
    lightque = 1.0;
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4f(lightPositionLoc, lpx, lpy, lpz, lightque);
    
    lar = document.getElementById("lar").value;
    lag = document.getElementById("lag").value;
    lab = document.getElementById("lab").value;
    lightAmbLoc = gl.getUniformLocation(program, "lightAmb");
    gl.uniform3f(lightAmbLoc, lar, lag, lab);
    
    ldr = document.getElementById("ldr").value;
    ldg = document.getElementById("ldg").value;
    ldb = document.getElementById("ldb").value;
    lightDifLoc = gl.getUniformLocation(program, "lightDif");
    gl.uniform3f(lightDifLoc, ldr, ldg, ldb);
    
    lsr = document.getElementById("lsr").value;
    lsg = document.getElementById("lsg").value;
    lsb = document.getElementById("lsb").value;
    lightSpeLoc = gl.getUniformLocation(program, "lightSpe");
    gl.uniform3f(lightSpeLoc, lsr, lsg, lsb);
    
    mdr = document.getElementById("mdr").value;
    mdg = document.getElementById("mdg").value;
    mdb = document.getElementById("mdb").value;
    materialDifLoc = gl.getUniformLocation(program, "materialDif");
    gl.uniform3f(materialDifLoc, mdr, mdg, mdb);
    materialAmbLoc = gl.getUniformLocation(program, "materialAmb");
    gl.uniform3f(materialAmbLoc, mdr, mdg, mdb);
    
    msr = document.getElementById("msr").value;
    msg = document.getElementById("msg").value;
    msb = document.getElementById("msb").value;
    materialSpeLoc = gl.getUniformLocation(program, "materialSpe");
    gl.uniform3f(materialSpeLoc, msr, msg, msb);
    
    shiny = document.getElementById("shiny").value;
    shininessLoc = gl.getUniformLocation(program, "shininess");
    gl.uniform1f(shininessLoc, shiny);

    mViewLoc = gl.getUniformLocation(program, "mView");
    mViewNormalsLoc = gl.getUniformLocation(program, "mViewNormals");
    var mModelLoc = gl.getUniformLocation(program, "mModel");
    gl.uniformMatrix4fv(mModelLoc, false, flatten(mat4()));
    mNormalsLoc = gl.getUniformLocation(program, "mNormals");

    mProjectionLoc = gl.getUniformLocation(program, "mProjection");

    rotationMat = mat4();

    sphereInit(gl);
    cubeInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    paraboloidInit(gl);

    render();
}

function render()
{
    setTimeout(function ()
    {
        requestAnimFrame(render);

        if (z_buffer)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        else
            gl.clear(gl.COLOR_BUFFER_BIT);

        var projection;

        switch (projection_type)
        {
        case "perspective":
            fovy = toDegrees(2 * Math.atan((VP_DISTANCE / d)));
            mView = lookAt(eye, [0, 0, 0], up);
        	mView = mult(mView, rotationMat);
            projection = perspective(fovy, VP_DISTANCE * aspect, 0.1, VP_DISTANCE * 20);
            break;
        case "axonometric":
        case "orthogonal":
            mView = lookAt(eye, [0, 0, 0], up);
            projection = ortho(-VP_DISTANCE * aspect, VP_DISTANCE * aspect, -VP_DISTANCE, VP_DISTANCE, -10, 10);
            break;
        }
        
        gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

        gl.uniformMatrix4fv(mViewLoc, false, flatten(mView));

        mViewNormals = inverse4(transpose(mView));
        gl.uniformMatrix4fv(mViewNormalsLoc, false, flatten(mViewNormals));

        gl.uniformMatrix4fv(mNormalsLoc, false, flatten(mViewNormals));

        switch (shape)
        {
        case "cube":
            cubeDraw(gl, program, drawModeFilled);
            break;
        case "sphere":
            sphereDraw(gl, program, drawModeFilled);
            break;
        case "paraboloid":
            paraboloidDraw(gl, program, drawModeFilled);
            break;
        case "cylinder":
            cylinderDraw(gl, program, drawModeFilled);
            break;
        case "torus":
            torusDraw(gl, program, drawModeFilled);
            break;
        }

    }, ELAPSED_TIME);
}
