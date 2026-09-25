/**
 * Password strength indicator — shared across Add User, Change Password,
 * and Forgot Password (reset step).
 *
 * SRS rules (US09):
 *   0–3 chars  → Not Accepted  (red,    1/4)
 *   4–6 chars  → Weak          (orange, 1/4)
 *   6–8 chars  → Medium        (yellow, 2/4 → 3/4)
 *   > 8 chars  → Strong        (green,  4/4)
 */
import React from 'react';

export type StrengthLevel = 'empty' | 'not-accepted' | 'weak' | 'medium' | 'strong';

export interface PasswordStrength {
  level: StrengthLevel;
  label: string;
  color: string;
  segments: number; // 0–4 filled segments
}

export function getPasswordStrength(password: string): PasswordStrength {
  const len = password.length;
  if (len === 0)  return { level: 'empty',        label: '',             color: 'transparent',             segments: 0 };
  if (len < 4)    return { level: 'not-accepted',  label: 'Not accepted', color: 'var(--color-danger)',     segments: 1 };
  if (len <= 6)   return { level: 'weak',          label: 'Weak',         color: '#f97316',                 segments: 2 };
  if (len <= 8)   return { level: 'medium',        label: 'Medium',       color: '#eab308',                 segments: 3 };
  return           { level: 'strong',        label: 'Strong',       color: 'var(--color-success)',    segments: 4 };
}

interface PasswordStrengthBarProps {
  password: string;
}

export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const strength = getPasswordStrength(password);

  if (strength.level === 'empty') return null;

  return (
    <div style={{ marginTop: 8 }}>
      {/* 4-segment bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 99,
              background: seg <= strength.segments ? strength.color : 'var(--color-border)',
              transition: 'background 250ms ease',
            }}
          />
        ))}
      </div>
      {/* Label */}
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: strength.color,
        transition: 'color 250ms ease',
      }}>
        {strength.label}
      </span>
      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: 6 }}>
        {strength.level === 'not-accepted' && 'min. 4 characters required'}
        {strength.level === 'weak'         && '4–6 characters'}
        {strength.level === 'medium'       && '6–8 characters'}
        {strength.level === 'strong'       && '8+ characters'}
      </span>
    </div>
  );
}
