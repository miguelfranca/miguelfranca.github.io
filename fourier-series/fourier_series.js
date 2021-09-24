var canvas, fourier_canvas, ctx, fourier_ctx,
drawing = false,
drawing_fourier = false,
prevX = 0, currX = 0,
prevY = 0, currY = 0;
var points = [];
var fourier_points = [];
var fourier_coefs = [];
var draw_time = 0;
var draw_dt = 1.0 / (60 * 10.0);
var max_modes = 30;
var dx_default = 2; // pixel

var user_start;

class ComplexNumber
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    static fromPolar(p, t)
    {
        return new ComplexNumber(p * Math.cos(t), p * Math.sin(t));
    }

    static fromCartesian(x, y)
    {
        return new ComplexNumber(x, y);
    }

    add(cn)
    {
        return new ComplexNumber(this.x + cn.x, this.y + cn.y);
    }

    mult(cn)
    {
        return new ComplexNumber(this.x * cn.x - this.y * cn.y,
            this.x * cn.y + this.y * cn.x)
    }

    sub(cn)
    {
        return new ComplexNumber(this.x - cn.x, this.y - cn.y);
    }

    divF(f)
    {
        return new ComplexNumber(this.x / f, this.y / f);
    }

    multF(f)
    {
        return new ComplexNumber(this.x * f, this.y * f);
    }

    getP()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    getT()
    {
        return Math.atan2(this.y, this.x);
    }

    copy()
    {
        return new ComplexNumber(this.x, this.y);
    }
}

function FourierCoefficient(mode)
{
    var coef = ComplexNumber.fromCartesian(0.0, 0.0);
    var N = points.length;

    for (var n = 0; n < N; ++n)
    {
        var simpson_factor = 1.;
        if (n > 0)
        {
            simpson_factor = (n % 2 == 0 ? 2. : 4.);
        }
        simpson_factor = ComplexNumber.fromCartesian(simpson_factor, 0.);

        var time = n / (N - 1.) * 0.5;
        var exp = ComplexNumber.fromPolar(1.0, -2.0 * Math.PI * mode * time);
        var new_term = points[n].mult(exp);
        coef = coef.add(new_term.mult(simpson_factor));

        if (n < N - 1)
        {
            var time_reverse = 1.0 - time;
            var exp_reverse = ComplexNumber.
                fromPolar(1.0, -2.0 * Math.PI * mode * time_reverse);
            var new_term_reverse = points[n].mult(exp_reverse);
            coef = coef.add(new_term_reverse.mult(simpson_factor));
        }
    }

    coef.x /= 3.0 * (2. * N - 1.);
    coef.y /= 3.0 * (2. * N - 1.);

    return coef;
}

function arrangePoints(dx)
{
    var arraged_points = [];
    var current_point = points[0].copy();
    var dx_left = 0;

    for (var i = 0; i < points.length - 1; ++i)
    {
        var next_point = points[i + 1].copy();

        var dist = next_point.sub(current_point).getP();

        if (dist >= dx - dx_left)
        {
            current_point = current_point.add(
                    next_point.sub(current_point).divF(dist).
                    multF(dx - dx_left));
            arraged_points.push(current_point);
            left = 0;
            --i;
        }
        else
        {
            current_point = next_point;
            dx_left = dist;
        }
    }

    if (arraged_points.length < 2 * Math.ceil(max_modes / 2))
        return arrangePoints(dx / 2.0);

    return arraged_points;
}

function FourierTransform()
{
    var coefs = [FourierCoefficient(0)];

    for (var m = 1; m <= Math.floor(max_modes / 2); ++m)
    {
        coefs.push(FourierCoefficient(m));
        coefs.push(FourierCoefficient(-m));
    }

    if (max_modes % 2 != 0)
        coefs.push(FourierCoefficient(Math.ceil(max_modes / 2)));

    return coefs;
}

