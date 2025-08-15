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
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, company, password, email } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = {
      id: users.length + 1,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      company: company || '',
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      serviceToken: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
