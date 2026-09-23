// US04: "Set of secret questions can be set pre-defined in the DB and view
// as a drop down in this page." The backend doesn't have an endpoint to
// fetch these yet, so this is a placeholder list — swap for a real
// GET /api/security-questions call once the backend defines one, without
// touching AddUserForm.

export interface SecurityQuestion {
  id: number;
  text: string;
}

export const SECURITY_QUESTIONS: SecurityQuestion[] = [
  { id: 1, text: 'What is your favorite color?' },
  { id: 2, text: "What is your mother's maiden name?" },
  { id: 3, text: 'What was the name of your first pet?' },
  { id: 4, text: 'What city were you born in?' },
  { id: 5, text: 'What is the name of your favorite teacher?' },
];
