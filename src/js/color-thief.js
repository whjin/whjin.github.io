"use strict";var ColorThief=(()=>{var B=Object.defineProperty;var It=Object.getOwnPropertyDescriptor;var Tt=Object.getOwnPropertyNames;var Et=Object.prototype.hasOwnProperty;var C=(e,t)=>()=>(e&&(t=e(e=0)),t);var _=(e,t)=>{for(var r in t)B(e,r,{get:t[r],enumerable:!0})},Mt=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of Tt(t))!Et.call(e,o)&&o!==r&&B(e,o,{get:()=>t[o],enumerable:!(n=It(t,o))||n.enumerable});return e};var Lt=e=>Mt(B({},"__esModule",{value:!0}),e);function q(e){let t=e/255;return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function j(e){let t=e<=.0031308?12.92*e:1.055*Math.pow(e,.4166666666666667)-.055;return Math.round(Math.max(0,Math.min(255,t*255)))}function V(e,t,r){let n=q(e),o=q(t),i=q(r),a=.4122214708*n+.5363325363*o+.0514459929*i,s=.2119034982*n+.6806995451*o+.1073969566*i,c=.0883024619*n+.2817188376*o+.6299787005*i,u=Math.cbrt(a),l=Math.cbrt(s),m=Math.cbrt(c),h=.2104542553*u+.793617785*l-.0040720468*m,f=1.9779984951*u-2.428592205*l+.4505937099*m,d=.0259040371*u+.7827717662*l-.808675766*m,v=Math.sqrt(f*f+d*d),y=Math.atan2(d,f)*(180/Math.PI);return y<0&&(y+=360),{l:h,c:v,h:y}}function Ot(e,t,r){let n=r*(Math.PI/180),o=t*Math.cos(n),i=t*Math.sin(n),a=e+.3963377774*o+.2158037573*i,s=e-.1055613458*o-.0638541728*i,c=e-.0894841775*o-1.291485548*i,u=a*a*a,l=s*s*s,m=c*c*c,h=4.0767416621*u-3.3077115913*l+.2309699292*m,f=-1.2684380046*u+2.6097574011*l-.3413193965*m,d=-.0041960863*u-.7034186147*l+1.707614701*m;return[j(h),j(f),j(d)]}function Y(e){let t=new Array(e.length);for(let r=0;r<e.length;r++){let[n,o,i]=e[r],{l:a,c:s,h:c}=V(n,o,i);t[r]=[Math.round(a*255),Math.round(s/.4*255),Math.round(c/360*255)]}return t}function J(e){return e.map(({color:[t,r,n],population:o})=>{let i=t/255,a=r/255*.4,s=n/255*360;return{color:Ot(i,a,s),population:o}})}var W=C(()=>{"use strict"});function kt(e,t,r){let n=e/255,o=t/255,i=r/255,a=Math.max(n,o,i),s=Math.min(n,o,i),c=(a+s)/2,u=0,l=0;if(a!==s){let m=a-s;l=c>.5?m/(2-a-s):m/(a+s),a===n?u=((o-i)/m+(o<i?6:0))/6:a===o?u=((i-n)/m+2)/6:u=((n-o)/m+4)/6}return{h:Math.round(u*360),s:Math.round(l*100),l:Math.round(c*100)}}function Pt(e,t,r){let n=o=>{let i=o/255;return i<=.04045?i/12.92:Math.pow((i+.055)/1.055,2.4)};return .2126*n(e)+.7152*n(t)+.0722*n(r)}function tt(e,t){let r=Math.max(e,t),n=Math.min(e,t);return(r+.05)/(n+.05)}function g(e,t,r,n,o=0){return new z(e,t,r,n,o)}var z,M=C(()=>{"use strict";W();z=class{constructor(t,r,n,o,i){this._r=t,this._g=r,this._b=n,this.population=o,this.proportion=i}rgb(){return{r:this._r,g:this._g,b:this._b}}hex(){let t=r=>r.toString(16).padStart(2,"0");return`#${t(this._r)}${t(this._g)}${t(this._b)}`}hsl(){return this._hsl||(this._hsl=kt(this._r,this._g,this._b)),this._hsl}oklch(){return this._oklch||(this._oklch=V(this._r,this._g,this._b)),this._oklch}css(t="rgb"){switch(t){case"hsl":{let{h:r,s:n,l:o}=this.hsl();return`hsl(${r}, ${n}%, ${o}%)`}case"oklch":{let{l:r,c:n,h:o}=this.oklch();return`oklch(${r.toFixed(3)} ${n.toFixed(3)} ${o.toFixed(1)})`}default:return`rgb(${this._r}, ${this._g}, ${this._b})`}}array(){return[this._r,this._g,this._b]}toString(){return this.hex()}get textColor(){return this.isDark?"#ffffff":"#000000"}get luminance(){return this._luminance===void 0&&(this._luminance=Pt(this._r,this._g,this._b)),this._luminance}get isDark(){return this.luminance<=.179}get isLight(){return!this.isDark}get contrast(){if(!this._contrast){let t=this.luminance,r=tt(t,1),n=tt(t,0),o=this.isDark?g(255,255,255,0,0):g(0,0,0,0,0);this._contrast={white:Math.round(r*100)/100,black:Math.round(n*100)/100,foreground:o}}return this._contrast}}});var rt={};_(rt,{computeFallbackColor:()=>et,createPixelArray:()=>H,extractPalette:()=>w,validateOptions:()=>S});function S(e){let{colorCount:t,quality:r}=e;if(typeof t>"u"||!Number.isInteger(t))t=10;else{if(t===1)throw new Error("colorCount should be between 2 and 20. To get one color, call getColor() instead of getPalette()");t=Math.max(t,2),t=Math.min(t,20)}(typeof r>"u"||!Number.isInteger(r)||r<1)&&(r=10);let n=e.ignoreWhite!==void 0?!!e.ignoreWhite:!0,o=typeof e.whiteThreshold=="number"?e.whiteThreshold:250,i=typeof e.alphaThreshold=="number"?e.alphaThreshold:125,a=typeof e.minSaturation=="number"?Math.max(0,Math.min(1,e.minSaturation)):0,s=e.colorSpace??"oklch";return{colorCount:t,quality:r,ignoreWhite:n,whiteThreshold:o,alphaThreshold:i,minSaturation:a,colorSpace:s}}function H(e,t,r,n){let{ignoreWhite:o=!0,whiteThreshold:i=250,alphaThreshold:a=125,minSaturation:s=0}=n,c=[];for(let u=0;u<t;u+=r){let l=u*4,m=e[l],h=e[l+1],f=e[l+2],d=e[l+3];if(!(d!==void 0&&d<a)&&!(o&&m>i&&h>i&&f>i)){if(s>0){let v=Math.max(m,h,f);if(v===0||(v-Math.min(m,h,f))/v<s)continue}c.push([m,h,f])}}return c}function et(e,t,r){let n=0,o=0,i=0,a=0;for(let s=0;s<t;s+=r){let c=s*4;n+=e[c],o+=e[c+1],i+=e[c+2],a++}return a===0?null:[Math.round(n/a),Math.round(o/a),Math.round(i/a)]}function w(e,t,r,n,o){let i=t*r,a={ignoreWhite:n.ignoreWhite,whiteThreshold:n.whiteThreshold,alphaThreshold:n.alphaThreshold,minSaturation:n.minSaturation},s=H(e,i,n.quality,a);s.length===0&&(s=H(e,i,n.quality,{...a,ignoreWhite:!1})),s.length===0&&(s=H(e,i,n.quality,{...a,ignoreWhite:!1,alphaThreshold:0}));let c;if(n.colorSpace==="oklch"){let l=Y(s);c=J(o.quantize(l,n.colorCount))}else c=o.quantize(s,n.colorCount);if(c.length>0){let l=c.reduce((m,h)=>m+h.population,0);return c.map(({color:[m,h,f],population:d})=>g(m,h,f,d,l>0?d/l:0))}let u=et(e,i,n.quality);return u?[g(u[0],u[1],u[2],1,1)]:null}var L=C(()=>{"use strict";M();W()});var ut={};_(ut,{BrowserPixelLoader:()=>O});var O,$=C(()=>{"use strict";O=class{async load(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement)return this.loadFromImage(t);if(typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement)return this.loadFromCanvas(t);if(typeof ImageData<"u"&&t instanceof ImageData)return{data:t.data,width:t.width,height:t.height};if(typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement)return this.loadFromVideo(t);if(typeof ImageBitmap<"u"&&t instanceof ImageBitmap)return this.loadFromImageBitmap(t);if(typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas)return this.loadFromOffscreenCanvas(t);throw new Error("Unsupported source type. Expected HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, ImageData, ImageBitmap, or OffscreenCanvas.")}loadFromImage(t){if(!t.complete)throw new Error('Image has not finished loading. Wait for the "load" event before calling getColor/getPalette.');if(!t.naturalWidth)throw new Error("Image has no dimensions. It may not have loaded successfully.");let r=document.createElement("canvas"),n=r.getContext("2d"),o=r.width=t.naturalWidth,i=r.height=t.naturalHeight;n.drawImage(t,0,0,o,i);try{return{data:n.getImageData(0,0,o,i).data,width:o,height:i}}catch(a){if(a instanceof DOMException&&a.name==="SecurityError"){let s=new Error('Image is tainted by cross-origin data. Add crossorigin="anonymous" to the <img> tag and ensure the server sends appropriate CORS headers.');throw s.cause=a,s}throw a}}loadFromCanvas(t){let r=t.getContext("2d"),{width:n,height:o}=t;return{data:r.getImageData(0,0,n,o).data,width:n,height:o}}loadFromVideo(t){if(t.readyState<2)throw new Error('Video is not ready. Wait for the "loadeddata" or "canplay" event before calling getColor/getPalette.');let r=t.videoWidth,n=t.videoHeight;if(!r||!n)throw new Error("Video has no dimensions. It may not have loaded successfully.");let o=document.createElement("canvas"),i=o.getContext("2d");return o.width=r,o.height=n,i.drawImage(t,0,0,r,n),{data:i.getImageData(0,0,r,n).data,width:r,height:n}}loadFromOffscreenCanvas(t){let r=t.getContext("2d");if(!r)throw new Error("Could not get 2D context from OffscreenCanvas.");let{width:n,height:o}=t;return{data:r.getImageData(0,0,n,o).data,width:n,height:o}}loadFromImageBitmap(t){let r=document.createElement("canvas"),n=r.getContext("2d");return r.width=t.width,r.height=t.height,n.drawImage(t,0,0),{data:n.getImageData(0,0,t.width,t.height).data,width:t.width,height:t.height}}}});var mt,ht=C(()=>{"use strict";mt=`
'use strict';

// -------------------------------------------------------------------------
// Inlined MMCQ (Modified Median Cut Quantization)
// -------------------------------------------------------------------------

var SIGBITS = 5;
var RSHIFT = 3;
var MAX_ITER = 1000;
var FRACT_POP = 0.75;
var HISTO_SIZE = 32768;

function colorIndex(r, g, b) {
    return (r << 10) + (g << 5) + b;
}

function getHisto(pixels) {
    var h = new Uint32Array(HISTO_SIZE);
    for (var i = 0; i < pixels.length; i++) {
        var p = pixels[i];
        h[colorIndex(p[0] >> RSHIFT, p[1] >> RSHIFT, p[2] >> RSHIFT)]++;
    }
    return h;
}

function VBox(r1, r2, g1, g2, b1, b2, histo) {
    this.r1 = r1; this.r2 = r2;
    this.g1 = g1; this.g2 = g2;
    this.b1 = b1; this.b2 = b2;
    this.histo = histo;
    this._count = -1;
    this._volume = -1;
    this._avg = null;
}

VBox.prototype.volume = function(force) {
    if (this._volume < 0 || force) {
        this._volume = (this.r2 - this.r1 + 1) * (this.g2 - this.g1 + 1) * (this.b2 - this.b1 + 1);
    }
    return this._volume;
};

VBox.prototype.count = function(force) {
    if (this._count < 0 || force) {
        var n = 0;
        for (var i = this.r1; i <= this.r2; i++)
            for (var j = this.g1; j <= this.g2; j++)
                for (var k = this.b1; k <= this.b2; k++)
                    n += this.histo[colorIndex(i, j, k)] || 0;
        this._count = n;
    }
    return this._count;
};

VBox.prototype.copy = function() {
    return new VBox(this.r1, this.r2, this.g1, this.g2, this.b1, this.b2, this.histo);
};

VBox.prototype.avg = function(force) {
    if (!this._avg || force) {
        var mult = 1 << RSHIFT;
        if (this.r1 === this.r2 && this.g1 === this.g2 && this.b1 === this.b2) {
            this._avg = [this.r1 << RSHIFT, this.g1 << RSHIFT, this.b1 << RSHIFT];
        } else {
            var ntot = 0, rsum = 0, gsum = 0, bsum = 0;
            for (var i = this.r1; i <= this.r2; i++)
                for (var j = this.g1; j <= this.g2; j++)
                    for (var k = this.b1; k <= this.b2; k++) {
                        var hval = this.histo[colorIndex(i, j, k)] || 0;
                        ntot += hval;
                        rsum += hval * (i + 0.5) * mult;
                        gsum += hval * (j + 0.5) * mult;
                        bsum += hval * (k + 0.5) * mult;
                    }
            this._avg = ntot
                ? [~~(rsum / ntot), ~~(gsum / ntot), ~~(bsum / ntot)]
                : [~~(mult * (this.r1 + this.r2 + 1) / 2), ~~(mult * (this.g1 + this.g2 + 1) / 2), ~~(mult * (this.b1 + this.b2 + 1) / 2)];
        }
    }
    return this._avg;
};

function PQueue(comparator) {
    this.contents = [];
    this.sorted = false;
    this.comparator = comparator;
}

PQueue.prototype.push = function(item) { this.contents.push(item); this.sorted = false; };
PQueue.prototype.pop = function() {
    if (!this.sorted) { this.contents.sort(this.comparator); this.sorted = true; }
    return this.contents.pop();
};
PQueue.prototype.size = function() { return this.contents.length; };

function vboxFromPixels(pixels, histo) {
    var rmin = 1e6, rmax = 0, gmin = 1e6, gmax = 0, bmin = 1e6, bmax = 0;
    for (var i = 0; i < pixels.length; i++) {
        var p = pixels[i];
        var rv = p[0] >> RSHIFT, gv = p[1] >> RSHIFT, bv = p[2] >> RSHIFT;
        if (rv < rmin) rmin = rv; if (rv > rmax) rmax = rv;
        if (gv < gmin) gmin = gv; if (gv > gmax) gmax = gv;
        if (bv < bmin) bmin = bv; if (bv > bmax) bmax = bv;
    }
    return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, histo);
}

function medianCutApply(histo, vbox) {
    if (!vbox.count()) return undefined;
    if (vbox.count() === 1) return [vbox.copy(), null];

    var rw = vbox.r2 - vbox.r1 + 1;
    var gw = vbox.g2 - vbox.g1 + 1;
    var bw = vbox.b2 - vbox.b1 + 1;
    var maxw = Math.max(rw, gw, bw);
    var total = 0;
    var partialsum = [];
    var lookaheadsum = [];
    var i, j, k, sum;

    if (maxw === rw) {
        for (i = vbox.r1; i <= vbox.r2; i++) {
            sum = 0;
            for (j = vbox.g1; j <= vbox.g2; j++)
                for (k = vbox.b1; k <= vbox.b2; k++)
                    sum += histo[colorIndex(i, j, k)] || 0;
            total += sum; partialsum[i] = total;
        }
    } else if (maxw === gw) {
        for (i = vbox.g1; i <= vbox.g2; i++) {
            sum = 0;
            for (j = vbox.r1; j <= vbox.r2; j++)
                for (k = vbox.b1; k <= vbox.b2; k++)
                    sum += histo[colorIndex(j, i, k)] || 0;
            total += sum; partialsum[i] = total;
        }
    } else {
        for (i = vbox.b1; i <= vbox.b2; i++) {
            sum = 0;
            for (j = vbox.r1; j <= vbox.r2; j++)
                for (k = vbox.g1; k <= vbox.g2; k++)
                    sum += histo[colorIndex(j, k, i)] || 0;
            total += sum; partialsum[i] = total;
        }
    }

    partialsum.forEach(function(d, idx) { lookaheadsum[idx] = total - d; });

    function doCut(color) {
        var dim1 = color + '1', dim2 = color + '2';
        for (var i = vbox[dim1]; i <= vbox[dim2]; i++) {
            if (partialsum[i] > total / 2) {
                var vbox1 = vbox.copy(), vbox2 = vbox.copy();
                var left = i - vbox[dim1], right = vbox[dim2] - i;
                var d2 = left <= right
                    ? Math.min(vbox[dim2] - 1, ~~(i + right / 2))
                    : Math.max(vbox[dim1], ~~(i - 1 - left / 2));
                while (!partialsum[d2]) d2++;
                var count2 = lookaheadsum[d2];
                while (!count2 && partialsum[d2 - 1]) count2 = lookaheadsum[--d2];
                vbox1[dim2] = d2;
                vbox2[dim1] = d2 + 1;
                return [vbox1, vbox2];
            }
        }
    }

    if (maxw === rw) return doCut('r');
    if (maxw === gw) return doCut('g');
    return doCut('b');
}

function iterate(pq, target, histo) {
    var ncolors = pq.size(), niters = 0;
    while (niters < MAX_ITER) {
        if (ncolors >= target) return;
        niters++;
        var vbox = pq.pop();
        if (!vbox.count()) { pq.push(vbox); continue; }
        var result = medianCutApply(histo, vbox);
        if (!result || !result[0]) return;
        pq.push(result[0]);
        if (result[1]) { pq.push(result[1]); ncolors++; }
    }
}

function quantize(pixels, maxColors) {
    if (!pixels.length || maxColors < 2 || maxColors > 256) return [];

    var histo = getHisto(pixels);
    var vbox = vboxFromPixels(pixels, histo);
    var pq = new PQueue(function(a, b) { return a.count() - b.count(); });
    pq.push(vbox);
    iterate(pq, FRACT_POP * maxColors, histo);

    var pq2 = new PQueue(function(a, b) { return a.count() * a.volume() - b.count() * b.volume(); });
    while (pq.size()) pq2.push(pq.pop());
    iterate(pq2, maxColors, histo);

    var results = [];
    while (pq2.size()) {
        var box = pq2.pop();
        results.push({ color: box.avg(), population: box.count() });
    }
    return results;
}

// -------------------------------------------------------------------------
// Worker message handler
// -------------------------------------------------------------------------

self.onmessage = function (e) {
    var data = e.data;
    var id = data.id;
    try {
        var palette = quantize(data.pixels, data.maxColors);
        self.postMessage({ id: id, palette: palette });
    } catch (err) {
        self.postMessage({ id: id, error: err.message || 'Unknown worker error' });
    }
};
`});var dt={};_(dt,{extractInWorker:()=>Wt,isWorkerSupported:()=>ft,terminateWorker:()=>zt});function ft(){return typeof Worker<"u"}function Vt(){if(p)return p;if(!ft())throw new Error("Web Workers are not supported in this environment.");return k=URL.createObjectURL(new Blob([mt],{type:"application/javascript"})),p=new Worker(k),p.onmessage=e=>{let{id:t,palette:r,error:n}=e.data,o=b.get(t);if(o)if(b.delete(t),n)o.reject(new Error(n));else{let i=r,a=i.reduce((c,u)=>c+u.population,0),s=i.map(({color:[c,u,l],population:m})=>g(c,u,l,m,a>0?m/a:0));o.resolve(s)}},p.onerror=e=>{for(let[,t]of b)t.reject(new Error(e.message));b.clear()},p}function Wt(e,t,r){return new Promise((n,o)=>{if(r?.aborted){o(r.reason??new DOMException("Aborted","AbortError"));return}let i=jt++;b.set(i,{resolve:n,reject:o});let a=()=>{b.delete(i),o(r.reason??new DOMException("Aborted","AbortError"))};r?.addEventListener("abort",a,{once:!0});try{Vt().postMessage({id:i,pixels:e,maxColors:t})}catch(s){b.delete(i),r?.removeEventListener("abort",a),o(s)}})}function zt(){p&&(p.terminate(),p=null),k&&(URL.revokeObjectURL(k),k=null);for(let[,e]of b)e.reject(new Error("Worker terminated"));b.clear()}var p,k,jt,b,gt=C(()=>{"use strict";M();ht();p=null,k=null,jt=0,b=new Map});var Yt={};_(Yt,{configure:()=>pt,createColor:()=>g,getColor:()=>vt,getColorSync:()=>yt,getPalette:()=>R,getPaletteProgressive:()=>wt,getPaletteSync:()=>E,getSwatches:()=>xt,getSwatchesSync:()=>Ct,observe:()=>St});L();L();var Q=[{divisor:16,progress:.06},{divisor:4,progress:.25},{divisor:1,progress:1}];function _t(){return new Promise(e=>setTimeout(e,0))}async function*nt(e,t,r,n,o,i){for(let a=0;a<Q.length;a++){if(i?.aborted)throw i.reason??new DOMException("Aborted","AbortError");let s=Q[a],c={...n,quality:n.quality*s.divisor},u=w(e,t,r,c,o),l=a===Q.length-1;yield{palette:u??[],progress:s.progress,done:l},l||await _t()}}M();var U=[{role:"Vibrant",targetL:.65,minL:.4,maxL:.85,targetC:.2,minC:.08},{role:"Muted",targetL:.65,minL:.4,maxL:.85,targetC:.04,minC:0},{role:"DarkVibrant",targetL:.3,minL:0,maxL:.45,targetC:.2,minC:.08},{role:"DarkMuted",targetL:.3,minL:0,maxL:.45,targetC:.04,minC:0},{role:"LightVibrant",targetL:.85,minL:.7,maxL:1,targetC:.2,minC:.08},{role:"LightMuted",targetL:.85,minL:.7,maxL:1,targetC:.04,minC:0}],Ht=6,At=3,Dt=1;function ot(e,t,r){let{l:n,c:o}=e.oklch();if(n<t.minL||n>t.maxL||o<t.minC)return-1/0;let i=1-Math.abs(n-t.targetL),a=1-Math.min(Math.abs(o-t.targetC)/.2,1),s=r>0?e.population/r:0;return i*Ht+a*At+s*Dt}var it=g(255,255,255,0),at=g(0,0,0,0);function st(e){return{title:e.isDark?it:at,body:e.isDark?it:at}}function A(e){let t=Math.max(...e.map(i=>i.population),1),r=[];for(let i of U){let a=null,s=-1/0;for(let c of e){let u=ot(c,i,t);u>s&&(s=u,a=c)}a&&s>-1/0&&r.push({role:i.role,color:a,score:s})}let n=new Set,o={};r.sort((i,a)=>a.score-i.score);for(let i of r)if(n.has(i.color)){let a=U.find(u=>u.role===i.role),s=null,c=-1/0;for(let u of e){if(n.has(u))continue;let l=ot(u,a,t);l>c&&(c=l,s=u)}if(s&&c>-1/0){n.add(s);let{title:u,body:l}=st(s);o[i.role]={color:s,role:i.role,titleTextColor:u,bodyTextColor:l}}else o[i.role]=null}else{n.add(i.color);let{title:a,body:s}=st(i.color);o[i.role]={color:i.color,role:i.role,titleTextColor:a,bodyTextColor:s}}for(let i of U)i.role in o||(o[i.role]=null);return o}function I(e,t,r){return(e<<10)+(t<<5)+r}var G=class e{constructor(t,r,n,o,i,a,s){this.r1=t,this.r2=r,this.g1=n,this.g2=o,this.b1=i,this.b2=a,this.histo=s}volume(t=!1){return(this._volume===void 0||t)&&(this._volume=(this.r2-this.r1+1)*(this.g2-this.g1+1)*(this.b2-this.b1+1)),this._volume}count(t=!1){if(this._count===void 0||t){let r=0;for(let n=this.r1;n<=this.r2;n++)for(let o=this.g1;o<=this.g2;o++)for(let i=this.b1;i<=this.b2;i++)r+=this.histo[I(n,o,i)]||0;this._count=r}return this._count}copy(){return new e(this.r1,this.r2,this.g1,this.g2,this.b1,this.b2,this.histo)}avg(t=!1){if(this._avg===void 0||t)if(this.r1===this.r2&&this.g1===this.g2&&this.b1===this.b2)this._avg=[this.r1<<3,this.g1<<3,this.b1<<3];else{let n=0,o=0,i=0,a=0;for(let s=this.r1;s<=this.r2;s++)for(let c=this.g1;c<=this.g2;c++)for(let u=this.b1;u<=this.b2;u++){let l=this.histo[I(s,c,u)]||0;n+=l,o+=l*(s+.5)*8,i+=l*(c+.5)*8,a+=l*(u+.5)*8}n?this._avg=[~~(o/n),~~(i/n),~~(a/n)]:this._avg=[~~(8*(this.r1+this.r2+1)/2),~~(8*(this.g1+this.g2+1)/2),~~(8*(this.b1+this.b2+1)/2)]}return this._avg}},D=class{constructor(t){this.comparator=t;this.contents=[];this.sorted=!1}sort(){this.contents.sort(this.comparator),this.sorted=!0}push(t){this.contents.push(t),this.sorted=!1}peek(t){return this.sorted||this.sort(),this.contents[t??this.contents.length-1]}pop(){return this.sorted||this.sort(),this.contents.pop()}size(){return this.contents.length}map(t){return this.contents.map(t)}};function Ft(e){let t=new Uint32Array(32768);for(let r of e){let n=r[0]>>3,o=r[1]>>3,i=r[2]>>3;t[I(n,o,i)]++}return t}function Rt(e,t){let r=1e6,n=0,o=1e6,i=0,a=1e6,s=0;for(let c of e){let u=c[0]>>3,l=c[1]>>3,m=c[2]>>3;u<r?r=u:u>n&&(n=u),l<o?o=l:l>i&&(i=l),m<a?a=m:m>s&&(s=m)}return new G(r,n,o,i,a,s,t)}function Bt(e,t){if(!t.count())return;if(t.count()===1)return[t.copy(),null];let r=t.r2-t.r1+1,n=t.g2-t.g1+1,o=t.b2-t.b1+1,i=Math.max(r,n,o),a=0,s=[],c=[];if(i===r)for(let l=t.r1;l<=t.r2;l++){let m=0;for(let h=t.g1;h<=t.g2;h++)for(let f=t.b1;f<=t.b2;f++)m+=e[I(l,h,f)]||0;a+=m,s[l]=a}else if(i===n)for(let l=t.g1;l<=t.g2;l++){let m=0;for(let h=t.r1;h<=t.r2;h++)for(let f=t.b1;f<=t.b2;f++)m+=e[I(h,l,f)]||0;a+=m,s[l]=a}else for(let l=t.b1;l<=t.b2;l++){let m=0;for(let h=t.r1;h<=t.r2;h++)for(let f=t.g1;f<=t.g2;f++)m+=e[I(h,f,l)]||0;a+=m,s[l]=a}s.forEach((l,m)=>{c[m]=a-l});function u(l){let m=l+"1",h=l+"2";for(let f=t[m];f<=t[h];f++)if(s[f]>a/2){let d=t.copy(),v=t.copy(),y=f-t[m],X=t[h]-f,x;for(y<=X?x=Math.min(t[h]-1,~~(f+X/2)):x=Math.max(t[m],~~(f-1-y/2));!s[x];)x++;let Z=c[x];for(;!Z&&s[x-1];)Z=c[--x];return d[h]=x,v[m]=d[h]+1,[d,v]}}return u(i===r?"r":i===n?"g":"b")}function lt(e,t,r){let n=e.size(),o=0;for(;o<1e3;){if(n>=t)return;o++;let i=e.pop();if(!i.count()){e.push(i);continue}let a=Bt(r,i);if(!a||!a[0])return;e.push(a[0]),a[1]&&(e.push(a[1]),n++)}}function qt(e,t){if(!e.length||t<2||t>256)return[];let r=new Set,n=[];for(let u of e){let l=u.join(",");r.has(l)||(r.add(l),n.push(u))}if(n.length<=t){let u=new Map;for(let l of e){let m=l.join(",");u.set(m,(u.get(m)||0)+1)}return n.map(l=>({color:l,population:u.get(l.join(","))}))}let o=Ft(e),i=Rt(e,o),a=new D((u,l)=>u.count()-l.count());a.push(i),lt(a,.75*t,o);let s=new D((u,l)=>u.count()*u.volume()-l.count()*l.volume());for(;a.size();)s.push(a.pop());lt(s,t,o);let c=[];for(;s.size();){let u=s.pop();c.push({color:u.avg(),population:u.count()})}return c}var T=class{async init(){}quantize(t,r){return qt(t,r)}};async function ct(){let{BrowserPixelLoader:e}=await Promise.resolve().then(()=>($(),ut));return new e}var P=null,F=null;function pt(e){e.loader&&(P=e.loader),e.quantizer&&(F=e.quantizer)}async function Qt(e){return e||P||(P=await ct(),P)}async function bt(e){if(e)return await e.init(),e;if(F)return F;let t=new T;return await t.init(),F=t,t}function K(e){if(e?.aborted)throw e.reason??new DOMException("Aborted","AbortError")}async function N(e,t){return K(t?.signal),(await Qt(t?.loader)).load(e,t?.signal)}async function vt(e,t){let r=await R(e,{colorCount:5,...t});return r?r[0]:null}async function R(e,t){let r=S(t??{});if(K(t?.signal),t?.worker){let{isWorkerSupported:i,extractInWorker:a}=await Promise.resolve().then(()=>(gt(),dt));if(i()){let{data:s,width:c,height:u}=await N(e,t),{createPixelArray:l}=await Promise.resolve().then(()=>(L(),rt)),m=l(s,c*u,r.quality,{ignoreWhite:r.ignoreWhite,whiteThreshold:r.whiteThreshold,alphaThreshold:r.alphaThreshold,minSaturation:r.minSaturation});return a(m,r.colorCount,t?.signal)}}let[n,o]=await Promise.all([N(e,t),bt(t?.quantizer)]);return K(t?.signal),w(n.data,n.width,n.height,r,o)}async function xt(e,t){let r=await R(e,{colorCount:16,...t});return A(r??[])}async function*wt(e,t){let r=S(t??{}),[n,o]=await Promise.all([N(e,t),bt(t?.quantizer)]);yield*nt(n.data,n.width,n.height,r,o,t?.signal)}$();L();var Ie=new O,Ut=new T;function yt(e,t){let r=E(e,{colorCount:5,...t});return r?r[0]:null}function E(e,t){let r=S(t??{}),n=t?.quantizer??Ut,o=Gt(e);return w(o.data,o.width,o.height,r,n)}function Ct(e,t){let r=E(e,{colorCount:16,...t});return A(r??[])}function Gt(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement)return $t(e);if(typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement)return Kt(e);if(typeof ImageData<"u"&&e instanceof ImageData)return{data:e.data,width:e.width,height:e.height};if(typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement)return Nt(e);if(typeof ImageBitmap<"u"&&e instanceof ImageBitmap)return Zt(e);if(typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)return Xt(e);throw new Error("Unsupported source type. Expected HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, ImageData, ImageBitmap, or OffscreenCanvas.")}function $t(e){if(!e.complete)throw new Error('Image has not finished loading. Wait for the "load" event before calling getColorSync/getPaletteSync.');if(!e.naturalWidth)throw new Error("Image has no dimensions. It may not have loaded successfully.");let t=document.createElement("canvas"),r=t.getContext("2d"),n=t.width=e.naturalWidth,o=t.height=e.naturalHeight;r.drawImage(e,0,0,n,o);try{return{data:r.getImageData(0,0,n,o).data,width:n,height:o}}catch(i){if(i instanceof DOMException&&i.name==="SecurityError"){let a=new Error('Image is tainted by cross-origin data. Add crossorigin="anonymous" to the <img> tag and ensure the server sends appropriate CORS headers.');throw a.cause=i,a}throw i}}function Kt(e){let t=e.getContext("2d"),{width:r,height:n}=e;return{data:t.getImageData(0,0,r,n).data,width:r,height:n}}function Nt(e){if(e.readyState<2)throw new Error('Video is not ready. Wait for the "loadeddata" or "canplay" event before calling getColorSync/getPaletteSync.');let t=e.videoWidth,r=e.videoHeight;if(!t||!r)throw new Error("Video has no dimensions. It may not have loaded successfully.");let n=document.createElement("canvas"),o=n.getContext("2d");return n.width=t,n.height=r,o.drawImage(e,0,0,t,r),{data:o.getImageData(0,0,t,r).data,width:t,height:r}}function Xt(e){let t=e.getContext("2d");if(!t)throw new Error("Could not get 2D context from OffscreenCanvas.");let{width:r,height:n}=e;return{data:t.getImageData(0,0,r,n).data,width:r,height:n}}function Zt(e){let t=document.createElement("canvas"),r=t.getContext("2d");return t.width=e.width,t.height=e.height,r.drawImage(e,0,0),{data:r.getImageData(0,0,e.width,e.height).data,width:e.width,height:e.height}}function St(e,t){let{throttle:r=200,onChange:n,...o}=t,i=!1,a=null,s=null,c=0,u=[];function l(){try{let h=E(e,o);h&&h.length>0&&n(h)}catch{}}function m(){if(i)return;let h=performance.now();h-c>=r&&(e instanceof HTMLVideoElement?e.readyState>=2&&!e.paused&&!e.ended&&(l(),c=h):(l(),c=h)),a=requestAnimationFrame(m)}if(e instanceof HTMLImageElement){if(e.complete&&e.naturalWidth)l();else{let h=()=>{l(),e.removeEventListener("load",h)};e.addEventListener("load",h),u.push(()=>e.removeEventListener("load",h))}s=new MutationObserver(()=>{if(e.complete&&e.naturalWidth)l();else{let h=()=>{l(),e.removeEventListener("load",h)};e.addEventListener("load",h)}}),s.observe(e,{attributes:!0,attributeFilter:["src","srcset"]})}else if(e instanceof HTMLVideoElement){a=requestAnimationFrame(m);let h=()=>{i||l()};e.addEventListener("seeked",h),u.push(()=>e.removeEventListener("seeked",h))}else a=requestAnimationFrame(m);return{stop(){i=!0,a!==null&&(cancelAnimationFrame(a),a=null),s&&(s.disconnect(),s=null);for(let h of u)h();u.length=0}}}M();return Lt(Yt);})();
//# sourceMappingURL=color-thief.global.js.map