-- Add archived column to graduates table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'graduates'
        AND column_name = 'archived'
    ) THEN
        ALTER TABLE "graduates"
        ADD COLUMN "archived" BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
