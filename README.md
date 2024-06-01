# Express Serverless Project

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x atau lebih baru)
- [pnpm](https://pnpm.io/) (v9.x atau lebih baru)

### Installation
1. **Clone the repository:**
    ```sh
    git clone https://github.com/NoviarPutra/node-express-serverless.git
    cd node-express-serverless
    ```

2. **Install dependencies using pnpm:**
    ```sh
    pnpm install
    ```

3. **Set up environment variables:**
   Buat file `.env` di direktori root dan tambahkan variabel environment yang diperlukan.

4. **Generate Prisma Client:**
    ```sh
    pnpm prisma generate
    ```

### Running the Application
Untuk memulai server dalam mode dev, gunakan perintah berikut:
```sh
pnpm run dev
