export const DEFAULT_POLICY_TEXT = `
# TERM LIFE INSURANCE POLICY - SAMPLE
Policy Number: TL-99887766
Insured: John Doe
Coverage Amount: $500,000
Premium: $45.00 / month

## 1. DEFINITIONS
"Insured" means the person whose life is covered by this policy.
"Beneficiary" means the person(s) designated to receive the death benefit.
"Premium" means the payment required to keep this policy in force.

## 2. DEATH BENEFIT
We will pay the Coverage Amount to the Beneficiary upon receipt of due proof of the Insured's death while this policy is in force.

## 3. EXCLUSIONS
No benefit will be paid if the Insured's death results from:
a) Suicide within two years of the policy effective date.
b) Participating in hazardous activities such as skydiving, scuba diving deeper than 100ft, or professional car racing.
c) Acts of war, declared or undeclared.

## 4. PREMIUM PAYMENTS
Premiums are due on the 1st of each month. A grace period of 31 days is allowed. If payment is not received by the end of the grace period, the policy will lapse.

## 5. REINSTATEMENT
If the policy lapses, it may be reinstated within 3 years by paying all overdue premiums with interest and providing evidence of insurability satisfactory to us.

## 6. CONVERSION PRIVILEGE
This term policy may be converted to a permanent life insurance policy without evidence of insurability before the Insured reaches age 65.
`;

export const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';
export const SYSTEM_INSTRUCTION_PREFIX = `You are Alex, a professional, empathetic, and knowledgeable Senior Insurance Agent.
Your role is to assist the customer with questions regarding their insurance policy.
You are interacting via a REAL-TIME VOICE call.
1. Keep your responses CONCISE and natural for speech. Avoid long bulleted lists; summarize instead.
2. Use the provided POLICY CONTEXT to answer questions.
3. If the user asks something not covered in the policy, politely state that you don't have that information and offer to connect them to a specialist.
4. Be helpful, clear, and reassuring.

POLICY CONTEXT:
`;
