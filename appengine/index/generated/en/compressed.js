// Automatically generated file.  Do not edit!
var f=this;function g(a){var b=k;function c(){}c.prototype=b.prototype;a.D=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.u=function(a,c,h){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];return b.prototype[c].apply(a,d)}};var n=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function p(a,b){return a<b?-1:a>b?1:0};var q=Array.prototype.indexOf?function(a,b,c){return Array.prototype.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if("string"==typeof a)return"string"==typeof b&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1};function aa(a,b,c){return 2>=arguments.length?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)};var r;a:{var t=f.navigator;if(t){var u=t.userAgent;if(u){r=u;break a}}r=""};var v={B:!0};function k(){throw Error("Do not instantiate directly");}k.prototype.g=null;k.prototype.toString=function(){return this.content};function ba(a,b){var c=ca;Object.prototype.hasOwnProperty.call(c,a)||(c[a]=b(a))};var da=-1!=r.indexOf("Opera"),w=-1!=r.indexOf("Trident")||-1!=r.indexOf("MSIE"),ea=-1!=r.indexOf("Edge"),x=-1!=r.indexOf("Gecko")&&!(-1!=r.toLowerCase().indexOf("webkit")&&-1==r.indexOf("Edge"))&&!(-1!=r.indexOf("Trident")||-1!=r.indexOf("MSIE"))&&-1==r.indexOf("Edge"),fa=-1!=r.toLowerCase().indexOf("webkit")&&-1==r.indexOf("Edge");function y(){var a=f.document;return a?a.documentMode:void 0}var z;
a:{var A="",B=function(){var a=r;if(x)return/rv\:([^\);]+)(\)|;)/.exec(a);if(ea)return/Edge\/([\d\.]+)/.exec(a);if(w)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(fa)return/WebKit\/(\S+)/.exec(a);if(da)return/(?:Version)[ \/]?(\S+)/.exec(a)}();B&&(A=B?B[1]:"");if(w){var C=y();if(null!=C&&C>parseFloat(A)){z=String(C);break a}}z=A}var ca={};
function D(a){ba(a,function(){for(var b=0,c=n(String(z)).split("."),d=n(String(a)).split("."),e=Math.max(c.length,d.length),h=0;0==b&&h<e;h++){var l=c[h]||"",m=d[h]||"";do{l=/(\d*)(\D*)(.*)/.exec(l)||["","","",""];m=/(\d*)(\D*)(.*)/.exec(m)||["","","",""];if(0==l[0].length&&0==m[0].length)break;b=p(0==l[1].length?0:parseInt(l[1],10),0==m[1].length?0:parseInt(m[1],10))||p(0==l[2].length,0==m[2].length)||p(l[2],m[2]);l=l[3];m=m[3]}while(0==b)}return 0<=b})}var E;var F=f.document;
E=F&&w?y()||("CSS1Compat"==F.compatMode?parseInt(z,10):5):void 0;var G;if(!(G=!x&&!w)){var H;if(H=w)H=9<=Number(E);G=H}G||x&&D("1.9.1");w&&D("9");w&&D(8);function ga(a){if(null!=a)switch(a.g){case 1:return 1;case -1:return-1;case 0:return 0}return null}function I(){k.call(this)}g(I);I.prototype.i=v;function J(a){return null!=a&&a.i===v?a:ha(String(String(a)).replace(ia,ja),ga(a))}function K(){k.call(this)}g(K);K.prototype.i={A:!0};K.prototype.g=1;function L(){k.call(this)}g(L);L.prototype.i={}.o;function M(){k.call(this)}g(M);M.prototype.i={C:!0};M.prototype.g=1;function N(){k.call(this)}g(N);N.prototype.i={w:!0};N.prototype.g=1;
function O(){k.call(this)}g(O);O.prototype.i={v:!0};O.prototype.g=1;function P(a){function b(){}b.prototype=a.prototype;return function(a,d){var c=new b;c.content=String(a);void 0!==d&&(c.g=d);return c}}var ha=P(I);P(L);(function(a){function b(){}b.prototype=a.prototype;return function(a,d){if(!String(a))return"";var c=new b;c.content=String(a);void 0!==d&&(c.g=d);return c}})(I);
var ka={"\x00":"&#0;",'"':"&quot;","&":"&amp;","'":"&#39;","<":"&lt;",">":"&gt;","\t":"&#9;","\n":"&#10;","\x0B":"&#11;","\f":"&#12;","\r":"&#13;"," ":"&#32;","-":"&#45;","/":"&#47;","=":"&#61;","`":"&#96;","\u0085":"&#133;","\u00a0":"&#160;","\u2028":"&#8232;","\u2029":"&#8233;"};function ja(a){return ka[a]}var ia=/[\x00\x22\x26\x27\x3c\x3e]/g;function la(){var a={lang:Q,j:R,m:-1!=S.indexOf(Q)};return'<div style="display: none"><span id="title">Blockly Games</span><span id="Index_clear">Delete all your solutions?</span></div><div id="header"><img id="banner" src="index/title-beta.png" height="51" width="244" alt="Blockly Games"><div id="subtitle">Games for tomorrow\'s programmers. &nbsp;'+(a.j?'<a href="about.html?lang='+J(a.lang)+'">':'<a href="about?lang='+J(a.lang)+'">')+'More info...</a></div></div><svg height="100%" width="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g transform="translate(-80,-60)"><svg height="100%" width="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="none" x=80 y=60><path id="path" d="M 10,15 C 15,60 35,100 50,70 S 80,20 90,85"'+
(a.m?'transform="translate(100) scale(-1, 1)"':"")+"/></svg>"+T({app:"puzzle",x:10,y:15,h:"Puzzle"},a)+T({app:"maze",x:16,y:47,h:"Maze"},a)+T({app:"bird",x:29,y:75,h:"Bird"},a)+T({app:"turtle",x:49,y:72,h:"Turtle"},a)+T({app:"movie",x:64,y:48,h:"Movie"},a)+T({app:"pond-tutor",x:83,y:53,h:"Pond Tutor"},a)+T({app:"pond-duck",x:90,y:85,h:"Pond"},a)+'</g></svg><select id="languageMenu"></select><p id="clearDataPara" style="visibility: hidden">Want to start over?<button class="secondary" id="clearData">Clear data</span></button></p>'}
function T(a,b){return'<svg height="150" width="160" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'+(b.m?'x="'+J(100-a.x)+'%"':'x="'+J(a.x)+'%"')+'y="'+J(a.y)+'%"><path d="M 41.11,98.89 A 55 55 0 1 1 118.89,98.89" class="gaugeBack" id="back-'+J(a.app)+'" /><g class="icon" id="icon-'+J(a.app)+'"><circle cx=80 cy=60 r=50 class="iconBack" /><image xlink:href="index/'+J(a.app)+'.png" height="100" width="100" x=30 y=10 />'+(b.j?'<a id="link-'+J(a.app)+'" xlink:href="'+
J(a.app)+".html?lang="+J(b.lang)+'">':'<a xlink:href="'+J(a.app)+"?lang="+J(b.lang)+'">')+'<circle cx=80 cy=60 r=50 class="iconBorder" /><path d="M 21.11,98.89 A 55 55 0 1 1 21.11,98.89" class="gaugeFront" id="gauge-'+J(a.app)+'" /><text x="80" y="135">'+J(a.h)+"</text></a></g></svg>"};function ma(a,b){var c;c=a.className;for(var d=c="string"==typeof c&&c.match(/\S+/g)||[],e=aa(arguments,1),h=0;h<e.length;h++)0<=q(d,e[h])||d.push(e[h]);c=c.join(" ");a.className=c};var na={},oa={ace:"\u0628\u0647\u0633\u0627 \u0627\u0686\u064a\u0647",af:"Afrikaans",ar:"\u0627\u0644\u0639\u0631\u0628\u064a\u0629",az:"Az\u0259rbaycanca","be-tarask":"Tara\u0161kievica",bg:"\u0431\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438 \u0435\u0437\u0438\u043a",br:"Brezhoneg",ca:"Catal\u00e0",cdo:"\u95a9\u6771\u8a9e",cs:"\u010cesky",da:"Dansk",de:"Deutsch",el:"\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac",en:"English",es:"Espa\u00f1ol",eu:"Euskara",fa:"\u0641\u0627\u0631\u0633\u06cc",
fi:"Suomi",fo:"F\u00f8royskt",fr:"Fran\u00e7ais",frr:"Frasch",gl:"Galego",hak:"\u5ba2\u5bb6\u8a71",he:"\u05e2\u05d1\u05e8\u05d9\u05ea",hi:"\u0939\u093f\u0928\u094d\u0926\u0940",hrx:"Hunsrik",hu:"Magyar",ia:"Interlingua",id:"Bahasa Indonesia",is:"\u00cdslenska",it:"Italiano",ja:"\u65e5\u672c\u8a9e",ka:"\u10e5\u10d0\u10e0\u10d7\u10e3\u10da\u10d8",km:"\u1797\u17b6\u179f\u17b6\u1781\u17d2\u1798\u17c2\u179a",ko:"\ud55c\uad6d\uc5b4",ksh:"Ripoar\u0117sch",ky:"\u041a\u044b\u0440\u0433\u044b\u0437\u0447\u0430",
la:"Latine",lb:"L\u00ebtzebuergesch",lt:"Lietuvi\u0173",lv:"Latvie\u0161u",mg:"Malagasy",ml:"\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02",mk:"\u041c\u0430\u043a\u0435\u0434\u043e\u043d\u0441\u043a\u0438",mr:"\u092e\u0930\u093e\u0920\u0940",ms:"Bahasa Melayu",mzn:"\u0645\u0627\u0632\u0650\u0631\u0648\u0646\u06cc",nb:"Norsk Bokm\u00e5l",nl:"Nederlands, Vlaams",oc:"Lenga d'\u00f2c",pa:"\u092a\u0902\u091c\u093e\u092c\u0940",pl:"Polski",pms:"Piemont\u00e8is",ps:"\u067e\u069a\u062a\u0648",pt:"Portugu\u00eas",
"pt-br":"Portugu\u00eas Brasileiro",ro:"Rom\u00e2n\u0103",ru:"\u0420\u0443\u0441\u0441\u043a\u0438\u0439",sc:"Sardu",sco:"Scots",si:"\u0dc3\u0dd2\u0d82\u0dc4\u0dbd",sk:"Sloven\u010dina",sr:"\u0421\u0440\u043f\u0441\u043a\u0438",sv:"Svenska",sw:"Kishwahili",ta:"\u0ba4\u0bae\u0bbf\u0bb4\u0bcd",th:"\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22",tl:"Tagalog",tr:"T\u00fcrk\u00e7e",uk:"\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430",vi:"Ti\u1ebfng Vi\u1ec7t","zh-hans":"\u7c21\u9ad4\u4e2d\u6587",
"zh-hant":"\u6b63\u9ad4\u4e2d\u6587"},S="ace ar fa he mzn ps".split(" "),Q=window.BlocklyGamesLang,U=window.BlocklyGamesLanguages,R=!!window.location.pathname.match(/\.html$/),pa=Number,V,W=window.location.search.match(/[?&]level=([^&]+)/);V=W?decodeURIComponent(W[1].replace(/\+/g,"%20")):"NaN";pa(V);
function qa(){document.title=document.getElementById("title").textContent;document.dir=-1!=S.indexOf(Q)?"rtl":"ltr";document.head.parentElement.setAttribute("lang",Q);var a=document.getElementById("languageMenu");if(a){for(var b=[],c=0;c<U.length;c++){var d=U[c];b.push([oa[d],d])}b.sort(function(a,b){return a[0]>b[0]?1:a[0]<b[0]?-1:0});for(c=a.options.length=0;c<b.length;c++){var e=b[c],d=e[1],e=new Option(e[0],d);d==Q&&(e.selected=!0);a.options.add(e)}1>=a.options.length&&(a.style.display="none")}for(c=
1;10>=c;c++)a=document.getElementById("level"+c),b=!!X(na.s,c),a&&b&&ma(a,"level_done");(c=document.querySelector('meta[name="viewport"]'))&&725>screen.availWidth&&c.setAttribute("content","width=725, initial-scale=.35, user-scalable=no");setTimeout(ra,1)}
function sa(){var a=document.getElementById("languageMenu"),a=encodeURIComponent(a.options[a.selectedIndex].value),b=window.location.search,b=1>=b.length?"?lang="+a:b.match(/[?&]lang=[^&]*/)?b.replace(/([?&]lang=)[^&]*/,"$1"+a):b.replace(/\?/,"?lang="+a+"&");window.location=window.location.protocol+"//"+window.location.host+window.location.pathname+b}function X(a,b){var c;try{c=window.localStorage[a+b]}catch(d){}return c}
function ta(a){var b=ua;"string"==typeof a&&(a=document.getElementById(a));a.addEventListener("click",b,!0);a.addEventListener("touchend",b,!0)}function ra(){if(!R){window.GoogleAnalyticsObject="GoogleAnalyticsFunction";var a=function(){(a.q=a.q||[]).push(arguments)};window.GoogleAnalyticsFunction=a;a.l=1*new Date;var b=document.createElement("script");b.async=1;b.src="//www.google-analytics.com/analytics.js";document.head.appendChild(b);a("create","UA-50448074-1","auto");a("send","pageview")}};var Y="puzzle maze bird turtle movie pond-tutor pond-duck".split(" ");
window.addEventListener("load",function(){function a(a,b){return function(){Z(a,0,b)}}document.body.innerHTML=la();qa();document.getElementById("languageMenu").addEventListener("change",sa,!0);for(var b=!1,c=[],d=0;d<Y.length;d++){c[d]=0;for(var e=1;10>=e;e++)X(Y[d],e)&&(b=!0,c[d]++)}b&&(document.getElementById("clearDataPara").style.visibility="visible",d=document.getElementById("clearData"),ta(d));for(d=0;d<c.length;d++)b=Y[d],(e=c[d]/(0==d?1:10)*270)?setTimeout(a(b,e),1500):(b=document.getElementById("gauge-"+
b),b.parentNode.removeChild(b))},!1);function Z(a,b,c){b+=4;va(a,Math.min(b,c));b<c&&setTimeout(function(){Z(a,b,c)},10)}function va(a,b){var c=(b-45)/180*Math.PI,d=80-52.75*Math.cos(c),c=60-52.75*Math.sin(c),e=180<b?1:0;document.getElementById("gauge-"+a).setAttribute("d",["M 42.7,97.3 A",52.75,52.75,0,e,1,d,c].join(" "))}
function ua(){var a=confirm,b;(b=document.getElementById("Index_clear"))?(b=b.textContent,b=b.replace(/\\n/g,"\n")):b=null;if(a(null===b?"[Unknown message: Index_clear]":b)){for(a=0;a<Y.length;a++)for(b=1;10>=b;b++)delete window.localStorage[Y[a]+b];location.reload()}};