// Daniel Shiffman
// http://codingtra.in
// Steering Text Paths
// Video: https://www.youtube.com/watch?v=4hA7G3gup-4

var s = function( sketch ) {
  var font;
  var vehicles = [];

  sketch.preload = function() {
    font = sketch.loadFont('AvenirNextLTPro-Demi.otf');
  }

  sketch.setup = function() {
    sketch.createCanvas(600, 300);
    sketch.background(51);
    // textFont(font);
    // textSize(192);
    // fill(255);
    // noStroke();
    // text('train', 100, 200);

    var points = font.textToPoints('YOGA', 20, 200, 192, {
      sampleFactor: 0.25
    });

    for (var i = 0; i < points.length; i++) {
      var pt = points[i];
      var vehicle = new Vehicle(pt.x, pt.y, sketch);
      vehicles.push(vehicle);
      // stroke(255);
      // strokeWeight(8);
      // point(pt.x, pt.y);
    }
  }

  sketch.draw = function() {
    sketch.background(51);
    for (var i = 0; i < vehicles.length; i++) {
      var v = vehicles[i];
      v.behaviors();
      v.update();
      v.show();
    }
  }
}
var myp2 = new p5(s, 'interactive_font');