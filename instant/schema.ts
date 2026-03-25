import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    rooms: i.entity({
      roomId: i.string().unique().indexed(),
      name: i.string().optional(),
      isPublic: i.boolean().indexed(),
      createdAt: i.number().indexed(),
      creatorId: i.string(),
      expiresAt: i.number().optional().indexed(),
      messageExpiry: i.string(), // 'on_room_expiry' | 'after_read' | 'never'
      passwordHash: i.string().optional(),
      members: i.json().optional(), // string[] of user IDs
      bannedMembers: i.json().optional(), // string[] of banned user IDs
      deletedAt: i.number().optional(),
      allowCodeSharing: i.boolean().optional(), // default true — creator can disable code copy/share
      allowScreenshot: i.boolean().optional(), // default false — screenshots blocked, creator can enable
    }),
    profiles: i.entity({
      userId: i.string().unique().indexed(),
      nickname: i.string().unique().indexed(),
    }),
    messages: i.entity({
      text: i.string().optional(),
      senderId: i.string(),
      imageUrl: i.string().optional(),
      imagePath: i.string().optional(),
      senderName: i.string(),
      createdAt: i.number().indexed(),
      readBy: i.json().optional(), // string[]
      replyToId: i.string().optional(),
      replyToText: i.string().optional(),
      replyToSender: i.string().optional(),
    }),
  },
  links: {
    roomMessages: {
      forward: {
        on: "messages",
        has: "one",
        label: "room",
        onDelete: "cascade",
      },
      reverse: { on: "rooms", has: "many", label: "messages" },
    },
  },
  rooms: {
    chat: {
      presence: i.entity({
        senderId: i.string(),
        senderName: i.string(),
        isTyping: i.boolean().optional(),
      }),
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
