-- Sample Data for Profiles
INSERT INTO profiles (id, email, name, gender, marital_status, height, weight, colour, birth, professional, family, astro, profile_img, created_on)
VALUES 
(
    '00000000-0000-0000-0000-000000000001', 
    'sample.groom@example.com', 
    'Rajesh Kumar', 
    'Male', 
    'Never Married', 
    '5 ft 10 in', 
    '75 kg', 
    'Fair', 
    '{"dob": "15/06/1992", "time": "10:30 AM", "day": "Monday", "place": "Chennai"}',
    '{"work_status": "Software Engineer", "education": "B.Tech IT", "job": "Senior Dev", "income": "18 LPA", "location": "Bangalore"}',
    '{"father_name": "Arun", "mother_name": "Lakshmi", "father_job": "Retired", "mother_job": "Homemaker", "father_alive": "Yes", "mother_alive": "Yes", "poorvigam": "Madurai", "gothram": "Siva", "kuladeivam": "Meenakshi", "brothers": 1, "sisters": 0, "married_brothers": 0, "married_sisters": 0, "mobile": "9876543210", "address": "123, Anna Nagar, Chennai"}',
    '{"tamil_year": "Angirasa", "tamil_month": "Ani", "tamil_date": "01", "rasi": "Viruchigam", "nakshatram": "Anusham", "patham": "2", "lagnam": "Simmam", "desai": "Guru", "desai_year": "5", "desai_month": "2", "desai_date": "10", "img": "https://pceisunmvyykvjrvidmv.supabase.co/storage/v1/object/public/astro_images/sample_horoscope.png"}',
    ARRAY['https://pceisunmvyykvjrvidmv.supabase.co/storage/v1/object/public/profile_images/sample_groom.png'],
    NOW()
),
(
    '00000000-0000-0000-0000-000000000002', 
    'sample.bride@example.com', 
    'Priya Mani', 
    'Female', 
    'Never Married', 
    '5 ft 4 in', 
    '58 kg', 
    'Wheatish', 
    '{"dob": "22/08/1995", "time": "04:15 PM", "day": "Tuesday", "place": "Coimbatore"}',
    '{"work_status": "Data Scientist", "education": "MS Data Science", "job": "Lead Analyst", "income": "15 LPA", "location": "Chennai"}',
    '{"father_name": "Mani", "mother_name": "Saraswathi", "father_job": "Business", "mother_job": "Teacher", "father_alive": "Yes", "mother_alive": "Yes", "poorvigam": "Trichy", "gothram": "Vishnu", "kuladeivam": "Kamakshi", "brothers": 0, "sisters": 1, "married_brothers": 0, "married_sisters": 1, "mobile": "9876543211", "address": "45, RS Puram, Coimbatore"}',
    '{"tamil_year": "Yuva", "tamil_month": "Avani", "tamil_date": "06", "rasi": "Mishabam", "nakshatram": "Rohini", "patham": "3", "lagnam": "Kanni", "desai": "Sani", "desai_year": "12", "desai_month": "4", "desai_date": "15", "img": "https://pceisunmvyykvjrvidmv.supabase.co/storage/v1/object/public/astro_images/sample_horoscope.png"}',
    ARRAY['https://pceisunmvyykvjrvidmv.supabase.co/storage/v1/object/public/profile_images/sample_bride.png'],
    NOW()
);
