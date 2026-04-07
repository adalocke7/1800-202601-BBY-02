# VanGoal


## Overview
Our team, BBY02, is developing a web application to help tourists coming to Vancouver to watch FIFA matches by helping organize FIFA events the user can save, stadium info to help navigate, and teaching them FIFA terminology to help understand the FIFA match.

---


## Features

- Browse the current FIFA matches in Vancouver and save matches.
- See saved matches in the home page and view details on those matches.
- View the map of the stadium and the details of the stadium.
- Take a quiz on FIFA terminology and save the best scores.
- Learn FIFA terminology and search for specific terms.
- Change the language to your native language.
- Give feedback on our web app.

---


## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase for hosting
- **Database**: Firestore

---


## Usage

To run the application locally:

1.  **Clone** the repository.
2.  **Install dependencies** by running `npm install` in the project root directory.
3.  **Start the development server** by running the command: `npm run dev`.
4.  Open your browser and visit the local address shown in your terminal (usually `http://localhost:5173` or similar).

Once the application is running:

1.  Browse the list of matches happening.
2.  Save matches that are interesting.
3.  View your favourite hikes on the home page and view details.

---


## Project Structure

```
VanGoal/
├── public/
│   ├── images/
│   │   └── images
├── src/
│   ├── components/
│   │   └── site-navbar.js
│   ├── sounds/
│   │   └── sounds
│   ├── styles/
│   │   └── style.css
│   ├── Authentication.js
│   ├── Calendar.js
│   ├── Fifaterms.js
│   ├── FirebaseConfig.js
│   ├── Information.js
│   ├── LoginSIgnup.js
│   ├── main.js
│   ├── Map.js
│   ├── Quiz.js
├── Calendar.html
├── FIfaterm.html
├── Index.html
├── Information.html
├── Login.html
├── Main.html
├── index.html
├── Map.html
├── Quiz.json
├── README.md
```

---


## Contributors
Adam Locke- BCIT CST student
Ye Naing Lin(Jonathan) - BCIT CST student
Maneet Singh- BCIT CST student
---


## Acknowledgments

- Trail data and images are for demonstration purposes only.
- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/)
[Youtube](https://youtube.com/).
- Icons sourced from [FlatIcon](https://flaticon.com/) and images from Google.

---


## Limitations and Future Work
### Limitations

- Limited to FIFA-related data and events 

### Future Work

- Create an edit feature for the calendar so the user can add their own events.
- Add a variety of sports, not only FIFA.

---


## License

This project is licensed under the MIT License. See the LICENSE file for details.
