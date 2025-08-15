import { NextRequest, NextResponse } from 'next/server';

// Mock chat history data
const mockChatHistory = {
  'John Doe': [
    {
      id: 1,
      from: 'User1',
      to: 'John Doe',
      text: 'Hey, how are you doing?',
      time: '2:30 PM'
    },
    {
      id: 2,
      from: 'John Doe',
      to: 'User1',
      text: "I'm doing great! How about you?",
      time: '2:32 PM'
    },
    {
      id: 3,
      from: 'User1',
      to: 'John Doe',
      text: 'Pretty good! Working on the new project.',
      time: '2:35 PM'
    }
  ],
  'Jane Smith': [
    {
      id: 1,
      from: 'User1',
      to: 'Jane Smith',
      text: 'The project is ready for review',
      time: '1:45 PM'
    },
    {
      id: 2,
      from: 'Jane Smith',
      to: 'User1',
      text: "Perfect! I'll take a look at it.",
      time: '1:47 PM'
    }
  ],
  'Mike Johnson': [
    {
      id: 1,
      from: 'User1',
      to: 'Mike Johnson',
      text: 'Can we schedule a meeting?',
      time: '12:20 PM'
    },
    {
      id: 2,
      from: 'Mike Johnson',
      to: 'User1',
      text: 'Sure! How about tomorrow at 2 PM?',
      time: '12:25 PM'
    },
    {
      id: 3,
      from: 'User1',
      to: 'Mike Johnson',
      text: 'That works for me!',
      time: '12:30 PM'
    }
  ],
  'Sarah Wilson': [
    {
      id: 1,
      from: 'User1',
      to: 'Sarah Wilson',
      text: 'Thanks for the update!',
      time: '11:15 AM'
    }
  ],
  'David Brown': [
    {
      id: 1,
      from: 'User1',
      to: 'David Brown',
      text: "I'll send you the files",
      time: '10:30 AM'
    },
    {
      id: 2,
      from: 'David Brown',
      to: 'User1',
      text: "Great! I'm waiting for them.",
      time: '10:35 AM'
    },
    {
      id: 3,
      from: 'User1',
      to: 'David Brown',
      text: 'Just sent them over.',
      time: '10:40 AM'
    }
  ]
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user } = body;

    // Simulate a small delay to mimic real API
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Return chat history for the specified user
    const chatHistory = mockChatHistory[user as keyof typeof mockChatHistory] || [];

    return NextResponse.json(chatHistory);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch chat history',
        success: false
      },
      { status: 500 }
    );
  }
}
