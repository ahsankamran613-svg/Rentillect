-- ============================================================
-- RENTILLECT: Initial Database Schema (Phase 0)
-- PostgreSQL + Supabase + pgvector
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_status AS ENUM ('active', 'suspended', 'soft_deleted');
CREATE TYPE user_role AS ENUM ('admin', 'landlord', 'tenant');
CREATE TYPE property_status AS ENUM ('draft', 'active', 'occupied', 'delisted', 'orphaned');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'room', 'portion');
CREATE TYPE lease_status AS ENUM ('draft', 'active', 'expired', 'terminated', 'transferred');
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid', 'overdue', 'waived');
CREATE TYPE transfer_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'flagged', 'rejected');
CREATE TYPE document_type AS ENUM ('cnic_front', 'cnic_back', 'salary_slip', 'lease_agreement', 'notice', 'other');
CREATE TYPE notification_type AS ENUM (
    'ownership_transfer_request', 'ownership_transfer_accepted', 'ownership_transfer_rejected',
    'lease_created', 'lease_expiring', 'lease_terminated',
    'application_received', 'application_status_change',
    'payment_due', 'payment_overdue',
    'maintenance_request', 'chat_message',
    'document_verification_update', 'admin_notice',
    'review_received'
);
CREATE TYPE manager_permission AS ENUM (
    'manage_tenants', 'manage_listings', 'approve_maintenance',
    'chat_with_tenants', 'view_financials', 'manage_applications',
    'manage_documents'
);

-- ============================================================
-- 3.1 CORE: USERS & ROLES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cnic VARCHAR(15) UNIQUE, -- 13-digit Pakistani CNIC (stored without dashes)
    avatar_url TEXT,
    city VARCHAR(100),
    address TEXT,
    status user_status NOT NULL DEFAULT 'active',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES profiles(id),
    UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ============================================================
-- 3.2 PROPERTIES & LOCATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- 'Islamabad', 'Lahore', 'Karachi', etc.
    province VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS areas (
    id SERIAL PRIMARY KEY,
    city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 'E-11', 'F-10', 'DHA Phase 5', etc.
    UNIQUE(city_id, name)
);

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type property_type NOT NULL,
    status property_status NOT NULL DEFAULT 'draft',

    -- Location
    city_id INT NOT NULL REFERENCES cities(id),
    area_id INT NOT NULL REFERENCES areas(id),
    street_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Details
    rent_amount DECIMAL(12, 2) NOT NULL, -- PKR
    security_deposit DECIMAL(12, 2) DEFAULT 0,
    bedrooms SMALLINT NOT NULL DEFAULT 0,
    bathrooms SMALLINT NOT NULL DEFAULT 0,
    area_sqft INT,
    is_furnished BOOLEAN DEFAULT FALSE,
    available_from DATE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city_area ON properties(city_id, area_id);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(rent_amount);

CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    cloudinary_url TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    display_order SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_images_property ON property_images(property_id);

CREATE TABLE IF NOT EXISTS property_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity VARCHAR(100) NOT NULL,
    UNIQUE(property_id, amenity)
);

-- ============================================================
-- 3.3 PROPERTY MANAGER DELEGATION
-- ============================================================

CREATE TABLE IF NOT EXISTS property_manager_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES profiles(id),
    assigned_by UUID NOT NULL REFERENCES profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    UNIQUE(property_id, manager_id)
);

CREATE TABLE IF NOT EXISTS manager_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES property_manager_assignments(id) ON DELETE CASCADE,
    permission manager_permission NOT NULL,
    UNIQUE(assignment_id, permission)
);

CREATE INDEX IF NOT EXISTS idx_pma_property ON property_manager_assignments(property_id);
CREATE INDEX IF NOT EXISTS idx_pma_manager ON property_manager_assignments(manager_id);

-- ============================================================
-- 3.4 OWNERSHIP HANDOVER (Invite & Accept)
-- ============================================================

CREATE TABLE IF NOT EXISTS ownership_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    from_owner_id UUID NOT NULL REFERENCES profiles(id),
    to_owner_id UUID REFERENCES profiles(id),
    to_owner_email VARCHAR(255) NOT NULL,
    status transfer_status NOT NULL DEFAULT 'pending',
    reason TEXT,
    notes TEXT,
    handover_date DATE,
    attachment_url TEXT,
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_transfers_property ON ownership_transfers(property_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON ownership_transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_to_email ON ownership_transfers(to_owner_email);

-- ============================================================
-- 3.5 LEASES & PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    landlord_id UUID NOT NULL REFERENCES profiles(id),
    tenant_id UUID NOT NULL REFERENCES profiles(id),
    status lease_status NOT NULL DEFAULT 'draft',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(12, 2) NOT NULL,
    security_deposit DECIMAL(12, 2) DEFAULT 0,
    payment_due_day SMALLINT DEFAULT 1,
    lease_pdf_url TEXT,
    lease_pdf_storage_path TEXT,
    original_landlord_id UUID REFERENCES profiles(id),
    transferred_at TIMESTAMPTZ,
    terminated_by UUID REFERENCES profiles(id),
    termination_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT valid_due_day CHECK (payment_due_day BETWEEN 1 AND 28)
);

