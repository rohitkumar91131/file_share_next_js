# FileShare - Secure P2P File Sharing

![FileShare Banner](/public/logo.png)

**FileShare** is a modern, secure, and lightning-fast peer-to-peer (P2P) file sharing application. It enables users to share files of any size directly between devices without storing them on any server. Built with privacy and performance in mind, FileShare leverages WebRTC for direct data transfer.

## 🚀 Key Features

-   **Peer-to-Peer Transfer**: Files are streamed directly from sender to receiver using WebRTC. No intermediate server storage.
-   **No File Size Limits**: Share files of any size, limited only by your device's capabilities.
-   **End-to-End Encryption**: Data is encrypted in transit by WebRTC standards.
-   **No Sign-up Required**: Start sharing immediately without creating an account.
-   **Cross-Platform**: Works on any device with a modern web browser (Mobile, Desktop, Tablet).
-   **Premium UI/UX**:
    -   **GSAP Animations**: Fluid, engaging entrance and scroll animations.
    -   **Dark/Light Mode**: Fully supported system-aware theming.
    -   **Responsive Design**: Optimized for all screen sizes.

## 🛠️ Tech Stack

-   **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [GSAP](https://gsap.com/) (GreenSock Animation Platform)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Real-time Logic**: [Socket.io](https://socket.io/) (for signaling) & WebRTC (for data transfer)
-   **State Management**: React Context API & Hooks

## 🏁 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

-   **Node.js**: Version 18.17.0 or higher.
-   **npm** or **yarn**: Package manager.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/rohitkumar91131/file_share_next_js.git
    cd file_share_next_js
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the app running.

## 📂 Project Structure

```bash
src/
├── app/                # Next.js App Router pages
│   ├── layout.jsx      # Root layout
│   ├── page.jsx        # Homepage with animations
│   ├── share/          # Share page (Sender view)
│   ├── download/       # Receiver view (dynamic route)
│   └── privacy/        # Privacy Policy page
├── components/         # React components
│   ├── home/           # Homepage sections (Hero, Features, etc.)
│   ├── layout/         # Layout components (Header, Footer)
│   ├── features/       # Core feature components (Sender, Receiver)
│   └── shared/         # Reusable UI components
├── context/            # React Context (WebRTC, Socket)
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

## 🤝 How It Works

1.  **Sender** opens the app and selects files.
2.  A unique link and QR code are generated.
3.  **Receiver** scans the QR code or opens the link.
4.  A WebRTC connection is established via a signaling server (Socket.io).
5.  Files are transferred directly between peers.

## 🛡️ Privacy & Security

-   **Ephemeral Signaling**: Connection metadata is only used to establish the handshake and is not stored.
-   **No Data Retention**: Since files go peer-to-peer, we never host or view your files.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
