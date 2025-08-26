/**
 * User profile management composable providing functionality for
 * viewing and updating user profile information
 */
import { $larafetch } from "~/public/$larafetch";

export const useProfile = () => {
  /** Get user profile information by user identifier */
  async function getProfile(userIdentify) {
    return await $larafetch(`api/profile/${userIdentify}`, {
      method: "get",
    });
  }

  /** Update user profile information with new data */
  async function editProfile(userIdentify, credentials) {
    return await $larafetch(`api/profile/${userIdentify}/edit`, {
      method: "post",
      body: credentials,
    });
  }

  /** Change user password with new credentials */
  async function resetPassword(userIdentify, credentials) {
    return await $larafetch(`api/profile/${userIdentify}/change-password`, {
      method: "post",
      body: credentials,
    });
  }

  // Return all profile management functions
  return {
    getProfile,
    editProfile,
    resetPassword,
  };
};
