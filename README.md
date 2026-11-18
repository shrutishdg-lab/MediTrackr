# MediTrackr

MediTrackr is a pharmacy management and Point-of-Sale (POS) application featuring an Inter-Hospital Medicine Exchange and Donation Hub.

## Features

- **Point-of-Sale (POS) Counter Billing**: Fast product search, strip and loose tablet pricing, tax calculations, and dynamic UPI QR code generation.
- **Printable Invoices**: Dual format support for 80mm thermal receipt slips and standard A4 invoices.
- **Prescription & Invoice OCR**: Image upload interface for parsing medicine details and auto-populating billing lines.
- **Inventory & Batch Tracking**: Multi-batch inventory management with expiry tracking and low-stock alerts.
- **Inter-Hospital Medicine Exchange**: Platform to donate near-expiry medicines to charitable clinics or exchange stock at discounted rates.
- **Dashboard Telemetry**: Real-time sales metrics, revenue analytics, and expiry alerts.
- **User Authentication**: Role-based access for pharmacists and billing executives.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: File-based persistent JSON store (`db.js`)
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS, Chart.js, Lucide Icons
- **Utilities**: Multer (file uploads), QRCode (dynamic payment QR codes)

## Directory Structure

```text
meditrackr/
├── data/
│   └── db.json          # Persistent application database
├── public/
│   ├── app.js           # Client-side application logic
│   ├── index.html       # Single page application UI
│   └── styles.css       # Custom styles and print media rules
├── uploads/             # Directory for prescription and document uploads
├── .env.example         # Sample environment variables
├── .gitignore           # Git ignore definitions
├── db.js                # Database access layer and seed data
├── package.json         # Project metadata and dependencies
├── server.js            # Express application server
└── test.js              # Integration test suite
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shrutishdg-lab/MediTrackr.git
   cd MediTrackr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```

4. Run integration tests:
   ```bash
   npm test
   ```

5. Start the server:
   ```bash
   npm start
   ```

Open `http://localhost:3000` in your web browser.

### Default Credentials

- **Head Pharmacist**: Phone `9876543210` | PIN `1234`
- **Billing Executive**: Phone `9123456780` | PIN `0000`

## Deployment

### Render / Railway / Heroku

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variable**: `PORT` (automatically assigned by host)

## License

MIT
