import {onAuthStateChanged} from "firebase/auth";     
import { auth } from '/src/firebaseConfig.js';        
import { logoutUser } from '/src/authentication.js';  

class SiteNavbar extends HTMLElement {
    constructor() {
        super();
        this.renderNavbar();
        this.renderAuthControls();
    }

    renderNavbar() {
        this.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-light bg-info">
                <div class="container-fluid">
                    <div class="dropdown">
                        <button class="btn btn-transparent dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="./images/menu.png" height="24">
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="./main.html">Home</a></li>
                            <li><a class="dropdown-item" href="#">Termaninology</a></li>
                            <li><a class="dropdown-item" href="#">Calendar</a></li>
                            <li><a class="dropdown-item" href="#">Quiz</a></li>
                            <li><a class="dropdown-item" href="#">Map</a></li>
                        </ul>
                    </div>
                    <div class="d-flex align-items-center gap-2 ms-lg-2" id="rightControls">
                        <div id="authControls" class="auth-controls d-flex align-items-center gap-2 my-2 my-lg-0">
                            <!-- populated by JS -->
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

     renderAuthControls() {
        const authControls = this.querySelector('#authControls');

        // Initialize with invisible placeholder to maintain layout space
        authControls.innerHTML = `<div class="btn btn-outline-light" style="visibility: hidden; min-width: 80px;">Log out</div>`;

        onAuthStateChanged(auth, (user) => {
            let updatedAuthControl;
            if (user) {
                updatedAuthControl = `<button class="btn btn-outline-light" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>`;
                authControls.innerHTML = updatedAuthControl;
                const signOutBtn = authControls.querySelector('#signOutBtn');
                signOutBtn?.addEventListener('click', logoutUser);
            } else {
                updatedAuthControl = `<a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>`;
                authControls.innerHTML = updatedAuthControl;
            }
        });
    }
}

customElements.define('site-navbar', SiteNavbar);