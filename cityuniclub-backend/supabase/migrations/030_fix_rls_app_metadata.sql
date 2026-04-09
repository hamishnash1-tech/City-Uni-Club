-- Fix RLS policies to use app_metadata instead of user_metadata.
-- user_metadata is user-editable; app_metadata is server-only.

-- menu_items
DROP POLICY IF EXISTS "menu_items_admin_all" ON menu_items;
CREATE POLICY "menu_items_admin_all"
ON menu_items FOR ALL
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- menu-photos storage
DROP POLICY IF EXISTS "menu_photos_insert" ON storage.objects;
CREATE POLICY "menu_photos_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-photos'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

DROP POLICY IF EXISTS "menu_photos_delete" ON storage.objects;
CREATE POLICY "menu_photos_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-photos'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- event-pdfs storage (migration 018)
DROP POLICY IF EXISTS "event_pdfs_insert" ON storage.objects;
CREATE POLICY "event_pdfs_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-pdfs'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

DROP POLICY IF EXISTS "event_pdfs_delete" ON storage.objects;
CREATE POLICY "event_pdfs_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-pdfs'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- loi_emails_sent (migration 004)
DROP POLICY IF EXISTS "Admins can manage loi_emails_sent" ON loi_emails_sent;
CREATE POLICY "Admins can manage loi_emails_sent" ON loi_emails_sent
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_app_meta_data->>'role' = 'admin'
        )
    );

-- audit_logs (migration 006)
DROP POLICY IF EXISTS "Admins can read audit_logs" ON audit_logs;
CREATE POLICY "Admins can read audit_logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_app_meta_data->>'role' = 'admin'
        )
    );
