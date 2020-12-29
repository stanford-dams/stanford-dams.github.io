var caller = document.getElementById('hoverscript').getAttribute('data');

var active = -1;

var refs = {};
d3.tsv('./refs.tsv', function (d) {
    if (d.chapter == caller) refs['ref'+ d.idx] = d.ref;
});

var last = -1;
var xoff = 0;
if (caller === '1' || caller === '2') {
    var imagerefs = {};
    var numimgs = {};
    var sources = {};
    var captions = {};
    d3.tsv('./images.tsv', function (d) {
        if (d['chapter'] === caller) {
            var list = d['images'].split(',');
            for (var i = 0; i < list.length; i++) list[i] = '0' + caller + '-' + list[i];
            imagerefs[d['ref']] = list;
            numimgs[d['ref']] = list.length;
            var srclist = d['source'].split('***');
            sources[d['ref']] = srclist;
            var caplist = d['caption'].split('***');
            captions[d['ref']] = caplist;
            var pos = d3.select('#' + d.ref)._groups[0][0].offsetTop;
            renderThumb(list[0], pos, d.ref);
        }
    });
}

var tooltips = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

var slide_tooltips = d3.select('body').append('div')
    .attr('class', 'slide_tooltips')
    .style('opacity', 1);

var coveron = false;
var whichimg = 0;


function removeTooltip(elem) {
    elem.transition()
        .duration(0)
        .style('opacity', 0);
}

function addTooltip(elem) {
    elem.transition()
        .duration(0)
        .style('opacity', 1);
}


function renderThumb(img, pos, id) {
    //var width = (window.innerWidth-650-100)/2;
    var width = (window.innerWidth - 650)/4;
    var yoff = pos;
    if (last != -1) {
        var last_elem = last._groups[0][0].offsetTop;
        var last_bot = last_elem + (0.5625*width);
        if (last_bot >= yoff-50) { xoff += 10; } else { xoff = 0; }
        if (last_elem == yoff-50) { yoff += 20; } 
    } 
    var img_elem = slide_tooltips.append('img')
        .attr('class', 'thumbimg')
        .attr('id', img)
        .attr('width', width)
        .style('position', 'absolute')
        .style('top', yoff-50)
        .style('left', width/2 + xoff)
        .style('border', '0.1px solid gray')
        .attr('src', 'images/'.concat(img).concat('.jpeg'))
        .on('click', function (d) {
            var elem = d3.select(this);
            if (coveron) {
                whichimg = 0;
                removeCover();
                coveron = false;
            } else {
                addCover(id);
                coveron = true;
            }
        });
    last = img_elem;
}


function addFootnote(elem) {
    addTooltip(tooltips);
    var width = window.innerWidth;
    var xpos = (width/2) + (650/2) + 5;
    var props = elem._groups[0][0];
    var ypos = props.offsetTop;
    var height = props.offsetHeight;
    var ref = elem.attr('id');
    var text = refs[ref];
    tooltips.html(text)
        .style('left', (xpos+10) + 'px')
        .style('top', (ypos+3) + 'px');
}

function removeCover() {
    d3.selectAll('.cover').remove();
    d3.selectAll('.overlay').remove();
}

function exitCover() {
    whichimg = 0;
    removeCover();
    coveron = false;
}

function addOverlay(elem) {
    var overlay = d3.selectAll(elem).append('div')
        .attr('class', 'overlay')
        .on('click', function () { exitCover(); });
}


function addCover(id) {
    removeCover();
    addOverlay('body');
    var img = imagerefs[id][whichimg];
    var height = 0.7*(window.innerHeight);
    var sidewidth = (window.innerWidth - 1.85*height)/2.0;
    var doc = document.documentElement;
    var ypos = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    var cover = d3.select('body').append('div')
        .attr('class', 'cover')
        .style('left', (0) + 'px')
        .style('top', (ypos+20) + 'px');
    var return_click_l = cover.append('div')
        .attr('class', 'returnclick')
        .style('float', 'left')
        .style('width', sidewidth)
        .style('height', window.innerHeight)
        .style('left', (0) + 'px')
        .style('top', (ypos+20) + 'px');
    var return_click_r = cover.append('div')
        .attr('class', 'returnclick')
        .style('float', 'right')
        .style('width', sidewidth)
        .style('height', window.innerHeight)
        .style('left', (0) + 'px')
        .style('top', (ypos+20) + 'px');
    d3.selectAll('.returnclick').on('click', function () {
        whichimg = 0;
        removeCover(); 
        coveron = false;
    });
    var seq_string = (whichimg+1).toString() + '/' + numimgs[id].toString();
    var img_caption = cover.append('div')
        .attr('class', 'imgcaption')
        .style('width', 1.7778*height)
        .html(seq_string + '<br>' + captions[id][whichimg]);
    var img_elem = cover.append('img')
        .attr('class', 'slideimg')
        .attr('height', height)
        .attr('src', 'images/'.concat(img).concat('.jpeg'));
    var img_src = sources[id][whichimg];
    if (img_src != '0') {
        cover.append('div')
            .attr('class', 'imgsrc')
            .style('width', 1.7778*height)
            .html(sources[id][whichimg]);
    }
    var return_click_b = cover.append('div')
        .attr('class', 'returnclick_bot')
        .style('width', window.innerWidth)
        .style('height', 200)
        .on('click', function () {
            whichimg = 0;
            removeCover(); 
            coveron = false;
        });
    if (numimgs[id] > 1) {
        img_elem.on('mouseover', function () {
            var img_elem_container = img_elem._groups[0][0];
            var top_pos = img_elem_container.offsetHeight + img_elem_container.offsetTop;
            var clicktoflip = cover.append('div')
                .attr('class', 'clicktoflip c2f')
                .style('width', 120)
                .style('height', 30)
            top_pos = top_pos - clicktoflip._groups[0][0].offsetTop - 30;
            clicktoflip.style('margin-top', top_pos).style('margin-left', (1.7778*height)-75);
            clicktoflip.append('text')
                .attr('class', 'c2ftext c2f')
                //.attr('text-anchor', 'end')
                .text('Click to flip (' + seq_string + ')');
        });
        img_elem.on('mouseout', function () { d3.selectAll('.c2f').remove(); });
    }
    d3.selectAll('.slideimg').on('click', function () { addCover(id); });
    whichimg += 1;
    if (whichimg >= numimgs[id]) whichimg = 0;
}

d3.selectAll('.footnote').on('mouseover', function () {
    var elem = d3.select(this);
    addFootnote(elem);
    if (active != elem.attr('id')) active = -1;
});

d3.selectAll('.footnote').on('click', function () {
    if (active == -1) {
        var elem = d3.select(this);
        addFootnote(elem);
        active = elem.attr('id');
    } else {
        removeTooltip(tooltips);
        active = -1;
    }
});


d3.selectAll('.footnote').on('mouseout', function () {
    if (active == -1) removeTooltip(tooltips);
});
d3.selectAll('.slides').on('mouseout', function () { removeTooltip(slide_tooltips); });
d3.selectAll('.slides').on('mouseout', function () { removeTooltip(tooltips); });


