-- Fix the trigger to only create task_progress for users who are actually in the graduates table
-- This prevents the "violates foreign key constraint" error when Admins (who are not graduates) exist.

CREATE OR REPLACE FUNCTION public.handle_task_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a progress record ONLY for users who exist in 'graduates' table
  INSERT INTO public.task_progress (graduate_id, task_id, completed)
  SELECT g.id, NEW.id, FALSE
  FROM public.graduates g
  ON CONFLICT (graduate_id, task_id) DO NOTHING;

  RETURN NEW;
END;
$$;
