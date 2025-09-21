import Constants from "expo-constants"
const {
  BACKEND_URL,
  urls
} = Constants?.expoConfig?.extra?.eas

/**
 * These are common configuration settings for the dev environment.
 */
export default {
  API_URL: BACKEND_URL,
  TERMS_AND_CONDITION: urls.terms_and_conditions,
  PRIVACY_POLICY: urls.privacy_policy,
  KYC_FORM: urls.kyc_form,
  EMAIL: urls.email,
  CONTACT_NUMBER: urls.contact_number,
  PRODUCT_ALT_IMAGE: urls.alt_images.product,
}
