import { NextResponse } from 'next/server';

// Mock user data for chat functionality
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    avatar: '/images/users/user-1.png',
    status: 'online',
    lastMessage: 'Hey, how are you doing?',
    lastMessageTime: '2:30 PM',
    unreadCount: 2
  },
  {
    id: 2,
    name: 'Jane Smith',
    avatar: '/images/users/user-2.png',
    status: 'offline',
    lastMessage: 'The project is ready for review',
    lastMessageTime: '1:45 PM',
    unreadCount: 0
  },
  {
    id: 3,
    name: 'Mike Johnson',
    avatar: '/images/users/user-3.png',
    status: 'online',
    lastMessage: 'Can we schedule a meeting?',
    lastMessageTime: '12:20 PM',
    unreadCount: 1
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    avatar: '/images/users/user-4.png',
    status: 'away',
    lastMessage: 'Thanks for the update!',
    lastMessageTime: '11:15 AM',
    unreadCount: 0
  },
  {
    id: 5,
    name: 'David Brown',
    avatar: '/images/users/user-5.png',
    status: 'online',
    lastMessage: "I'll send you the files",
    lastMessageTime: '10:30 AM',
    unreadCount: 3
  }
];

export async function GET() {
  try {
    // Simulate a small delay to mimic real API
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      users: mockUsers,
      success: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        success: false
      },
      { status: 500 }
    );
  }
}
