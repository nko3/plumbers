(function(a){"use strict";var b={},c=Math.max,d=Math.min;b.c={},b.c.d=a(document),b.c.t=function(a){return a.originalEvent.touches.length-1},b.o=function(){var c=this;this.o=null,this.$=null,this.i=null,this.g=null,this.v=null,this.cv=null,this.x=0,this.y=0,this.$c=null,this.c=null,this.t=0,this.isInit=!1,this.fgColor=null,this.pColor=null,this.dH=null,this.cH=null,this.eH=null,this.rH=null,this.run=function(){var b=function(a,b){var d;for(d in b)c.o[d]=b[d];c.init(),c._configure()._draw()};if(!this.$.data("kontroled"))return this.$.data("kontroled",!0),this.extend(),this.o=a.extend({min:this.$.data("min")||0,max:this.$.data("max")||100,stopper:!0,readOnly:this.$.data("readonly"),cursor:this.$.data("cursor")===!0&&30||this.$.data("cursor")||0,thickness:this.$.data("thickness")||.35,width:this.$.data("width")||200,height:this.$.data("height")||200,displayInput:this.$.data("displayinput")==null||this.$.data("displayinput"),displayPrevious:this.$.data("displayprevious"),fgColor:this.$.data("fgcolor")||"#87CEEB",inline:!1,draw:null,change:null,cancel:null,release:null},this.o),this.$.is("fieldset")?(this.v={},this.i=this.$.find("input"),this.i.each(function(b){var d=a(this);c.i[b]=d,c.v[b]=d.val(),d.bind("change",function(){var a={};a[b]=d.val(),c.val(a)})}),this.$.find("legend").remove()):(this.i=this.$,this.v=this.$.val(),this.v==""&&(this.v=this.o.min),this.$.bind("change",function(){c.val(c.$.val())})),!this.o.displayInput&&this.$.hide(),this.$c=a('<canvas width="'+this.o.width+'px" height="'+this.o.height+'px"></canvas>'),this.c=this.$c[0].getContext("2d"),this.$.wrap(a('<div style="'+(this.o.inline?"display:inline;":"")+"width:"+this.o.width+"px;height:"+this.o.height+'px;"></div>')).before(this.$c),this.v instanceof Object?(this.cv={},this.copy(this.v,this.cv)):this.cv=this.v,this.$.bind("configure",b).parent().bind("configure",b),this._listen()._configure()._xy().init(),this.isInit=!0,this._draw(),this},this._draw=function(){var a=!0,b=document.createElement("canvas");b.width=c.o.width,b.height=c.o.height,c.g=b.getContext("2d"),c.clear(),c.dH&&(a=c.dH()),a!==!1&&c.draw(),c.c.drawImage(b,0,0),b=null},this._touch=function(a){var d=function(a){var b=c.xy2val(a.originalEvent.touches[c.t].pageX,a.originalEvent.touches[c.t].pageY);b!=c.cv&&(c.cH&&c.cH(b)===!1||(c.change(b),c._draw()))};return this.t=b.c.t(a),d(a),b.c.d.bind("touchmove.k",d).bind("touchend.k",function(){b.c.d.unbind("touchmove.k touchend.k"),c.rH&&c.rH(c.cv)===!1||c.val(c.cv)}),this},this._mouse=function(a){var d=function(a){var b=c.xy2val(a.pageX,a.pageY);b!=c.cv&&(c.cH&&c.cH(b)===!1||(c.change(b),c._draw()))};return d(a),b.c.d.bind("mousemove.k",d).bind("keyup.k",function(a){if(a.keyCode===27){if(b.c.d.unbind("mouseup.k mousemove.k keyup.k"),c.eH&&c.eH()===!1)return;c.cancel()}}).bind("mouseup.k",function(){b.c.d.unbind("mousemove.k mouseup.k keyup.k"),c.rH&&c.rH(c.cv)===!1||c.val(c.cv)}),this},this._xy=function(){var a=this.$c.offset();return this.x=a.left,this.y=a.top,this},this._listen=function(){return this.o.readOnly?this.$.attr("readonly","readonly"):(this.$c.bind("mousedown",function(a){a.preventDefault(),c._xy()._mouse(a)}).bind("touchstart",function(a){a.preventDefault(),c._xy()._touch(a)}),this.listen()),this},this._configure=function(){return this.o.draw&&(this.dH=this.o.draw),this.o.change&&(this.cH=this.o.change),this.o.cancel&&(this.eH=this.o.cancel),this.o.release&&(this.rH=this.o.release),this.o.displayPrevious?(this.pColor=this.h2rgba(this.o.fgColor,"0.4"),this.fgColor=this.h2rgba(this.o.fgColor,"0.6")):this.fgColor=this.o.fgColor,this},this._clear=function(){this.$c[0].width=this.$c[0].width},this.listen=function(){},this.extend=function(){},this.init=function(){},this.change=function(){},this.val=function(){},this.xy2val=function(){},this.draw=function(){},this.clear=function(){this._clear()},this.h2rgba=function(a,b){var c;return a=a.substring(1,7),c=[parseInt(a.substring(0,2),16),parseInt(a.substring(2,4),16),parseInt(a.substring(4,6),16)],"rgba("+c[0]+","+c[1]+","+c[2]+","+b+")"},this.copy=function(a,b){for(var c in a)b[c]=a[c]}},b.Dial=function(){b.o.call(this),this.startAngle=null,this.xy=null,this.radius=null,this.lineWidth=null,this.cursorExt=null,this.w2=null,this.PI2=2*Math.PI,this.extend=function(){this.o=a.extend({bgColor:this.$.data("bgcolor")||"#EEEEEE",angleOffset:this.$.data("angleoffset")||0,angleArc:this.$.data("anglearc")||360,inline:!0},this.o)},this.val=function(a){return null==a?this.v:(this.cv=this.o.stopper?c(d(a,this.o.max),this.o.min):a,this.v=this.cv,this.$.val(this.v),this._draw(),void 0)},this.xy2val=function(a,b){var e,f;return e=Math.atan2(a-(this.x+this.w2),-(b-this.y-this.w2))-this.angleOffset,this.angleArc!=this.PI2&&0>e&&e>-.5?e=0:0>e&&(e+=this.PI2),f=~~(.5+e*(this.o.max-this.o.min)/this.angleArc)+this.o.min,this.o.stopper&&(f=c(d(f,this.o.max),this.o.min)),f},this.listen=function(){var f,g,b=this,e=function(a){a.preventDefault();var c=a.originalEvent,d=c.detail||c.wheelDeltaX,e=c.detail||c.wheelDeltaY,f=parseInt(b.$.val())+(d>0||e>0?1:0>d||0>e?-1:0);b.cH&&b.cH(f)===!1||b.val(f)},h=1,i={37:-1,38:1,39:1,40:-1};this.$.bind("keydown",function(e){var j=e.keyCode;if(j>=96&&105>=j&&(j=e.keyCode=j-48),f=parseInt(String.fromCharCode(j)),isNaN(f)&&(j!==13&&j!==8&&j!==9&&j!==189&&e.preventDefault(),a.inArray(j,[37,38,39,40])>-1)){e.preventDefault();var k=parseInt(b.$.val())+i[j]*h;b.o.stopper&&(k=c(d(k,b.o.max),b.o.min)),b.change(k),b._draw(),g=window.setTimeout(function(){h*=2},30)}}).bind("keyup",function(){isNaN(f)?g&&(window.clearTimeout(g),g=null,h=1,b.val(b.$.val())):b.$.val()>b.o.max&&b.$.val(b.o.max)||b.o.min>b.$.val()&&b.$.val(b.o.min)}),this.$c.bind("mousewheel DOMMouseScroll",e),this.$.bind("mousewheel DOMMouseScroll",e)},this.init=function(){(this.o.min>this.v||this.v>this.o.max)&&(this.v=this.o.min),this.$.val(this.v),this.w2=this.o.width/2,this.cursorExt=this.o.cursor/100,this.xy=this.w2,this.lineWidth=this.xy*this.o.thickness,this.radius=this.xy-this.lineWidth/2,this.o.angleOffset&&(this.o.angleOffset=isNaN(this.o.angleOffset)?0:this.o.angleOffset),this.o.angleArc&&(this.o.angleArc=isNaN(this.o.angleArc)?this.PI2:this.o.angleArc),this.angleOffset=this.o.angleOffset*Math.PI/180,this.angleArc=this.o.angleArc*Math.PI/180,this.startAngle=1.5*Math.PI+this.angleOffset,this.endAngle=1.5*Math.PI+this.angleOffset+this.angleArc;var a=c((Math.abs(this.o.max)+"").length,(Math.abs(this.o.min)+"").length,2)+2;this.o.displayInput&&this.i.css({width:(this.o.width/2+4>>0)+"px",height:(this.o.width/3>>0)+"px",position:"absolute","vertical-align":"middle","margin-top":(this.o.width/3>>0)+"px","margin-left":"-"+(this.o.width*3/4+2>>0)+"px",border:0,background:"none",font:"bold "+(this.o.width/a>>0)+"px Arial","text-align":"center",color:this.o.fgColor,padding:"0px","-webkit-appearance":"none"})||this.i.css({width:"0px",visibility:"hidden"})},this.change=function(a){this.cv=a,this.$.val(a)},this.angle=function(a){return(a-this.o.min)*this.angleArc/(this.o.max-this.o.min)},this.draw=function(){var e,f,a=this.g,b=this.angle(this.cv),c=this.startAngle,d=c+b,g=1;a.lineWidth=this.lineWidth,this.o.cursor&&(c=d-this.cursorExt)&&(d+=this.cursorExt),a.beginPath(),a.strokeStyle=this.o.bgColor,a.arc(this.xy,this.xy,this.radius,this.endAngle,this.startAngle,!0),a.stroke(),this.o.displayPrevious&&(f=this.startAngle+this.angle(this.v),e=this.startAngle,this.o.cursor&&(e=f-this.cursorExt)&&(f+=this.cursorExt),a.beginPath(),a.strokeStyle=this.pColor,a.arc(this.xy,this.xy,this.radius,e,f,!1),a.stroke(),g=this.cv==this.v),a.beginPath(),a.strokeStyle=g?this.o.fgColor:this.fgColor,a.arc(this.xy,this.xy,this.radius,c,d,!1),a.stroke()},this.cancel=function(){this.val(this.v)}},a.fn.dial=a.fn.knob=function(c){return this.each(function(){var d=new b.Dial;d.o=c,d.$=a(this),d.run()}).parent()}})(jQuery)