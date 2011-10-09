(function() {
 
    body = document.body;
    painting = {};  //main canvas object
	tools = {};		//paint tools
 
    /**    
			CSS
    **/
    var style = document.createElement('style'),
        cssRules = document.createTextNode(
            'div#cvsContainer {'+
                'position: absolute;'+
                'left: 0px; top: 0px;'+
                'width: 100%; height: 100%;'+
                'z-index: 1000000;'+
            '}'+
            'div#sketchToolBox {'+
                '-webkit-transition: left .25s ease-in-out .1s; transition: left .25s ease-in-out .1s;'+
                'position: fixed;'+
                'top: 100px; left: -156px;'+
                'padding: 3px;'+
                'border: 1px dashed #CCCCCC;'+
                'z-index: 1000001;'+
                'opacity: 0.8;'+
                'background: #3D3D3D;'+
                '-moz-box-shadow: 3px 3px 10px #111, inset 0 0 10px black;'+
				'-webkit-box-shadow: 3px 3px 10px #111, inset 0 0 10px black;'+ 
				'box-shadow: 3px 3px 10px #111, inset 0 0 10px black;'+
            '}'+
            'div#sketchToolBox:hover {'+
                'left: -2px;'+
                '-webkit-transition: left .25s ease-in-out; transition: left .25s ease-in-out;'+
            '}'+
            'div#sketchToolBox > canvas#huePicker {'+
                'position: absolute;'+
                'top: 30px; left: 110px;'+
                'cursor: crosshair'+
            '}'+
            'div#sketchToolBox > canvas#shadePicker {'+
                'position: absolute;'+
                'top: 30px; left: 5px;'+
                'cursor: crosshair'+
            '}'+
            'div#sketchToolBox > input#brushSlider { width: 65%; }'+
            'div#sketchToolBox > button#toolsRedo {'+
                'width: 20px; height: 20px;'+
                'float: left;'+
				'border: none;'+
				'background:url(http://cdn.dustball.com/control_start.png) center no-repeat;'+
				'margin-right: 3px;'+
				'border-radius: 5px; -webkit-border-radius: 5px; -moz-border-radius: 5px;'+
            '}'+
            'div#sketchToolBox > button#toolsRedo:hover { background-color: #777; }'+
            'div#sketchToolBox > table {'+
				'height: 100%;'+
				'float: right;'+
                'font-size: 16px; font-weight: bold; line-height: 16px;'+
                'color: black; text-shadow: 0px 2px 3px #555;'+
                'text-align: center'+
            '}'+
            'canvas#toolsPreview {'+
                'z-Index: 1000001;'+
                'border-radius: 10px;'+
                '-webkit-border-radius: 10px; -moz-border-radius: 10px;'+
                'z-Index: 1000001;'+
                'position: fixed;'+
                'left: 40%; top: 100px;'+
                'width: 100px; height: 100px;'+
                'background: #3D3D3D;'+
                'opacity: 0.8;'+
            '}'+
            'canvas#sketchy {'+
                'width: ' + body.scrollWidth + 'px;'+
                'height: ' + body.scrollHeight + 'px;'+
                'overflow: visible;'+
                'position: absolute;'+
            '}'
    );
    //append style node to head
    style.type = 'text/css';
    style.appendChild(cssRules);
    document.head.appendChild(style);
               
    /**
			Canvas overlay
    **/
    //create div to place canvas in + append to body
    box = document.createElement('div');
    box.setAttribute('id', 'cvsContainer');
 
    body.appendChild(box);
 
    //create canvas + append to box
    painting.c = document.createElement('canvas');
    painting.c.setAttribute('id', 'sketchy');
    painting.c.width = body.scrollWidth;
    painting.c.height = body.scrollHeight;
   
    box.appendChild(painting.c);
 
    //instantiate canvas and apply default brush options
    painting.ctx = painting.c.getContext('2d');
    painting.ctx.strokeStyle = '#000000';	//default brush color to black
    painting.ctx.lineJoin = 'round';
	painting.ctx.lineCap = 'round';	//round brush
    painting.ctx.lineWidth = 10;	//default brush size
             
	//paint!
	var started = false;
    painting.c.addEventListener('mousedown', function(e) {
		var x = e.pageX, y = e.pageY;
		painting.ctx.beginPath();
		painting.ctx.moveTo(x, y);
		painting.ctx.lineTo(x - 1, y);
		painting.ctx.stroke();
		painting.ctx.moveTo(x - 1, y);
		started = true;
	});
    painting.c.addEventListener('mouseup', function(e) {
		started = false;
	});
    painting.c.addEventListener('mousemove', function(e) {
		if (started) {
			painting.ctx.lineTo(e.pageX, e.pageY);
			painting.ctx.stroke();
		}
	});
 
    /**
			Toolbox
    */
    //create toolbox + append to body
    toolBox = document.createElement('div');
    toolBox.setAttribute('id', 'sketchToolBox');      //wacky ID name to avoid conflicting with rest of page styles
    toolBox.style.width = '170px';    	//requires explicit setting for visibility
    toolBox.style.height = '130px';		//requires explicit setting for visibility
 
    body.appendChild(toolBox);
               
    toolBox.addEventListener('mouseover', function() {
        tools.preview.show();
    });
    toolBox.addEventListener('mouseout', function() {
        tools.preview.hide();
    });
   
    /**
			Preview box
    **/
    function Preview(parent, width, height, id) {
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('id', id);
        this.canvas.setAttribute('width', width);   //workaround
        this.canvas.setAttribute('height', height);

        parent.appendChild(this.canvas);
        return this;
    };
    Preview.prototype.setColor = function(color) {
        this.canvas.getContext('2d').fillStyle = color;
        return this;
    };
    Preview.prototype.getColor = function(color) {
        return this.canvas.getContext('2d').fillStyle;
    };
    Preview.prototype.paint = function() {
        ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);    //erase the current preview
        this.show();
        ctx.beginPath();
        ctx.arc(this.canvas.width/2, this.canvas.height/2, painting.ctx.lineWidth/2, 0, Math.PI*2, true);
        ctx.stroke();
        ctx.fill();
        return this;
    };
    Preview.prototype.show = function() {
        document.getElementById(this.canvas.getAttribute('id')).style.display = 'block';
        return this;
    };
    Preview.prototype.hide = function() {
        document.getElementById(this.canvas.getAttribute('id')).style.display = 'none';
        return this;
    };

    tools.preview = new Preview(body, '100px', '100px', 'toolsPreview').setColor(painting.color).paint().hide();

    //draw toolbax brush-size slider + append to toolbox
    tools.slider = document.createElement('input');
    tools.slider.setAttribute('id', 'brushSlider');
    tools.slider.setAttribute('type', 'range');
    tools.slider.setAttribute('min', '0');
    tools.slider.setAttribute('max', '90');
    tools.slider.setAttribute('value', painting.ctx.lineWidth);
 
    toolBox.appendChild(tools.slider);
               
    //update brush size + draw the preview
    tools.slider.onchange = function(e) {
        painting.ctx.lineWidth = e.target.valueAsNumber;
        tools.preview.paint();
    };
 
    //create erase icon + append to toolbox
    tools.erase = document.createElement('button');
    tools.erase.setAttribute('id', 'toolsRedo');
 
    toolBox.appendChild(tools.erase);
 
    //erase event - clear whole painting
    tools.erase.onclick = function() {
        painting.ctx.clearRect(0, 0, painting.c.width, painting.c.height); 
    };
 
    //helper method for formatting hsl() string
    function buildHSL(h,s,l) {
        return 'hsl('+h.toString()+','+s.toString()+'%,'+l.toString()+'%)'; 
    };
               
    /**
			Hue color picker
			@events is (optional) object hash of the form {'click': callbackFoo, 'mouseover': callbackBar, ...}
    **/  
    function HuePicker(parent, width, height, events) {
        //create picker + initialize context
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('id', 'huePicker');
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
       
        parent.appendChild(this.canvas);

        //attach events
        if(events) {
            var bindings = Object.keys(events),
                i = bindings.length;
            while(i--) {
                this.canvas.addEventListener(bindings[i], events[bindings[i]]);
            }
        }
        return this;
    };                  
    HuePicker.prototype.paint = function() {    //paints entire color spectrum
        ctx = this.canvas.getContext('2d');
		var barHeight = Math.round(10*parseInt(this.canvas.height)/360)/10;
        for(var h = 0; h <= 360; h++) {
            ctx.fillStyle = buildHSL(h, 100, 50);
            ctx.fillRect(0, h*barHeight, this.canvas.width, barHeight);
        }
        return this;
    };
               
    //create hue colorpicker + append to toolBox
    hueSelected = false;    //to prevent re-painting of preview after user selects a hue
    tools.huePicker = new HuePicker(toolBox, '20px', '100px', {
        'mousemove': function(e) {        //display preview
            if(!hueSelected) {
                hue = 360*(e.clientY - this.offsetTop - this.parentNode.offsetTop)/this.height;
                tools.preview.setColor(buildHSL(hue,100,50)).paint();
                tools.shadePicker.paint(hue);
                painting.hue = hue;
            }
        },
        'mouseup': function(e) {               //change color on painting brush
            hueSelected = true;
            var hue = 360*(e.clientY - this.offsetTop - this.parentNode.offsetTop)/this.height;
            painting.ctx.strokeStyle = painting.ctx.fillStyle = buildHSL(hue,100,50);
        },
        'mouseout': function() {
            hueSelected = false;
			tools.preview.setColor(painting.ctx.fillStyle).paint();
        }
    }).paint();
               
    /**
			Shade color picker
			@events is (optional) hash of the form {'click': callbackFoo, 'mouseover': callbackBar, ...}
    **/
    function ShadePicker(parent, width, height, events) {
        //create picker + append to parent DOM element
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('id', 'shadePicker');
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
       
        parent.appendChild(this.canvas);

        //attach events
        if(events) {
            var bindings = Object.keys(events),
                i = bindings.length;
            while(i--) {
              this.canvas.addEventListener(bindings[i], events[bindings[i]]);
            }
        }
        return this;
    }
    ShadePicker.prototype.paint = function(hue) {  //paint all shades of @hue into the shade picker
        ctx = this.canvas.getContext('2d');
		var swatchWidth = Math.round(10*parseInt(this.canvas.width)/100)/10,
					swatchHeight = Math.round(10*parseInt(this.canvas.height)/100)/10;
        for(var l = 100; l >= 0; l--) { //vertical
            for(var s = 0; s <= 100; s++) { //horizontal
                ctx.fillStyle = buildHSL(hue || 0,s,l);
                ctx.fillRect(s*swatchWidth, l*swatchHeight, swatchWidth, swatchHeight);
            }
        }
        return this;
    }

    var shadeSelected = false;  //prevent re-painting of preview after user selects a shade
    tools.shadePicker = new ShadePicker(toolBox, '100px', '100px', {
        'mousemove': function(e) {
            if(!shadeSelected){ tools.preview.setColor(buildHSL(painting.hue || 0,e.clientX - this.offsetLeft, e.clientY - this.offsetTop - this.parentNode.offsetTop)).paint()};
        },
        'mouseup': function(e) {
            shadeSelected = true;
            painting.ctx.strokeStyle = painting.ctx.fillStyle = buildHSL(painting.hue || 0,e.clientX - this.offsetLeft, e.clientY - this.offsetTop - this.parentNode.offsetTop);
        },
        'mouseout': function() {
            shadeSelected = false;
			tools.preview.setColor(painting.ctx.fillStyle).paint();
        }
    }).paint(0);
               
    //draw toolbox label + append to toolbox
    label = document.createElement('table'),
		lbody = document.createElement('tbody');
	label.appendChild(lbody);
    labelText = 'TOOLS';
    for(var i = 0; labelText[i]; i++) {
        lbody.innerHTML += '<tr><td>'+labelText[i]+'</td></tr>';
    }
    toolBox.appendChild(label);
})();
