-- Guest reviewer display name (logged-in users use users.full_name)
ALTER TABLE reviews ADD COLUMN reviewer_name TEXT;
