import { http, HttpResponse, delay } from 'msw';
import { DEMO_USER_ID, DEMO_TOKEN, DEMO_PROFILE, DEMO_BIO, RECOMMENDATION_USER_IDS, mockState, getMockUser } from './data.js';
import type { Message } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const url = (path: string) => `${BASE}${path}`;

const d = () => delay(120);

export const handlers = [
  // Auth
  http.post(url('/auth/register'), async () => {
    await d();
    return HttpResponse.json({ userId: DEMO_USER_ID, token: DEMO_TOKEN });
  }),

  http.post(url('/auth/login'), async () => {
    await d();
    return HttpResponse.json({ userId: DEMO_USER_ID, token: DEMO_TOKEN });
  }),

  // Me
  http.get(url('/me'), async () => {
    await d();
    return HttpResponse.json({
      id: DEMO_USER_ID,
      name: `${DEMO_PROFILE.firstName} ${DEMO_PROFILE.lastName}`,
      profilePicture: DEMO_PROFILE.profilePicture,
      isOnline: true,
    });
  }),

  http.get(url('/me/profile'), async () => {
    await d();
    return HttpResponse.json({
      id: DEMO_PROFILE.id,
      firstName: DEMO_PROFILE.firstName,
      lastName: DEMO_PROFILE.lastName,
      aboutMe: DEMO_PROFILE.aboutMe,
      profilePicture: DEMO_PROFILE.profilePicture,
      maxDistanceKm: DEMO_PROFILE.maxDistanceKm,
      latitude: DEMO_PROFILE.latitude,
      longitude: DEMO_PROFILE.longitude,
    });
  }),

  http.put(url('/me/profile'), async () => {
    await d();
    return HttpResponse.json({ success: true });
  }),

  http.get(url('/me/bio'), async () => {
    await d();
    return HttpResponse.json(DEMO_BIO);
  }),

  http.put(url('/me/bio'), async () => {
    await d();
    return HttpResponse.json({ success: true });
  }),

  // Users
  http.get(url('/users/:userId'), async ({ params }) => {
    await d();
    const mock = getMockUser(params.userId as string);
    if (!mock) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(mock.user);
  }),

  http.get(url('/users/:userId/profile'), async ({ params }) => {
    await d();
    const mock = getMockUser(params.userId as string);
    if (!mock) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const p = mock.profile;
    return HttpResponse.json({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      aboutMe: p.aboutMe ?? p.bio,
      profilePicture: p.profilePicture,
    });
  }),

  http.get(url('/users/:userId/bio'), async ({ params }) => {
    await d();
    const mock = getMockUser(params.userId as string);
    if (!mock) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(mock.bio);
  }),

  // Recommendations
  http.get(url('/recommendations'), async () => {
    await d();
    const available = RECOMMENDATION_USER_IDS.filter(
      (id) => !mockState.dismissed.has(id) && !mockState.connections.has(id) && !mockState.pendingOutgoing.has(id)
    );
    return HttpResponse.json({ recommendations: available });
  }),

  http.post(url('/recommendations/:userId/dismiss'), async ({ params }) => {
    await d();
    mockState.dismissed.add(params.userId as string);
    return HttpResponse.json({ success: true });
  }),

  // Connections
  http.get(url('/connections'), async () => {
    await d();
    return HttpResponse.json({ connections: [...mockState.connections] });
  }),

  http.get(url('/connections/requests'), async () => {
    await d();
    return HttpResponse.json({ requests: [...mockState.pendingIncoming] });
  }),

  http.post(url('/connections/:userId/request'), async ({ params }) => {
    await d();
    const id = params.userId as string;
    mockState.pendingOutgoing.add(id);
    mockState.dismissed.add(id);

    setTimeout(() => {
      mockState.pendingOutgoing.delete(id);
      mockState.connections.add(id);
      const mock = getMockUser(id);
      if (mock && !mockState.conversations.has(id)) {
        mockState.conversations.set(id, [
          {
            id: `msg-auto-${id}`,
            sender_id: id,
            receiver_id: DEMO_USER_ID,
            content: mock.chatScript[0],
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      window.dispatchEvent(new CustomEvent('mock:new-message', { detail: { senderId: id } }));
    }, 2000);

    return HttpResponse.json({ success: true });
  }),

  http.post(url('/connections/:userId/accept'), async ({ params }) => {
    await d();
    const id = params.userId as string;
    mockState.pendingIncoming.delete(id);
    mockState.connections.add(id);
    // Seed an opening message from the accepted user
    const mock = getMockUser(id);
    if (mock && !mockState.conversations.has(id)) {
      const opener: Message = {
        id: `msg-auto-${id}`,
        sender_id: id,
        receiver_id: DEMO_USER_ID,
        content: mock.chatScript[0],
        is_read: false,
        created_at: new Date().toISOString(),
      };
      mockState.conversations.set(id, [opener]);
    }
    return HttpResponse.json({ success: true });
  }),

  http.post(url('/connections/:userId/decline'), async ({ params }) => {
    await d();
    mockState.pendingIncoming.delete(params.userId as string);
    return HttpResponse.json({ success: true });
  }),

  http.delete(url('/connections/:userId'), async ({ params }) => {
    await d();
    mockState.connections.delete(params.userId as string);
    return HttpResponse.json({ success: true });
  }),

  // Messages
  http.get(url('/chats'), async () => {
    await d();
    const chats = [...mockState.connections]
      .filter((id) => mockState.conversations.has(id))
      .map((id) => {
        const msgs = mockState.conversations.get(id)!;
        const last = msgs[msgs.length - 1];
        return { id, lastMessageTime: last?.created_at ?? new Date().toISOString() };
      })
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    return HttpResponse.json({ chats });
  }),

  http.get(url('/chats/:userId/messages'), async ({ params }) => {
    await d();
    const msgs = mockState.conversations.get(params.userId as string) ?? [];
    // Simulate Spring Page response, newest first
    const reversed = [...msgs].reverse();
    const camel = reversed.map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      content: m.content,
      isRead: m.is_read,
      createdAt: m.created_at,
    }));
    return HttpResponse.json({ content: camel, totalPages: 1, totalElements: msgs.length });
  }),

  http.post(url('/messages'), async ({ request }) => {
    await d();
    const searchParams = new URL(request.url).searchParams;
    const receiverId = searchParams.get('receiverId') ?? '';
    const body = (await request.json()) as { content: string };

    const newMsg: Message = {
      id: `msg-${mockState.nextMsgId++}`,
      sender_id: DEMO_USER_ID,
      receiver_id: receiverId,
      content: body.content,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const conv = mockState.conversations.get(receiverId) ?? [];
    conv.push(newMsg);
    mockState.conversations.set(receiverId, conv);

    // Queue a reply from the mock user
    scheduleReply(receiverId);

    return HttpResponse.json({
      id: newMsg.id,
      senderId: newMsg.sender_id,
      receiverId: newMsg.receiver_id,
      content: newMsg.content,
      isRead: newMsg.is_read,
      createdAt: newMsg.created_at,
    });
  }),

  http.get(url('/messages/unread/count'), async () => {
    await d();
    let count = 0;
    for (const msgs of mockState.conversations.values()) {
      count += msgs.filter((m) => m.sender_id !== DEMO_USER_ID && !m.is_read).length;
    }
    return HttpResponse.json({ unreadCount: count });
  }),

  http.put(url('/messages/:messageId/read'), async ({ params }) => {
    await d();
    const msgId = params.messageId as string;
    for (const msgs of mockState.conversations.values()) {
      const msg = msgs.find((m) => m.id === msgId);
      if (msg) {
        msg.is_read = true;
        break;
      }
    }
    return HttpResponse.json({ success: true });
  }),
];

// Reply scheduler
const replyCounters = new Map<string, number>();

function scheduleReply(userId: string) {
  const mock = getMockUser(userId);
  if (!mock) return;

  const count = replyCounters.get(userId) ?? 0;
  const scriptIndex = Math.min(count + 1, mock.chatScript.length - 1);
  replyCounters.set(userId, count + 1);
  const replyText = mock.chatScript[scriptIndex];

  // Show typing indicator
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('mock:typing', { detail: { senderId: userId } }));
  }, 600);

  // Send the reply
  setTimeout(
    () => {
      window.dispatchEvent(new CustomEvent('mock:stop-typing', { detail: { senderId: userId } }));
      const reply: Message = {
        id: `msg-${mockState.nextMsgId++}`,
        sender_id: userId,
        receiver_id: DEMO_USER_ID,
        content: replyText,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      const conv = mockState.conversations.get(userId) ?? [];
      conv.push(reply);
      mockState.conversations.set(userId, conv);
      window.dispatchEvent(new CustomEvent('mock:new-message', { detail: { senderId: userId } }));
    },
    1500 + Math.random() * 1000
  );
}
