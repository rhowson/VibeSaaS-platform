import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// In-memory user storage (replace with database in production)
const users: any[] = [
  {
    id: 1,
    name: 'Jone Doe',
    email: 'info@codedthemes.com',
    password: '$2a$10$example.hash',
    firstName: 'Jone',
    lastName: 'Doe',
    company: 'CodedThemes'
  },
  {
    id: 2,
    name: 'Phoenix Coded',
    email: 'info@phoenixcoded.co',
    password: '$2a$10$example.hash',
    firstName: 'Phoenix',
    lastName: 'Coded',
    company: 'PhoenixCoded'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user = users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // For demo purposes, allow login with the default users
    if ((email === 'info@codedthemes.com' || email === 'info@phoenixcoded.co') && password === '123456') {
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword,
        serviceToken: 'mock-jwt-token-' + Date.now()
      });
    }

    // Verify password (for other users)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      serviceToken: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
