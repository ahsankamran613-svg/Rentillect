-- ============================================================
-- Migration 004: Expand property_type ENUM for distinct Pakistani types
-- ============================================================
-- Run this in your Supabase SQL Editor:

ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'upper_portion';
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'lower_portion';
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'farm_house';
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'penthouse';
