/**
 * User profile management composable providing functionality for
 * viewing and updating user profile information
 */
import { $larafetch } from "~/utils/$larafetch";

export const useProfile = () => {
  /** Get user profile information by user identifier */
  async function getMyProfile() {
    return await $larafetch(`api/profile`, {
      method: "GET",
    });
  }
  async function getProfile(userIdentify) {
    return await $larafetch(`api/profile/${userIdentify}`, {
      method: "GET",
    });
  }

  /** Update user profile information with new data */
  async function editProfile(credentials) {
    return await $larafetch(`api/profile`, {
      method: "POST",
      body: credentials,
      headers: {
        "X-HTTP-Method-Override": "PUT",
      },
    });
  }

  /** Change user password with new credentials */
  async function resetPassword(credentials) {
    return await $larafetch(`api/profile/rest-password`, {
      method: "POST",
      body: credentials,
    });
  }

  // Return all profile management functions
  return {
    getMyProfile,
    getProfile,
    editProfile,
    resetPassword,
  };
};
