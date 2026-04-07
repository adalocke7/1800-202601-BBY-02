import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                calendar: resolve(__dirname, "calendar.html"),
                fifaterm: resolve(__dirname, "Fifaterm.html"),
                index: resolve(__dirname, "index.html"),
                information: resolve(__dirname, "information.html"),
                login: resolve(__dirname, "login.html"),
                main: resolve(__dirname, "main.html"),
                map: resolve(__dirname, "map.html"),
                quiz: resolve(__dirname, "quiz.html")
            }
        }
    }
});