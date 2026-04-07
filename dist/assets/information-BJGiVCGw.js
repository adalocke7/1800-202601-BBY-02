import{c as r,d,g as l}from"./firebaseConfig-CJFEPSh8.js";import"./main-Bcy_5-K6.js";document.addEventListener("DOMContentLoaded",()=>{const s=new URLSearchParams(window.location.search),t=s.get("eventID"),a=s.get("userUID");t&&a?m(a,t):console.error("Missing ID or user in URL")});async function m(s,t){try{const a=r(d,"users",s,"saved_events",t,"information"),n=await l(a),i=document.getElementById("information");i.innerHTML="",n.forEach(o=>{const e=o.data(),c=`
                <div class="team-title"><h2><u>${e.title}</u><h2><br></div>
                <img class="team-photo" src="/images/${e.image}">
                <div class="team-nickname"><p><b><i class="fa-solid fa-tag"></i>Nickname: </b>${e.nickname}</p></div>
                <div class="team-confederation"><p><b><i class="fa-solid fa-earth-americas"></i>Confederation: </b>${e.confederation}</p></div>
                <div class="team-appearance"><p><b><i class="fa-solid fa-futbol"></i>World Cup Appearances: </b>${e.appearance}</p></div>
                <div class="team-best"><p><b><i class="fa-solid fa-medal"></i>Best Result: </b>${e.best}</p></div>
                <div class="key-players"><p><b><i class="fa-solid fa-star"></i>Key Players: </b>${e.keyplayers}</p></div>
                <div class="team-content"><p>${e.content}</p></div>
                <hr>
            `;i.insertAdjacentHTML("beforeend",c)})}catch(a){console.error("Error loading details: ",a)}}
