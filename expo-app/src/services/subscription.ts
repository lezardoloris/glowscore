import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

const CACHE_KEY = 'cached_subscription_status';
const TOKEN_CACHE_KEY = 'cached_subscriber_token';
const isWeb = Platform.OS === 'web';

let Purchases: any = null;
let isInitialized = false;

// C1 FIX: Track initialization state to prevent race conditions
export async function initPurchases(): Promise<void> {
  if (isWeb) {
    console.log('[Subscription] Web mode — RevenueCat skipped');
    isInitialized = true;
    return;
  }
  try {
    const RC = await import('react-native-purchases');
    Purchases = RC.default;
    const key = Platform.OS === 'ios' ? CONFIG.REVENUECAT_IOS_KEY : CONFIG.REVENUECAT_ANDROID_KEY;
    Purchases.configure({ apiKey: key });
    isInitialized = true;
    // H6 FIX: Cache token immediately after init
    const token = await Promise.resolve(Purchases.getAppUserID()); // Safe whether sync or async
    if (token) await AsyncStorage.setItem(TOKEN_CACHE_KEY, token);
  } catch (e) {
    console.warn('[Subscription] RevenueCat init failed:', e);
    isInitialized = true; // Mark as initialized even on failure to unblock UI
  }
}

/**
 * Reset the RevenueCat identity (used by in-app account deletion): dissociates
 * this device's purchase identity and clears cached subscription state.
 * Safe on web / when RevenueCat is not initialized.
 */
export async function resetSubscriber(): Promise<void> {
  try { await AsyncStorage.multiRemove([CACHE_KEY, TOKEN_CACHE_KEY]); } catch {}
  if (isWeb || !Purchases) return;
  try { await Purchases.logOut(); } catch {}
}

export async function checkSubscription(): Promise<boolean> {
  if (isWeb) {
    // Local/web preview: treat as premium so every paid screen is reachable.
    // Flip it off from the /admin console (sets dev_premium = 'off') to test the locked state.
    try { return (await AsyncStorage.getItem('dev_premium')) !== 'off'; } catch { return true; }
  }
  if (!Purchases) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    const isActive = info.entitlements.active[CONFIG.ENTITLEMENT_ID] !== undefined;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(isActive));
    return isActive;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : false;
  }
}

export async function getOfferings(): Promise<any | null> {
  if (isWeb || !Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchasePackage(pkg: any): Promise<boolean> {
  if (isWeb || !Purchases) {
    console.log('[Subscription] Web mock — purchase simulated');
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(true));
    return true;
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isActive = customerInfo.entitlements.active[CONFIG.ENTITLEMENT_ID] !== undefined;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(isActive));
    return isActive;
  } catch (e: any) {
    if (e.userCancelled) return false;
    throw e;
  }
}

/** Purchase a specific product by ID (used for lifetime purchases) */
export async function purchaseProduct(productId: string): Promise<boolean> {
  if (isWeb || !Purchases) {
    console.log('[Subscription] Web mock — product purchase simulated');
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(true));
    return true;
  }
  try {
    const { customerInfo } = await Purchases.purchaseStoreProduct(
      await getStoreProduct(productId)
    );
    const isActive = customerInfo.entitlements.active[CONFIG.ENTITLEMENT_ID] !== undefined;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(isActive));
    return isActive;
  } catch (e: any) {
    if (e.userCancelled) return false;
    throw e;
  }
}

/** Fetch a single store product by ID */
async function getStoreProduct(productId: string): Promise<any> {
  if (!Purchases) throw new Error('Purchases not initialized');
  const products = await Purchases.getProducts([productId]);
  if (!products || products.length === 0) {
    throw new Error(`Product ${productId} not found`);
  }
  return products[0];
}

export async function restorePurchases(): Promise<boolean> {
  if (isWeb || !Purchases) return false;
  try {
    const info = await Purchases.restorePurchases();
    const isActive = info.entitlements.active[CONFIG.ENTITLEMENT_ID] !== undefined;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(isActive));
    return isActive;
  } catch {
    return false;
  }
}

// C1/H6 FIX: Async with fallback to cached token
export async function getSubscriberToken(): Promise<string> {
  if (isWeb) return 'web-preview-user';
  if (Purchases && isInitialized) {
    try {
      const token = await Promise.resolve(Purchases.getAppUserID()); // Safe whether sync or async
      if (token) {
        await AsyncStorage.setItem(TOKEN_CACHE_KEY, token);
        return token;
      }
    } catch {}
  }
  // Fallback to cached token
  const cached = await AsyncStorage.getItem(TOKEN_CACHE_KEY);
  return cached || 'anonymous-' + Date.now();
}
