var s = function( sketch ) {
    const numRings = 3
    const width = 300
    const height = 300

    sketch.setup = function() {
    let cnv = sketch.createCanvas(width, height);
    sketch.angleMode(sketch.DEGREES);
    }

    sketch.draw = function() {
    sketch.translate(width / 2, height / 2);
    sketch.background(0);

    for (let i = 0; i < numRings; i++) {
        sketch.rotate(360 / numRings);
        sketch.drawShape();
    }
    }

    sketch.drawShape = function() {
    for (let angle = 0; angle < 360; angle += 10) {
        const x = sketch.cos(angle + sketch.mouseX / 5) * (width / 10 + sketch.mouseX / 5);
        const y = sketch.sin(angle + sketch.mouseY / 10) * (height / 10 + sketch.mouseY / 10);
        sketch.fill(angle);
        sketch.noStroke();
        sketch.ellipse(x, y, 50);
    }
    }

    sketch.windowResized = function() {
        sketch.resizeCanvas(width, height);
    }
}

var myp5 = new p5(s, 'kaleidoscope_rings');