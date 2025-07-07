# IFBShare Backend (MySQL Migration)

This is the backend for the IFBShare application, migrated to use MySQL as its primary database.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd ifbshare-back
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **MySQL Database Setup:**

    *   Ensure you have a MySQL server running.
    *   Create a database named `ifbshare`.
    *   Execute the `schema.sql` file to create the necessary tables, triggers, and other database objects:

        ```bash
        mysql -u your_mysql_user -p ifbshare < schema.sql
        ```
        (Replace `your_mysql_user` with your MySQL username. You will be prompted for your password.)

4.  **Environment Variables:**

    Create a `.env` file in the root of the `ifbshare-back` directory with the following variables:

    ```
    MYSQL_HOST=your_mysql_host
    MYSQL_USER=your_mysql_user
    MYSQL_PASSWORD=your_mysql_password
    MYSQL_DATABASE=ifbshare
    
    JWT_SECRET=your_jwt_secret_key
    PORT=5555
    IFB_DOMAIN=your_ifb_domain_email
    JWT_FORGOT_SECRET=your_jwt_forgot_secret_key
    RESEND_API_KEY=your_resend_api_key
    EMAIL_SENDER=onboarding@resend.dev
    NODE_ENV=development
    CLIENT_DOMAIN=http://localhost:3000
    VITE_API_BASE_URL=http://localhost:5555/api
    ```
    *   Replace `your_mysql_host`, `your_mysql_user`, `your_mysql_password`, `your_jwt_secret_key`, `your_ifb_domain_email`, `your_jwt_forgot_secret_key`, and `your_resend_api_key` with your actual credentials and desired values.

## Running the Application

To start the backend server:

```bash
npm run server
```

The server will run on the `PORT` specified in your `.env` file (default: 5555).

## Project Structure

*   `config/`: Database and environment configurations.
*   `controllers/`: Handles API logic and interacts with the database.
*   `middlewares/`: Express middleware.
*   `models/`: TypeScript interfaces for data structures.
*   `routes/`: Defines API endpoints.
*   `templates/`: Email templates.
*   `utils/`: Utility functions.
*   `schema.sql`: MySQL database schema definition.
