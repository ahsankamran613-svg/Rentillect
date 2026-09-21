-- ============================================================
-- RENTILLECT: Pakistan Cities & Areas Seed Data
-- ============================================================

INSERT INTO cities (name, province) VALUES
    ('Islamabad', 'Islamabad Capital Territory'),
    ('Rawalpindi', 'Punjab'),
    ('Lahore', 'Punjab'),
    ('Karachi', 'Sindh'),
    ('Peshawar', 'Khyber Pakhtunkhwa'),
    ('Quetta', 'Balochistan'),
    ('Faisalabad', 'Punjab'),
    ('Multan', 'Punjab')
ON CONFLICT (name) DO NOTHING;

-- Areas for Islamabad
WITH c AS (SELECT id FROM cities WHERE name = 'Islamabad')
INSERT INTO areas (city_id, name)
SELECT c.id, area_name FROM c, (VALUES
    ('F-6'), ('F-7'), ('F-8'), ('F-10'), ('F-11'),
    ('E-7'), ('E-11'),
    ('G-6'), ('G-7'), ('G-8'), ('G-9'), ('G-10'), ('G-11'), ('G-13'), ('G-14'),
    ('I-8'), ('I-9'), ('I-10'),
    ('DHA Phase 2'), ('Bahria Town'), ('Bani Gala'), ('Gulberg Greens')
) AS a(area_name)
ON CONFLICT (city_id, name) DO NOTHING;

-- Areas for Lahore
WITH c AS (SELECT id FROM cities WHERE name = 'Lahore')
INSERT INTO areas (city_id, name)
SELECT c.id, area_name FROM c, (VALUES
    ('DHA Phase 1'), ('DHA Phase 3'), ('DHA Phase 5'), ('DHA Phase 6'), ('DHA Phase 8'),
    ('Gulberg II'), ('Gulberg III'),
    ('Model Town'), ('Johar Town'), ('Bahria Town'), ('Wapda Town'),
    ('Cantt'), ('Garden Town'), ('Faisal Town'), ('Askari 10'), ('Askari 11')
) AS a(area_name)
ON CONFLICT (city_id, name) DO NOTHING;

-- Areas for Karachi
WITH c AS (SELECT id FROM cities WHERE name = 'Karachi')
INSERT INTO areas (city_id, name)
SELECT c.id, area_name FROM c, (VALUES
    ('DHA Phase 5'), ('DHA Phase 6'), ('DHA Phase 8'),
    ('Clifton Block 2'), ('Clifton Block 4'), ('Clifton Block 5'),
    ('Gulshan-e-Iqbal'), ('Gulistan-e-Johar'), ('North Nazimabad'),
    ('PECHS'), ('Bahria Town Karachi'), ('Malir Cantt')
) AS a(area_name)
ON CONFLICT (city_id, name) DO NOTHING;

-- Areas for Rawalpindi
WITH c AS (SELECT id FROM cities WHERE name = 'Rawalpindi')
INSERT INTO areas (city_id, name)
SELECT c.id, area_name FROM c, (VALUES
    ('Bahria Town Phase 1-6'), ('Bahria Town Phase 7-8'),
    ('DHA Phase 1'),
    ('Saddar'), ('Chaklala Scheme 3'), ('Westridge'),
    ('Satellite Town'), ('Askari 14')
) AS a(area_name)
ON CONFLICT (city_id, name) DO NOTHING;
