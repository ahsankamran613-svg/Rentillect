-- ============================================================
-- RENTILLECT: Row-Level Security (RLS) Policies
-- Run this in the Supabase Dashboard -> SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (status != 'soft_deleted' OR auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- ------------------------------------------------------------
-- 2. USER ROLES
-- ------------------------------------------------------------
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;
CREATE POLICY "Users can read own roles"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can add own roles" ON user_roles;
CREATE POLICY "Users can add own roles"
    ON user_roles FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- ------------------------------------------------------------
-- 3. CITIES & AREAS (Public Read)
-- ------------------------------------------------------------
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cities are viewable by everyone" ON cities;
CREATE POLICY "Cities are viewable by everyone" ON cities FOR SELECT USING (true);

ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Areas are viewable by everyone" ON areas;
CREATE POLICY "Areas are viewable by everyone" ON areas FOR SELECT USING (true);

-- ------------------------------------------------------------
-- 4. PROPERTIES & IMAGES
-- ------------------------------------------------------------
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active properties are viewable by everyone" ON properties;
CREATE POLICY "Active properties are viewable by everyone"
    ON properties FOR SELECT
    USING (status = 'active' OR auth.uid() = owner_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Owners can manage own properties" ON properties;
CREATE POLICY "Owners can manage own properties"
    ON properties FOR ALL
    USING (auth.uid() = owner_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = owner_id OR auth.role() = 'service_role');

ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Property images are viewable by everyone" ON property_images;
CREATE POLICY "Property images are viewable by everyone" ON property_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage property images" ON property_images;
CREATE POLICY "Owners can manage property images"
    ON property_images FOR ALL
    USING (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_images.property_id AND properties.owner_id = auth.uid())
        OR auth.role() = 'service_role'
    );

-- ------------------------------------------------------------
-- 5. LEASES & RENT PAYMENTS
-- ------------------------------------------------------------
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lease participants can view lease" ON leases;
CREATE POLICY "Lease participants can view lease"
    ON leases FOR SELECT
    USING (auth.uid() = landlord_id OR auth.uid() = tenant_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Landlords can manage leases" ON leases;
CREATE POLICY "Landlords can manage leases"
    ON leases FOR ALL
    USING (auth.uid() = landlord_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = landlord_id OR auth.role() = 'service_role');

ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lease participants can view rent payments" ON rent_payments;
CREATE POLICY "Lease participants can view rent payments"
    ON rent_payments FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM leases WHERE leases.id = rent_payments.lease_id AND (leases.landlord_id = auth.uid() OR leases.tenant_id = auth.uid()))
        OR auth.role() = 'service_role'
    );

-- ------------------------------------------------------------
-- 6. APPLICATIONS
-- ------------------------------------------------------------
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applicants and landlords can view applications" ON applications;
CREATE POLICY "Applicants and landlords can view applications"
    ON applications FOR SELECT
    USING (
        auth.uid() = applicant_id 
        OR EXISTS (SELECT 1 FROM properties WHERE properties.id = applications.property_id AND properties.owner_id = auth.uid())
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Applicants can create applications" ON applications;
CREATE POLICY "Applicants can create applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = applicant_id OR auth.role() = 'service_role');