function drawFourier(time)
{
    var point = fourier_coefs[0].copy();
    var index = 1;
    for (var m = 1; m <= Math.floor(max_modes / 2); ++m)
    {
        var term = fourier_coefs[index].
            mult(ComplexNumber.fromPolar(1.0, 2.0 * Math.PI * m * time))
            drawCircle(point.x, point.y, term.getP(), fourier_ctx);
        var old_point = point.copy();
        point = point.add(term);
        drawLine(old_point.x, old_point.y, point.x, point.y, fourier_ctx);

        ++index;

        var term_r = fourier_coefs[index].
            mult(ComplexNumber.fromPolar(1.0, -2.0 * Math.PI * m * time))
            drawCircle(point.x, point.y, term_r.getP(), fourier_ctx);
        var old_point_r = point.copy();
        point = point.add(term_r);
        drawLine(old_point_r.x, old_point_r.y, point.x, point.y, fourier_ctx);

        ++index;
    }

    if (max_modes % 2 != 0)
    {
        m = Math.ceil(max_modes / 2);
        var term = fourier_coefs[index].
            mult(ComplexNumber.fromPolar(1.0, 2.0 * Math.PI * m * time))
            drawCircle(point.x, point.y, term.getP(), fourier_ctx);
        var old_point = point.copy();
        point = point.add(term);
        drawLine(old_point.x, old_point.y, point.x, point.y, fourier_ctx);
    }

    fourier_points.push(point);

    for (var i = 0; i < fourier_points.length - 1; ++i)
        drawLine(fourier_points[i].x, fourier_points[i].y,
            fourier_points[i + 1].x, fourier_points[i + 1].y,
            fourier_ctx)
}

function resize()
{
    canvas.width = window.innerWidth * 0.425;
    canvas.height = window.innerHeight * 0.5;

    fourier_canvas.width = canvas.width;
    fourier_canvas.height = canvas.height;
}

window.onresize = resize;

window.onload = function init()
{
    canvas = document.getElementById('canvas');
    fourier_canvas = document.getElementById('fourier_canvas');

    resize();

    ctx = canvas.getContext("2d");
    fourier_ctx = fourier_canvas.getContext("2d");

    canvas.addEventListener("mousemove", function (e)
    {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e)
    {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e)
    {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e)
    {
        findxy('out', e)
    }, false);

    select_mode();
    render();
}

function select_mode()
{
    max_modes = parseInt(document.getElementById("modeSlider").value);
    document.getElementById("max_modes").innerHTML = max_modes;
    fourier_coefs = FourierTransform();
    fourier_points = [];
}

function select_mode_add(n){
    document.getElementById("modeSlider").value = (max_modes + n).toString();
    select_mode();
}

function drawCircle(cx, cy, r, context)
{
    context.beginPath();
    context.arc(cx, cy, r, 0, 2 * Math.PI, false);
    context.lineWidth = 1;
    context.strokeStyle = 'blue';
    context.stroke();
}

function drawLine(p1x, p1y, p2x, p2y, context)
{

    // draw a red line
    context.beginPath();
    context.moveTo(p1x, p1y);
    context.lineTo(p2x, p2y);
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();
}

function draw(context)
{
    context.beginPath();
    context.moveTo(prevX, prevY);
    context.lineTo(currX, currY);
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
}

function erase(context, canv)
{
    context.clearRect(0, 0, canv.width, canv.height);
}

function erase_canvas()
{
    erase(ctx, canvas);
}

window.requestAnimFrame = (function ()
{
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element)
    {
        window.setTimeout(callback, 1000 / 60);
    };
}
)();

function render()
{
    window.requestAnimFrame(render);

    erase(fourier_ctx, fourier_canvas);
    if (drawing_fourier)
    {
        drawFourier(draw_time);
        draw_time += draw_dt;
        if (draw_time > 1)
        {
            draw_time -= 1;
            fourier_points = [];
        }
    }
}

function findxy(mouse, e)
{
    if (mouse == 'down')
    {
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        points = [];
        points.push(ComplexNumber.fromCartesian(currX, currY));

        drawing = true;
        drawing_fourier = false;
    }

    if (mouse == 'up' || (drawing && mouse == "out"))
    {
        drawing = false;
        // points = [];
        // for (var i = 0; i < 10001; ++i)
        //     points.push(ComplexNumber.
        //     fromCartesian(200.+100 * Math.cos(2. * Math.PI * i / 10000),
        //             200.+100 * Math.sin(2. * Math.PI * i / 10000)));
        points = arrangePoints(dx_default);
        fourier_coefs = FourierTransform();
        drawing_fourier = true;
        draw_time = 0;
        fourier_points = [];
    }

    if (mouse == 'move' && drawing)
    {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        points.push(ComplexNumber.fromCartesian(currX, currY));

        draw(ctx);
    }
}
