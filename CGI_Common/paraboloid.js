// paraboloid.js


var paraboloid_points = [];

var paraboloid_normals = [];

var paraboloid_faces = [];

var paraboloid_edges = [];

var paraboloid_points_buffer;

var paraboloid_normals_buffer;

var paraboloid_faces_buffer;

var paraboloid_edges_buffer;

var PARABOLOID_LATS = 20;

var PARABOLOID_LONS = 30;

function paraboloidInit(gl)
{

    paraboloidBuild(PARABOLOID_LATS, PARABOLOID_LONS);

    paraboloidUploadData(gl);

}

// Generate points using polar coordinates

function paraboloidBuild(nlat, nlon)

{

    // phi will be latitude
    // theta will be longitude
    var y_max = 1.0;
    var d_y = y_max / (nlat + 1);
    var d_theta = 2 * Math.PI / nlon;

    // Genreate the points
    //
    // Generate north polar cap points and normals
    var down_offset = 0.5;

    var south = vec3(0, 0 -down_offset, 0);
    paraboloid_points.push(south);
    paraboloid_normals.push(vec3(0, -1, 0));

    // Generate middle points and normals
    
    for (var i = 0, k = 0.1, y = d_y * k; i < nlat; i++, k += 0.1, y += d_y * k)
    {
    	var r = Math.sqrt(y);
        for (var j = 0, theta = 0; j < nlon; j++, theta += d_theta)
        {
            var x = r * Math.cos(theta);
            var z = r * Math.sin(theta);

            paraboloid_points.push(vec3(x, y - down_offset, z));

            var n = vec3(2.0 * x, 1.0, 2.0 * z);
            paraboloid_normals.push(normalize(n));
        }
    }

    // Generate the faces
    // north pole faces

    for (var i = 0; i < nlon - 1; i++)
    {
        paraboloid_faces.push(0);
        paraboloid_faces.push(i + 1);
        paraboloid_faces.push(i + 2);
    }

    paraboloid_faces.push(0);
    paraboloid_faces.push(nlon);
    paraboloid_faces.push(1);

    // general middle faces

    var offset = 1;

    for (var i = 0; i < nlat - 1; i++)
    {
        for (var j = 0; j < nlon - 1; j++)
        {
            var p = offset + i * nlon + j;

            paraboloid_faces.push(p);
            paraboloid_faces.push(p + nlon);
            paraboloid_faces.push(p + nlon + 1);
            paraboloid_faces.push(p);
            paraboloid_faces.push(p + nlon + 1);
            paraboloid_faces.push(p + 1);
        }

        var p = offset + i * nlon + nlon - 1;

        paraboloid_faces.push(p);
        paraboloid_faces.push(p + nlon);
        paraboloid_faces.push(p + 1);
        paraboloid_faces.push(p);
        paraboloid_faces.push(p + 1);
        paraboloid_faces.push(p - nlon + 1);
    }

    // south pole faces

    // var offset = 1 + (nlat - 1) * nlon;

    // for (var j = 0; j < nlon - 1; j++)
    // {
    //     paraboloid_faces.push(offset + nlon);
    //     paraboloid_faces.push(offset + j + 1);
    //     paraboloid_faces.push(offset + j);
    // }

    // paraboloid_faces.push(offset + nlon);
    // paraboloid_faces.push(offset);
    // paraboloid_faces.push(offset + nlon - 1);

    // Build the edges

    for (var i = 0; i < nlon; i++)
    {
        paraboloid_edges.push(0); // North pole
        paraboloid_edges.push(i + 1);
    }

    for (var i = 0; i < nlat; i++, p++)
    {
        for (var j = 0; j < nlon; j++, p++)
        {
            var p = 1 + i * nlon + j;

            paraboloid_edges.push(p); // horizontal line (same latitude)

            if (j != nlon - 1)

                paraboloid_edges.push(p + 1);
            else
                paraboloid_edges.push(p + 1 - nlon);

            if (i != nlat - 1)
            {
                paraboloid_edges.push(p); // vertical line (same longitude)
                paraboloid_edges.push(p + nlon);
            }
        }
    }
}

function paraboloidUploadData(gl)
{
    paraboloid_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(paraboloid_points), gl.STATIC_DRAW);

    paraboloid_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(paraboloid_normals), gl.STATIC_DRAW);

    paraboloid_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, paraboloid_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(paraboloid_faces), gl.STATIC_DRAW);

    paraboloid_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, paraboloid_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(paraboloid_edges), gl.STATIC_DRAW);
}

function paraboloidDrawWireFrame(gl, program)
{
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_points_buffer);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_normals_buffer);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, paraboloid_edges_buffer);
    gl.drawElements(gl.LINES, paraboloid_edges.length, gl.UNSIGNED_SHORT, 0);
}

function paraboloidDrawFilled(gl, program)
{
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_points_buffer);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_normals_buffer);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, paraboloid_faces_buffer);
    gl.drawElements(gl.TRIANGLES, paraboloid_faces.length, gl.UNSIGNED_SHORT, 0);
}

function paraboloidDraw(gl, program, filled=false) {
    if(filled) paraboloidDrawFilled(gl, program);
    else paraboloidDrawWireFrame(gl, program);
}