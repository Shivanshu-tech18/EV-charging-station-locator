# ⚡ EV Charging Station Locator

> 🚧 **Work in Progress** — This project is actively under development. Features and documentation may change.

A web application to help electric vehicle owners find nearby charging stations quickly and easily.

---

## 📸 Screenshots / Demo

> _Add screenshots or a GIF demo here once the UI is ready._

```
📁 docs/
  └── screenshots/
        ├── map-view.png
        ├── station-detail.png
        └── demo.gif
```

To add screenshots, place images in the `docs/screenshots/` folder and update this section like so:

```md
![Map View](docs/screenshots/map-view.png)
![Station Detail](docs/screenshots/station-detail.png)
```

---

## 🛠 Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React / Next.js     |
| Backend   | Node.js / Express   |
| Maps API  | _(e.g. Google Maps / Mapbox — update as needed)_ |
| Database  | _(e.g. MongoDB / PostgreSQL — update as needed)_ |

---

## 📁 Project Structure

```
ev-charging-station-locator/
├── client/          # React / Next.js frontend
│   ├── components/
│   ├── pages/
│   └── ...
├── server/          # Node.js / Express backend
│   ├── routes/
│   ├── controllers/
│   └── ...
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ev-charging-station-locator.git
   cd ev-charging-station-locator
   ```

2. **Install dependencies**

   For the backend:
   ```bash
   cd server
   npm install
   ```

   For the frontend:
   ```bash
   cd client
   npm install
   ```

3. **Set up environment variables**

   Copy the example env file and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. **Run the development servers**

   Backend:
   ```bash
   cd server
   npm run dev
   ```

   Frontend:
   ```bash
   cd client
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Features

- [ ] Map view of nearby EV charging stations
- [ ] Search by location or current GPS
- [ ] Filter by charger type (AC / DC / Fast Charging)
- [ ] Station details (availability, cost, hours)
- [ ] User accounts and saved favorites
- [ ] Mobile-responsive design

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please open an issue first to discuss major changes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 📬 Contact

Have questions or suggestions? Open an [issue](https://github.com/your-username/ev-charging-station-locator/issues) or reach out directly.

---

_Made with ❤️ to accelerate the EV revolution._
