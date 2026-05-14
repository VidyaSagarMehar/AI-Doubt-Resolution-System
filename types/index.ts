export type DoubtStatus = "open" | "resolved" | "escalated";
export type UserRole = "student" | "mentor" | "admin";

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
};

export type CreateDoubtInput = {
  title: string;
  description: string;
  user: {
    name: string;
    email: string;
    role?: UserRole;
  };
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

export type ListDoubtsFilters = {
  status?: string;
  userEmail?: string;
};
