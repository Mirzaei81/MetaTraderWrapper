# MQL5 Wrapper Application

This project is a wrapper application for MQL5, composed of a front-end Next.js app and a back-end Django app. The front-end communicates with the back-end, which in turn interacts with MQL5. Docker is used to containerize both the front-end and back-end applications.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Usage](#usage)
4. [Docker Configuration](#docker-configuration)
5. [License](#license)

## Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (for Next.js development)
- [Python](https://www.python.org/) (for Django development)

## Getting Started

### Front-end (Next.js)

1. **Navigate to the front-end directory:**
    ```bash
    cd frontend
    ```

2. **Install the dependencies:**
    ```bash
    npm install
    ```

3. **Start the development server:**
    ```bash
    npm run dev
    ```

### Back-end (Django)

1. **Navigate to the back-end directory:**
    ```bash
    cd backend
    ```

2. **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

3. **Install the dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Run the development server:**
    ```bash
    python manage.py runserver
    ```

## Usage

To use the application, navigate to `http://100site.com` in your browser for the front-end, and `http://django/admin` for the back-end. ( must configure them in you're host machine to localhost
in
### windwos ` C:\Windows\System32\drivers\etc\hosts` ### Linux `/etc/hosts`
