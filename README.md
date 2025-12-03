# Notes Website

A simple web application for creating, reading, updating, and deleting notes with media upload functionality.

## Group Members
- [Mark Reyland Butalid]
- [Ramel Guardario]
- [Vince Faustorilla]
- [Danilo Lasin]
- [Lyzbeth Gumisad]
- [Mikhail Dayagdag]

## Project Description
This is a notes management website that allows users to:
- Create an account and sign in
- Create, read, update, and delete notes
- Upload images and videos with their notes
- Securely store their data using Supabase

## Setup Instructions

### Prerequisites
- A Supabase account (free tier available)
- A web browser

### Installation Steps

1. **Set up Supabase:**
   - Go to [supabase.com](https://supabase.com) and create an account
   - Create a new project
   - Get your project URL and anon key from Settings > API

2. **Configure the Database:**
   - In the Supabase dashboard, go to the SQL Editor
   - Run the following SQL to create the notes table:
   ```sql
   CREATE TABLE notes (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     content TEXT NOT NULL,
     media_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );