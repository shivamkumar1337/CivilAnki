import Constants from "expo-constants"
import CommonConfig from "./config.common"
const { BACKEND_URL } = Constants?.expoConfig?.extra?.eas

/**
 * These are configuration settings for the production environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
export default {
  API_URL: BACKEND_URL,
  ...CommonConfig,
}
