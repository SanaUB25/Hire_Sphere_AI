-- ==========================================
-- HIRESPHERE AI - POSTGRESQL SCHEMA DESIGN
-- Normalized, Indexed, and Constraint-Enforced
-- ==========================================

-- Enable UUID extension for robust keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define custom ENUM types for rigid constraints
CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'admin');
CREATE TYPE application_status AS ENUM ('Applied', 'Shortlisted', 'Interview Scheduled', 'Hired', 'Rejected');
CREATE TYPE interview_status AS ENUM ('Scheduled', 'Completed', 'Cancelled');

-- 1. USERS TABLE (Core Credentials & Security)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'candidate',
    banned BOOLEAN NOT NULL DEFAULT FALSE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint to prevent empty email fields
    CONSTRAINT email_length CHECK (char_length(email) >= 5)
);

-- Indexing for instantaneous login queries
CREATE INDEX idx_users_email ON users(email);

-- 2. CANDIDATES TABLE (Candidate Profiles)
CREATE TABLE candidates (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    education TEXT,
    experience_years INTEGER DEFAULT 0,
    ats_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT exp_non_negative CHECK (experience_years >= 0),
    CONSTRAINT ats_bounds CHECK (ats_score >= 0 AND ats_score <= 100)
);

-- 3. EMPLOYERS TABLE (Company/Brand Profiles)
CREATE TABLE employers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    logo_emoji VARCHAR(2) DEFAULT '🏢',
    website VARCHAR(255),
    industry VARCHAR(100),
    team_size VARCHAR(50),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. JOBS TABLE (Open Role Postings)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    salary VARCHAR(100) NOT NULL,
    deadline DATE NOT NULL,
    experience VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    remote BOOLEAN NOT NULL DEFAULT TRUE,
    views INTEGER DEFAULT 0,
    engagement INTEGER DEFAULT 0,
    is_fake BOOLEAN NOT NULL DEFAULT FALSE,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT views_positive CHECK (views >= 0),
    CONSTRAINT engagement_bounds CHECK (engagement >= 0 AND engagement <= 100)
);

-- Indexing for search optimization & foreign key constraints
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_jobs_is_fake ON jobs(is_fake);

-- 5. SKILLS TABLE (Core Keyword Dictionary)
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE INDEX idx_skills_name ON skills(name);

-- Many-to-Many: Candidate Skills Relation
CREATE TABLE candidate_skills (
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (candidate_id, skill_id)
);

-- Many-to-Many: Job Skills Requirement Relation
CREATE TABLE job_skills (
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- 6. APPLICATIONS TABLE (Job Submissions & AI Analysis metrics)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'Applied',
    match_score INTEGER DEFAULT 0,
    resume_quality INTEGER DEFAULT 0,
    skill_match INTEGER DEFAULT 0,
    experience_score INTEGER DEFAULT 0,
    ats_score INTEGER DEFAULT 0,
    resume_summary TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure matching percentages lie within correct boundaries
    CONSTRAINT match_score_bounds CHECK (match_score >= 0 AND match_score <= 100),
    CONSTRAINT ats_bounds CHECK (ats_score >= 0 AND ats_score <= 100),
    
    -- Prevent duplicate applications to the exact same position
    UNIQUE (candidate_id, job_id)
);

CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_match_score ON applications(match_score);

-- Many-to-Many: Saved Jobs (Bookmarked listings)
CREATE TABLE saved_jobs (
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (candidate_id, job_id)
);

-- 7. INTERVIEWS TABLE (Virtual Meetings Scheduler)
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    link VARCHAR(255) NOT NULL,
    status interview_status NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);

-- 8. NOTIFICATIONS TABLE (Ecosystem Triggers)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- 9. REPORTS TABLE (Abuse & Moderation Flags)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_resolved ON reports(resolved);

-- 10. SYSTEM ACTIVITY LOGS TABLE (Sandbox Audit Monitor)
CREATE TABLE system_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- ADVANCED DATABASE VIEWS & TRIGGERS
-- ==========================================

