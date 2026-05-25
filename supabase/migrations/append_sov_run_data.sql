-- Atomic append for SOV run data — fixes the read-modify-write race condition
-- when multiple Apify webhooks arrive concurrently for the same SOV job.
--
-- Uses Postgres row-level locking (UPDATE is always atomic) so concurrent
-- calls never overwrite each other's data.
CREATE OR REPLACE FUNCTION append_sov_run_data(
  p_id               uuid,
  p_run_key          text,
  p_items            jsonb,
  p_completed_run_key text
)
RETURNS TABLE(completed_count integer, total_expected integer)
LANGUAGE plpgsql
AS $$
DECLARE
  v_completed text[];
  v_total     integer;
BEGIN
  UPDATE sov_reports
  SET
    -- Merge new run items into the raw_data object atomically.
    -- jsonb || jsonb merges at the top level, overwriting duplicate keys.
    raw_data = raw_data || jsonb_build_object(p_run_key, p_items),

    -- Append the completed run key, deduplicating in place.
    apify_completed_runs = (
      SELECT array_agg(DISTINCT elem ORDER BY elem)
      FROM unnest(apify_completed_runs || ARRAY[p_completed_run_key]) AS elem
    ),

    updated_at = now()
  WHERE id = p_id
  RETURNING apify_completed_runs, total_expected_runs
  INTO v_completed, v_total;

  RETURN QUERY
    SELECT array_length(v_completed, 1)::integer, v_total;
END;
$$;
