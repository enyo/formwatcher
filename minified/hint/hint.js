// Generated by CoffeeScript 1.3.1
((function(){var a,b={}.hasOwnProperty,c=function(a,c){function e(){this.constructor=a}for(var d in c)b.call(c,d)&&(a[d]=c[d]);return e.prototype=c.prototype,a.prototype=new 
e,a.__super__=c.prototype,a};a=ender,Formwatcher.decorators.push(function(b){function d(){return d.__super__.constructor.apply(this,arguments)}return c(d,b),d.prototype.name="Hint",d.prototype.description="Displays a hint in an input field."
,d.prototype.nodeNames=["INPUT","TEXTAREA"],d.prototype.defaultOptions={auto:!0,removeTrailingColon:!0,color:"#aaa"},d.prototype.decParseInt=function(a){return parseInt(a,10)},d.prototype.accepts=function(
a){if(d.__super__.accepts.call(this,a))if(a.data("hint")!=null||this.options.auto&&Formwatcher.getLabel({input:a},this.watcher.options.automatchLabel))return!0;return!1},d.prototype.decorate=function(b
){var c,d,e,f,g,h,i,j,k,l,m,n,o=this;e={input:b},g=b.data("hint");if(g==null||!g){j=Formwatcher.getLabel(e,this.watcher.options.automatchLabel);if(!j)throw"The hint was empty, but there was no label.";
e.label=j,j.hide(),g=j.html(),this.options.removeTrailingColon&&(g=g.replace(/\s*\:\s*$/,""))}return Formwatcher.debug("Using hint: "+g),n=a.create('<span style="display: inline-block; position: relative;" />'
),n.insertAfter(b),n.append(b),i={left:b[0].offsetLeft,top:b[0].offsetTop,width:b[0].offsetWidth,height:b[0].offsetHeight},k=this.decParseInt(b.css("paddingLeft"))+this.decParseInt(i.left)+this.decParseInt
(b.css("borderLeftWidth"))+2+"px",m=this.decParseInt(b.css("paddingTop"))+this.decParseInt(i.top)+this.decParseInt(b.css("borderTopWidth"))+"px",h=a.create("<span />").html(g).css({position:"absolute",
display:"none",top:m,left:k,fontSize:b.css("fontSize"),lineHeight:b.css("lineHeight"),fontFamily:b.css("fontFamily"),color:this.options.color}).addClass("hint").on("click",function(){return b[0].focus(
)}).insertAfter(b),f=100,b.focusin(function(){if(b.val()==="")return h.animate({opacity:.4,duration:f})}),b.focusout(function(){if(b.val()==="")return h.animate({opacity:1,duration:f})}),c=function(){return b
.val()===""?h.show():h.hide()},b.keyup(c),b.keypress(function(){return setTimeout(function(){return c()},1)}),b.keydown(function(){return setTimeout(function(){return c()},1)}),b.change(c),l=10,d=function(
){return c(),setTimeout(function(){return d()},l),l*=2,l=l>1e4?1e4:l},d(),e},d}(Formwatcher.Decorator))})).call(this);