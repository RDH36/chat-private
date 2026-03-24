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
      deletedAt: i.number().optional(),
    }),
    profiles: i.entity({
      userId: i.string().unique().indexed(),
      nickname: i.string().unique().indexed(),
    }),
    messages: i.entity({
      text: i.string(),
      senderId: i.string(),
      senderName: i.string(),
      createdAt: i.number().indexed(),
      readBy: i.json().optional(), // string[]
      deletedAt: i.number().optional(),
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
      }),
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
