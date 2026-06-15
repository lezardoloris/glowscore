import { AVOID_DISPLAY, TIMELINE, DISCLAIMER, SEE_A_PRO } from './bodyCareSafety';

export type BodyZoneId = 'under_bust' | 'belly_folds' | 'groin_thighs' | 'back' | 'arms';

export interface ProtocolStep {
  title: string;
  detail: string;
}

/** One symptom question per zone -> a tailored tip (review: zone -> 1 question -> protocol). */
export interface TriageOption {
  id: string;
  label: string;
  tip: string;
  /** True for "this is a clinician moment, not a beauty fix" answers (folds/intertrigo). */
  offramp?: boolean;
}

export interface ZoneTriage {
  question: string;
  options: TriageOption[];
}

export interface BodyZoneProtocol {
  id: BodyZoneId;
  label: string;
  subtitle: string;
  concernId: string;
  /** The single most useful thing to do this week (progression cadence). */
  thisWeek: string;
  steps: ProtocolStep[];
  avoid: string[];
  timelineNote: string;
  triage: ZoneTriage;
  /** Fold/intertrigo zones surface the calm medical off-ramp (SEE_A_PRO). */
  medicalOfframp?: boolean;
}

export const BODY_ZONES: BodyZoneProtocol[] = [
  {
    id: 'under_bust',
    label: 'Under-bust',
    subtitle: 'Fold comfort & barrier care',
    concernId: 'intertrigo_plis',
    medicalOfframp: true,
    thisWeek: 'Dry the fold fully after every shower, then a thin barrier morning and night. That one habit prevents most irritation.',
    steps: [
      { title: 'Gentle cleanse', detail: 'Fragrance-free gentle wash on folds, rinse and dry well.' },
      { title: 'Dry fully', detail: 'Pat dry, then cool air or fan briefly. Moisture is what to manage.' },
      { title: 'Barrier', detail: 'Zinc oxide or petrolatum barrier cream (talc-free) to reduce friction and keep skin separated.' },
      { title: 'Separation', detail: 'Soft gauze or moisture-wicking liner if friction persists.' },
    ],
    avoid: AVOID_DISPLAY,
    timelineNote: `Visible comfort often in ${TIMELINE.body_visible_weeks} weeks; stabilized tone in ${TIMELINE.body_stable_months} months.`,
    triage: {
      question: 'How does the fold feel right now?',
      options: [
        { id: 'damp', label: 'Damp & pink', tip: 'Classic friction plus trapped moisture. Focus on drying fully and a zinc or petrolatum barrier morning and night.' },
        { id: 'itchy', label: 'Itchy or stinging', tip: 'Switch to a fragrance-free wash, keep it dry and barrier-protected, and pause any actives until it calms.' },
        { id: 'raw', label: 'Spreading, weepy or sore', tip: SEE_A_PRO, offramp: true },
      ],
    },
  },
  {
    id: 'belly_folds',
    label: 'Belly folds',
    subtitle: 'Keep folds dry & protected',
    concernId: 'intertrigo_plis',
    medicalOfframp: true,
    thisWeek: 'Lift, pat dry, and barrier-cream the folds once a day. Breathable cotton the rest of the time.',
    steps: [
      { title: 'Cleanse', detail: 'Fragrance-free wash, rinse well between folds.' },
      { title: 'Dry', detail: 'Lift folds gently, pat dry, brief cool air.' },
      { title: 'Barrier cream', detail: 'Healing ointment or zinc paste on clean, dry skin.' },
      { title: 'Fabric', detail: 'Breathable cotton; change damp layers promptly.' },
    ],
    avoid: AVOID_DISPLAY,
    timelineNote: `Comfort gains in ${TIMELINE.body_visible_weeks} weeks with daily care.`,
    triage: {
      question: 'How do the folds feel?',
      options: [
        { id: 'damp', label: 'Damp & rubbing', tip: 'Lift and pat dry after every shower, then a barrier cream. Breathable cotton keeps the area drier through the day.' },
        { id: 'itchy', label: 'Itchy or tender', tip: 'Fragrance-free wash, full drying, and a calming barrier. Give it a few days of consistency before adding anything else.' },
        { id: 'raw', label: 'Spreading, weepy or sore', tip: SEE_A_PRO, offramp: true },
      ],
    },
  },
  {
    id: 'groin_thighs',
    label: 'Groin & thighs',
    subtitle: 'Chub rub relief',
    concernId: 'chafing_cuisses',
    thisWeek: 'Wear anti-chafe shorts or apply a balm before you leave the house, and reapply after you sweat.',
    steps: [
      { title: 'Textile first', detail: 'Bike shorts or anti-chafe shorts under dresses/skirts.' },
      { title: 'Lubricant', detail: 'Solid balm (Body Glide, Megababe) before activity.' },
      { title: 'Post-activity', detail: 'Rinse sweat, pat dry, reapply barrier if needed.' },
      { title: 'Powder option', detail: 'Talc-free moisture powder on dry skin only.' },
    ],
    avoid: AVOID_DISPLAY,
    timelineNote: 'Relief is often immediate with barrier + textile combo.',
    triage: {
      question: 'When does the rub bother you most?',
      options: [
        { id: 'walking', label: 'Walking & daily wear', tip: 'A solid balm before dressing plus anti-chafe shorts under skirts handles most everyday rub.' },
        { id: 'workout', label: 'During workouts', tip: 'Reapply balm right before activity, then rinse, dry, and re-protect after. Moisture-wicking layers help.' },
        { id: 'humid', label: 'Hot, humid days', tip: 'Talc-free moisture powder on fully dry skin plus a balm keeps friction down when it is humid.' },
      ],
    },
  },
  {
    id: 'back',
    label: 'Back & bra line',
    subtitle: 'Friction & sweat zones',
    concernId: 'hyperpigmentation_friction',
    thisWeek: 'Pick one PM active (azelaic or niacinamide) and use it 3-4 nights. Daily SPF on any exposed skin.',
    steps: [
      { title: 'Cleanse', detail: 'Gentle body wash; avoid harsh scrubs on irritated skin.' },
      { title: 'Dry', detail: 'Pat bra band area dry after shower or sweat.' },
      { title: 'Actives (PM)', detail: 'Azelaic acid, niacinamide, tranexamic acid, or a low % glycolic on darkened friction zones.' },
      { title: 'Short-contact', detail: 'Apply active, wait 5-10 min, rinse if your skin is sensitive.' },
    ],
    avoid: AVOID_DISPLAY,
    timelineNote: `Tone evens slowly: ${TIMELINE.body_visible_weeks} weeks to see change, ${TIMELINE.body_stable_months} months to stabilize.`,
    triage: {
      question: 'What are you working on here?',
      options: [
        { id: 'marks', label: 'Friction marks & dark spots', tip: 'Azelaic acid or low % glycolic at night, niacinamide to even tone. Give it 8-12 weeks and protect with SPF.' },
        { id: 'bumps', label: 'Bumps & breakouts', tip: 'A gentle salicylic wash, no harsh scrubs, and keep the band dry. Treat the marks they leave with azelaic or tranexamic acid.' },
        { id: 'sweat', label: 'Sweat & rub under the band', tip: 'Pat dry after sweating and add a light barrier on the band line to reduce the friction that darkens skin.' },
      ],
    },
  },
  {
    id: 'arms',
    label: 'Arms & underarms',
    subtitle: 'Chafing & stretch comfort',
    concernId: 'vergetures_inconfort',
    thisWeek: 'Layer a rich butter or oil on stretch-mark zones daily, and SPF where they show.',
    steps: [
      { title: 'Chafe prevention', detail: 'Balm on inner arms if skin rubs when walking.' },
      { title: 'Stretch comfort', detail: 'Rich butter or body oil (cocoa butter, rosehip, Centella) on stretch marks for suppleness, not erasing.' },
      { title: 'Rubrae vs albae', detail: 'Newer pink marks: gentle retinol (OTC) + a low % AHA, with daily SPF. Mature silvery marks: hydration and comfort focus.' },
      { title: 'SPF', detail: 'Sun on exposed stretch marks can deepen contrast; SPF daily.' },
    ],
    avoid: AVOID_DISPLAY,
    timelineNote: 'Comfort and suppleness improve with consistent hydration.',
    triage: {
      question: 'What do the stretch marks look like?',
      options: [
        { id: 'pink', label: 'Newer pink / red lines', tip: 'These respond best now: a gentle retinol (OTC) at night plus a low % AHA to smooth, always with morning SPF.' },
        { id: 'silver', label: 'Mature silvery lines', tip: 'Focus on comfort and suppleness: cocoa butter, rosehip oil, or Centella daily. The goal is softer, calmer skin.' },
        { id: 'rub', label: 'Inner-arm rubbing', tip: 'A balm on the inner arms stops the chafe when skin rubs as you walk.' },
      ],
    },
  },
];

export { DISCLAIMER, SEE_A_PRO };
