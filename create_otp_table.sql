-- Create Otp table for serverless OTP storage
CREATE TABLE IF NOT EXISTS Otp (
    id TEXT PRIMARY KEY NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    otp TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS Otp_phone_idx ON Otp(phone);