-- A. VIEW: Aggregate Analytics Summary for Employers
CREATE VIEW employer_analytics_summary AS
SELECT 
    e.id AS employer_id,
    e.company_name,
    COUNT(DISTINCT j.id) AS total_jobs_posted,
    COALESCE(SUM(j.views), 0) AS total_job_views,
    COUNT(DISTINCT a.id) AS total_applications_received,
    ROUND(
        (COUNT(DISTINCT CASE WHEN a.status = 'Hired' THEN a.id END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT a.id), 0)) * 100, 2
    ) AS hiring_rate_percentage
FROM employers e
LEFT JOIN jobs j ON e.id = j.company_id
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY e.id, e.company_name;


-- B. AUDIT TRIGGER FUNCTION: Automatically logs database actions to the system log
CREATE OR REPLACE FUNCTION log_ecosystem_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO system_activity_logs (user_email, action, details)
        VALUES (
            'system_trigger@hiresphere.ai',
            TG_TABLE_NAME || '_CREATED',
            'New record created with ID: ' || NEW.id::text
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO system_activity_logs (user_email, action, details)
        VALUES (
            'system_trigger@hiresphere.ai',
            TG_TABLE_NAME || '_UPDATED',
            'Record ID: ' || NEW.id::text || ' updated'
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO system_activity_logs (user_email, action, details)
        VALUES (
            'system_trigger@hiresphere.ai',
            TG_TABLE_NAME || '_DELETED',
            'Record deleted'
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply logging triggers to core operations tables
CREATE TRIGGER trigger_log_jobs
AFTER INSERT OR UPDATE OR DELETE ON jobs
FOR EACH ROW EXECUTE FUNCTION log_ecosystem_activity();

CREATE TRIGGER trigger_log_applications
AFTER INSERT OR UPDATE OR DELETE ON applications
FOR EACH ROW EXECUTE FUNCTION log_ecosystem_activity();

CREATE TRIGGER trigger_log_reports
AFTER INSERT OR UPDATE OR DELETE ON reports
FOR EACH ROW EXECUTE FUNCTION log_ecosystem_activity();


-- ====================================================
-- SUPABASE POSTGRESQL ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

-- Enable RLS on core user and operational tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 1. USERS POLICIES
CREATE POLICY users_self_read ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_admin_all ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 2. CANDIDATES POLICIES
CREATE POLICY candidates_self_manage ON candidates FOR ALL USING (auth.uid() = id);
CREATE POLICY candidates_employers_read ON candidates FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'employer')
);

-- 3. EMPLOYERS POLICIES
CREATE POLICY employers_all_read ON employers FOR SELECT USING (TRUE);
CREATE POLICY employers_self_manage ON employers FOR ALL USING (auth.uid() = id);

-- 4. JOBS POLICIES
CREATE POLICY jobs_public_read ON jobs FOR SELECT USING (is_fake = FALSE);
CREATE POLICY jobs_employer_manage ON jobs FOR ALL USING (
  company_id = auth.uid() AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'employer')
);

-- 5. APPLICATIONS POLICIES
CREATE POLICY applications_candidate_manage ON applications FOR ALL USING (candidate_id = auth.uid());
CREATE POLICY applications_employer_read ON applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_id AND jobs.company_id = auth.uid()
  )
);

-- 6. SAVED JOBS POLICIES
CREATE POLICY saved_jobs_self_manage ON saved_jobs FOR ALL USING (candidate_id = auth.uid());

-- 7. INTERVIEWS POLICIES
CREATE POLICY interviews_candidate_read ON interviews FOR SELECT USING (candidate_id = auth.uid());
CREATE POLICY interviews_employer_manage ON interviews FOR ALL USING (interviewer_id = auth.uid());

-- 8. NOTIFICATIONS POLICIES
CREATE POLICY notifications_self_manage ON notifications FOR ALL USING (user_id = auth.uid());

-- 9. REPORTS POLICIES
CREATE POLICY reports_admin_all ON reports FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY reports_candidate_insert ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid());
