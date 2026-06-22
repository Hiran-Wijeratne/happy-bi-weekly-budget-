ALTER TABLE feedback ADD COLUMN IF NOT EXISTS name  TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_type_check;
ALTER TABLE feedback ADD  CONSTRAINT feedback_type_check
  CHECK (type IN ('bug','feature','general','love','contact'));
