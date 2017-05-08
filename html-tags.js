// http://html5doctor.com/

module.exports = Object.getOwnPropertyNames(window)
  .filter(s => /HTML[A-Z][a-z]+Element/.test(s))
  .map(s => s.slice(4, -7).toLowerCase())
  .concat('a,abbr,address,article,aside,b,bdi,bdo,blockquote,br,caption,cite,code,col,colgroup,d,data,datalist,dd,del,dfn,dl,dt,element,em,fieldset,figcaption,figure,footer,g,h1,h2,h3,h4,h5,h6,header,hgroup,hr,i,img,ins,ist-style-typ,kbd,li,main,mark,menuitem,nav,noscript,ol,optgroup,p,path,q,rb,rect,rp,rt,rtc,ruby,s,samp,section,small,strong,sub,summary,sup,svg,tbody,td,textarea,tfoot,th,thead,time,tr,u,ul,use,var,wbr'
    .split(','))
