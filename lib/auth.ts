export interface UserProfile {
  name: string;
  email: string;
  isRegistered: boolean;
}

export const MAX_FREE_TRIALS = 1;

export function getTrialCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem('atsenseguard_trial_count') || localStorage.getItem('jobsync_trial_count');
  return count ? parseInt(count, 10) : 0;
}

export function incrementTrialCount(): number {
  if (typeof window === 'undefined') return 0;
  const current = getTrialCount();
  const next = Math.min(MAX_FREE_TRIALS, current + 1);
  localStorage.setItem('atsenseguard_trial_count', next.toString());
  localStorage.setItem('jobsync_trial_count', next.toString());
  window.dispatchEvent(new Event('jobsync_auth_changed'));
  window.dispatchEvent(new Event('atsenseguard_auth_changed'));
  return next;
}

export function resetTrials(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('atsenseguard_trial_count', '0');
  localStorage.setItem('jobsync_trial_count', '0');
  window.dispatchEvent(new Event('jobsync_auth_changed'));
  window.dispatchEvent(new Event('atsenseguard_auth_changed'));
}

export function getUserAuth(): { isAuthenticated: boolean; user: UserProfile | null; trialCount: number } {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, trialCount: 0 };
  }
  const isAuth =
    localStorage.getItem('atsenseguard_authenticated') === 'true' ||
    localStorage.getItem('jobsync_is_authenticated') === 'true';

  let user: UserProfile | null = null;
  const atProfile = localStorage.getItem('atsenseguard_user_profile');
  const jsProfile = localStorage.getItem('jobsync_user_data');

  if (atProfile) {
    try {
      const parsed = JSON.parse(atProfile);
      user = {
        name: parsed.name || 'Member',
        email: parsed.email || 'user@atsecure.ai',
        isRegistered: true
      };
    } catch {}
  } else if (jsProfile) {
    try {
      user = JSON.parse(jsProfile);
    } catch {}
  }

  const trialCount = getTrialCount();
  return { isAuthenticated: isAuth, user, trialCount };
}

export function registerOrLoginUser(name: string, email: string): UserProfile {
  const profile: UserProfile = {
    name: name || 'Demo Member',
    email: email || 'member@atsecure.ai',
    isRegistered: true,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('jobsync_is_authenticated', 'true');
    localStorage.setItem('jobsync_user_data', JSON.stringify(profile));
    localStorage.setItem('atsenseguard_authenticated', 'true');
    localStorage.setItem(
      'atsenseguard_user_profile',
      JSON.stringify({
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: profile.name,
        email: profile.email,
        plan: 'Pro Member',
        createdAt: new Date().toISOString(),
        savedResumesCount: 2,
        analysesCount: 4
      })
    );
    window.dispatchEvent(new Event('jobsync_auth_changed'));
    window.dispatchEvent(new Event('atsenseguard_auth_changed'));
  }
  return profile;
}

export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jobsync_is_authenticated');
    localStorage.removeItem('jobsync_user_data');
    localStorage.removeItem('atsenseguard_authenticated');
    localStorage.removeItem('atsenseguard_user_profile');
    window.dispatchEvent(new Event('jobsync_auth_changed'));
    window.dispatchEvent(new Event('atsenseguard_auth_changed'));
  }
}

