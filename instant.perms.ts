// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  "$files": {
    allow: {
      view: "true",
      create: "true",
      delete: "true",
    },
  },
  rooms: {
    allow: {
      view: "true",
      create: "true",
      delete: "true",
      update: "true",
    },
  },
  messages: {
    allow: {
      view: "true",
      create: "true",
      delete: "true",
      update: "true",
    },
  },
} satisfies InstantRules;

export default rules;
