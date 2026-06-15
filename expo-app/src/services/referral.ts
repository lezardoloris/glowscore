import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackEvent } from './analytics';

/**
 * Two-sided referral. Each user gets a stable code + link to share; a new user can
 * redeem a friend's code for a welcome bonus, and the inviter earns rewards as
 * shares/redemptions add up. Client-side MVP (counts are local proxies); a server
 * can later own true attribution without changing these call sites.
 */
const CODE_KEY = 'referral_code';
const SHARES_KEY = 'referral_shares';
const REDEEMED_BY_KEY = 'referral_referred_by'; // code this user redeemed (invitee side)
const INVITEE_BONUS_KEY = 'referral_invitee_bonus';
const INVITER_REWARD_KEY = 'referral_inviter_reward';

export const INVITER_GOAL = 3; // shares/installs to unlock the inviter reward
const BASE_URL = 'https://glowupai.app/r/';

export interface ReferralStats {
  code: string;
  link: string;
  shares: number;
  inviterRewardUnlocked: boolean;
  inviteeBonus: boolean;       // this user redeemed a friend's code
  redeemedCode: string | null;
}

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `GLOW${s}`;
}

export async function getMyReferralCode(): Promise<string> {
  try {
    let code = await AsyncStorage.getItem(CODE_KEY);
    if (!code) { code = genCode(); await AsyncStorage.setItem(CODE_KEY, code); }
    return code;
  } catch {
    return genCode();
  }
}

export function referralLink(code: string): string { return BASE_URL + code; }

async function num(key: string): Promise<number> {
  try { return parseInt((await AsyncStorage.getItem(key)) || '0', 10); } catch { return 0; }
}

export async function getReferralStats(): Promise<ReferralStats> {
  const code = await getMyReferralCode();
  const shares = await num(SHARES_KEY);
  let inviteeBonus = false, redeemedCode: string | null = null, inviterRewardUnlocked = false;
  try {
    inviteeBonus = (await AsyncStorage.getItem(INVITEE_BONUS_KEY)) === 'true';
    redeemedCode = await AsyncStorage.getItem(REDEEMED_BY_KEY);
    inviterRewardUnlocked = (await AsyncStorage.getItem(INVITER_REWARD_KEY)) === 'true';
  } catch {}
  return { code, link: referralLink(code), shares, inviterRewardUnlocked, inviteeBonus, redeemedCode };
}

/** Share the referral link; counts a completed share toward the inviter reward. */
export async function shareReferral(): Promise<ReferralStats> {
  const code = await getMyReferralCode();
  trackEvent('referral_share_opened');
  let completed = false;
  try {
    const res = await Share.share({
      message: `Join me on GlowUp ✨ get your Facial Harmony score and a glow-up plan. Use my code ${code} for a welcome bonus: ${referralLink(code)}`,
    });
    completed = res.action === Share.sharedAction;
  } catch {}
  if (completed) {
    const shares = (await num(SHARES_KEY)) + 1;
    try {
      await AsyncStorage.setItem(SHARES_KEY, String(shares));
      if (shares >= INVITER_GOAL) { await AsyncStorage.setItem(INVITER_REWARD_KEY, 'true'); trackEvent('referral_inviter_reward'); }
    } catch {}
    trackEvent('referral_share_completed', { shares });
  }
  return getReferralStats();
}

/** Invitee redeems a friend's code once -> welcome bonus. Returns ok + message. */
export async function redeemCode(input: string): Promise<{ ok: boolean; message: string }> {
  const code = (input || '').trim().toUpperCase();
  const mine = await getMyReferralCode();
  if (!/^GLOW[A-Z0-9]{6}$/.test(code)) return { ok: false, message: 'That code does not look right.' };
  if (code === mine) return { ok: false, message: 'You cannot redeem your own code.' };
  const already = await AsyncStorage.getItem(REDEEMED_BY_KEY);
  if (already) return { ok: false, message: 'You already redeemed a code.' };
  try {
    await AsyncStorage.setItem(REDEEMED_BY_KEY, code);
    await AsyncStorage.setItem(INVITEE_BONUS_KEY, 'true');
  } catch {}
  trackEvent('referral_redeemed', { code });
  return { ok: true, message: 'Welcome bonus unlocked. Enjoy your glow-up.' };
}
