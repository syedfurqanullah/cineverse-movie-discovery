
# cineverse-movie-discovery

CineVerse is a premium, modern, and fully responsive movie discovery web app built with a focus on clean UI design, dynamic movie data, responsive layouts, and interactive user experiences.

## 🚀 Live Demo

[**View CineVerse Live →**](https://cineverse-movie-discovery.netlify.app/)

## 📸 Screenshots

### Home

![CineVerse Home](./screenshots/home.png)

### Movie Discovery & Filters

![CineVerse Movie Filters](./screenshots/movie%20filter.png)

### Movie Details

![CineVerse Movie Details](./screenshots/movie%20details.png)

### Responsive Design

![CineVerse Responsive Design](./screenshots/responsive%20design.png)

## Key features

- Fully Responsive Movie Discovery UI
- Trending, Popular, Top Rated & Upcoming movies
- Debounced movie search & search history
- Genre, year & sorting filters
- Movie details, cast & trailer
- Watchlist & Recently Viewed
- LocalStorage persistence
- Skeleton loading & error states
- API caching, request deduplication & retry handling

## Technologies

- HTML5
- Modern CSS3
- JavaScript (ES6+)
- Fetch API
- TMDB API
- Netlify Functions
- LocalStorage

## Project structure

```text
index.html
style.css
script.js
api.js
screenshots/
assets/
netlify/
└── functions/
    └── tmdb.js
README.md
```

## Run Locally

Open `index.html` directly in a browser, or run a local server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000

## Netlify local development

This project uses a Netlify Function to keep the TMDB API key server-side.

1. Create a local `.env` (do NOT commit it):

```
TMDB_API_KEY=your_tmdb_api_key_here
```

2. Install Netlify CLI if needed and run local dev (serves functions + site):

```bash
npx netlify-cli@latest login
npx netlify-cli@latest dev
```

3.  In production, add `TMDB_API_KEY` to your Netlify site Environment variables (Site settings → Build & deploy → Environment).

```

## Notes

This project was built as a practical frontend project to strengthen my skills in JavaScript, API integration, responsive design, and creating interactive user experiences.

## Author

- GitHub: [@syedfurqanullah](https://github.com/syedfurqanullah)
- LinkedIn: [Syed Furqan Ullah](https://www.linkedin.com/in/syed-furqan-ullah/)
