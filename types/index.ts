export type DoubtStatus = "open" | "resolved" | "escalated" | "mentor_replied";
export type UserRole = "student" | "mentor";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type RecommendedResource = {
  title: string;
  content: string;
  tags: string[];
  embeddingId: string;
  score: number;
};

export type AIResponsePayload = {
  _id: string;
  doubtId: string;
  answer: string;
  sources: RecommendedResource[];
  confidenceScore: number;
  recommendedResources: RecommendedResource[];
  createdAt: string;
  updatedAt: string;
};

export type FeedbackPayload = {
  _id: string;
  doubtId: string;
  isHelpful: boolean;
  comment?: string;
  createdAt: string;
  updatedAt: string;
};

export type MentorReplyPayload = {
  _id: string;
  mentorId: string;
  mentorName: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type DoubtDetail = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  status: DoubtStatus;
  createdAt: string;
  updatedAt: string;
  aiResponse: AIResponsePayload | null;
  feedback?: FeedbackPayload[];
  mentorReplies?: MentorReplyPayload[];
};

export type CreateDoubtInput = {
  title?: string;
  description: string;
  userId: string;
};

export type UpdateDoubtInput = {
  title?: string;
  description?: string;
  status?: DoubtStatus;
};

export type FeedbackInput = {
  doubtId: string;
  isHelpful: boolean;
  comment?: string;
};

export type MentorReplyInput = {
  doubtId: string;
  message: string;
};

export type ListDoubtsFilters = {
  status?: string;
  userEmail?: string;
  userId?: string;
};
