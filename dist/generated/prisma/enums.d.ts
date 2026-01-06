export declare const Role: {
    readonly admin: "admin";
    readonly supervisor: "supervisor";
    readonly agent: "agent";
    readonly candidate: "candidate";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const ConversationStatus: {
    readonly open: "open";
    readonly assigned: "assigned";
    readonly closed: "closed";
};
export type ConversationStatus = (typeof ConversationStatus)[keyof typeof ConversationStatus];
//# sourceMappingURL=enums.d.ts.map