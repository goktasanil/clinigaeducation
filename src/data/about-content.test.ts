import { describe, expect, it } from "vitest";

import {
  isPublishableStudentStory,
  isPublishableTeamProfile,
  PUBLIC_STUDENT_STORIES,
  PUBLIC_TEAM_PROFILES,
  STUDENT_STORY_DRAFTS,
  TEAM_PROFILE_DRAFTS,
  type StudentStory,
  type TeamProfile,
} from "./about-content";

describe("verified profile and student story publishing", () => {
  it("keeps all unfinished editorial templates out of public lists", () => {
    expect(STUDENT_STORY_DRAFTS).toHaveLength(3);
    expect(TEAM_PROFILE_DRAFTS.length).toBeGreaterThan(0);
    expect(PUBLIC_TEAM_PROFILES).toEqual([]);
    expect(PUBLIC_STUDENT_STORIES).toEqual([]);
  });

  it("requires independently confirmed credentials, publication approval and a complete profile", () => {
    const profile: TeamProfile = {
      id: "synthetic-test-profile",
      name: "Test profile",
      title: "Test title",
      expertise: "Test expertise",
      experience: "Test experience",
      profileUrl: "https://example.org/test-profile",
      credentialsVerified: true,
      publicationApproved: true,
    };
    expect(isPublishableTeamProfile(profile)).toBe(true);
    expect(isPublishableTeamProfile({ ...profile, credentialsVerified: false })).toBe(false);
    expect(isPublishableTeamProfile({ ...profile, publicationApproved: false })).toBe(false);
    expect(isPublishableTeamProfile({ ...profile, title: "[DOLDUR]" })).toBe(false);
    expect(isPublishableTeamProfile({ ...profile, profileUrl: "javascript:alert(1)" })).toBe(false);
  });

  it("requires verified story facts and a recorded permission before any quote can appear", () => {
    const story: StudentStory = {
      id: "synthetic-test-story",
      name: "Test display name",
      service: "Test service",
      context: "Test context",
      support: "Test scope",
      outcome: "Test outcome",
      quote: "Test quote",
      factsVerified: true,
      permission: { granted: true, recordedAt: "2026-10-28", recordReference: "test-reference" },
    };
    expect(isPublishableStudentStory(story)).toBe(true);
    expect(isPublishableStudentStory({ ...story, factsVerified: false })).toBe(false);
    expect(isPublishableStudentStory({ ...story, quote: "[DOLDUR: gerçek yorum]" })).toBe(false);
    expect(
      isPublishableStudentStory({ ...story, permission: { ...story.permission, granted: false } }),
    ).toBe(false);
    expect(
      isPublishableStudentStory({ ...story, permission: { ...story.permission, recordedAt: "" } }),
    ).toBe(false);
    expect(
      isPublishableStudentStory({
        ...story,
        permission: { ...story.permission, recordReference: "" },
      }),
    ).toBe(false);
  });
});