CREATE INDEX IF NOT EXISTS idx_leases_property ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_landlord ON leases(landlord_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_lease_per_property
    ON leases(property_id) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS rent_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    period_month SMALLINT NOT NULL,
    period_year SMALLINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'unpaid',
    marked_paid_by UUID REFERENCES profiles(id),
    marked_paid_at TIMESTAMPTZ,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(lease_id, period_month, period_year)
);

CREATE INDEX IF NOT EXISTS idx_payments_lease ON rent_payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON rent_payments(status);

-- ============================================================
-- 3.6 SMART LEASE ASSISTANT & RENTAL LAW RAG
-- ============================================================

CREATE TABLE IF NOT EXISTS lease_extracted_text (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    full_text TEXT NOT NULL,
    extraction_method VARCHAR(50) DEFAULT 'gemini_vision',
    page_count SMALLINT,
    extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(lease_id)
);

CREATE TABLE IF NOT EXISTS rental_law_provisions (
    id SERIAL PRIMARY KEY,
    statute_id VARCHAR(50) NOT NULL,
    province VARCHAR(100) NOT NULL,
    law_name VARCHAR(255) NOT NULL,
    section_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    full_text TEXT NOT NULL,
    key_rules JSONB,
    embedding VECTOR(768),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rlp_province ON rental_law_provisions(province);
CREATE INDEX IF NOT EXISTS idx_rlp_category ON rental_law_provisions(category);
CREATE INDEX IF NOT EXISTS idx_rlp_statute ON rental_law_provisions(statute_id);

CREATE TABLE IF NOT EXISTS lease_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lease_chat_lease ON lease_chat_messages(lease_id);
CREATE INDEX IF NOT EXISTS idx_lease_chat_user ON lease_chat_messages(user_id);

CREATE TABLE IF NOT EXISTS lease_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    summary_type VARCHAR(50) NOT NULL,
    content JSONB NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    model_used VARCHAR(50),
    UNIQUE(lease_id, summary_type)
);

-- ============================================================
-- 3.7 DOCUMENT VERIFICATION
-- ============================================================

CREATE TABLE IF NOT EXISTS tenant_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES profiles(id),
    property_id UUID REFERENCES properties(id),
    document_type document_type NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    quality_check_passed BOOLEAN,
    quality_issues JSONB,
    extracted_data JSONB,
    extraction_confidence DECIMAL(5, 4),
    cross_ref_result JSONB,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id),
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_docs_tenant ON tenant_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_docs_property ON tenant_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_tenant_docs_status ON tenant_documents(verification_status);

-- ============================================================
-- 3.8 REAL-TIME CHAT
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    participant_1 UUID NOT NULL REFERENCES profiles(id),
    participant_2 UUID NOT NULL REFERENCES profiles(id),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(property_id, participant_1, participant_2)
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_p1 ON chat_rooms(participant_1);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_p2 ON chat_rooms(participant_2);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT,
    attachment_url TEXT,
    attachment_type VARCHAR(20),
    attachment_name VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(room_id, is_read) WHERE NOT is_read;

-- ============================================================
-- 3.9 APPLICANT TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    applicant_id UUID NOT NULL REFERENCES profiles(id),
    status application_status NOT NULL DEFAULT 'pending',
    employer VARCHAR(255),
    occupation VARCHAR(255),
    monthly_income DECIMAL(12, 2),
    move_in_date DATE,
    num_occupants SMALLINT DEFAULT 1,
    has_pets BOOLEAN DEFAULT FALSE,
    additional_notes TEXT,
    reference_name VARCHAR(255),
    reference_phone VARCHAR(20),
    reference_relation VARCHAR(100),
    match_score DECIMAL(5, 2),
    score_breakdown JSONB,
    reviewed_by UUID REFERENCES profiles(id),
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(property_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_property ON applications(property_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- ============================================================
-- 3.10 REVIEWS & RATINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    landlord_id UUID NOT NULL REFERENCES profiles(id),
    lease_id UUID REFERENCES leases(id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(lease_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_landlord ON reviews(landlord_id);

-- ============================================================
-- 3.11 DIGITAL COMPLIANCE VAULT
-- ============================================================

CREATE TABLE IF NOT EXISTS notice_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    content_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generated_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES notice_templates(id),
    lease_id UUID REFERENCES leases(id),
    generated_by UUID NOT NULL REFERENCES profiles(id),
    filled_content TEXT NOT NULL,
    pdf_url TEXT,
    sent_to UUID REFERENCES profiles(id),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS secure_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id),
    lease_id UUID REFERENCES leases(id),
    document_type document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_secure_docs_owner ON secure_documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_secure_docs_lease ON secure_documents(lease_id);

CREATE TABLE IF NOT EXISTS compliance_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    stamp_paper_purchased BOOLEAN DEFAULT FALSE,
    agreement_registered BOOLEAN DEFAULT FALSE,
    police_verification_done BOOLEAN DEFAULT FALSE,
    security_deposit_received BOOLEAN DEFAULT FALSE,
    cnic_copies_exchanged BOOLEAN DEFAULT FALSE,
    utility_transfer_done BOOLEAN DEFAULT FALSE,
    custom_items JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(lease_id)
);

-- ============================================================
-- 3.12 NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ============================================================
-- 3.13 AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
