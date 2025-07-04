-- Database Seed Data for Pixora Craftt
-- This script inserts initial data for development and demo purposes

-- =============================================
-- INSERT INITIAL ADMIN USER
-- =============================================

-- Insert admin user (password: admin123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_verified, is_active)
VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'admin@pixoracraftt.com',
        '$2b$10$rOHZB1z1lZTsJcf5K6H7QeF5T.1dR5.1X9Y8J6H.K.5X9Y8J6H.K.',
        'Admin',
        'User',
        'admin',
        TRUE,
        TRUE
    ),
    (
        '550e8400-e29b-41d4-a716-446655440001',
        'cms@pixoracraftt.com',
        '$2b$10$rOHZB1z1lZTsJcf5K6H7QeF5T.1dR5.1X9Y8J6H.K.5X9Y8J6H.K.',
        'CMS',
        'Manager',
        'cms_manager',
        TRUE,
        TRUE
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002',
        'demo@pixoracraftt.com',
        '$2b$10$rOHZB1z1lZTsJcf5K6H7QeF5T.1dR5.1X9Y8J6H.K.5X9Y8J6H.K.',
        'Demo',
        'User',
        'user',
        TRUE,
        TRUE
    )
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- INSERT SAMPLE SERVICES
-- =============================================

INSERT INTO services (id, title, description, features, icon, color, case_study_link, display_order)
VALUES
    (
        '660e8400-e29b-41d4-a716-446655440000',
        'Web Development',
        'Custom websites built with modern technologies that are fast, responsive, and optimized for search engines.',
        '["Responsive design for all devices", "SEO-optimized code structure", "Fast loading speeds", "Secure and scalable architecture", "Modern JavaScript frameworks", "Progressive Web Apps (PWA)"]',
        'code',
        'bg-slack-green',
        '#',
        1
    ),
    (
        '660e8400-e29b-41d4-a716-446655440001',
        'UI/UX Design',
        'Intuitive and engaging user experiences that guide visitors through your digital products with ease.',
        '["User-centered design approach", "Intuitive navigation systems", "Visually appealing interfaces", "Conversion-focused layouts", "Accessibility compliance", "Design system creation"]',
        'palette',
        'bg-slack-yellow',
        '#',
        2
    ),
    (
        '660e8400-e29b-41d4-a716-446655440002',
        'Social Media Marketing',
        'Strategic social media campaigns that increase brand awareness and drive engagement with your target audience.',
        '["Platform-specific content strategies", "Community engagement tactics", "Performance analytics and reporting", "Paid advertising management", "Influencer partnerships", "Brand voice development"]',
        'megaphone',
        'bg-pixora-500',
        '#',
        3
    ),
    (
        '660e8400-e29b-41d4-a716-446655440003',
        'E-Commerce Solutions',
        'Complete e-commerce platforms with payment integration, inventory management, and customer analytics.',
        '["Secure payment processing", "Inventory management", "Customer analytics", "Mobile-optimized checkout", "Multi-currency support", "Third-party integrations"]',
        'shopping-cart',
        'bg-blue-500',
        '#',
        4
    ),
    (
        '660e8400-e29b-41d4-a716-446655440004',
        'Digital Strategy',
        'Comprehensive digital transformation strategies to modernize your business and reach new customers.',
        '["Market analysis", "Competitive research", "Digital roadmapping", "Technology consulting", "ROI optimization", "Performance monitoring"]',
        'chart-line',
        'bg-purple-500',
        '#',
        5
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INSERT SAMPLE PROJECTS
-- =============================================

INSERT INTO projects (id, title, category, description, full_description, image, tags, client_name, project_url, display_order)
VALUES
    (
        '770e8400-e29b-41d4-a716-446655440000',
        'E-Commerce Website Redesign',
        'web',
        'Complete redesign and development of an e-commerce platform with custom shopping cart and payment integration.',
        'This project involved a complete overhaul of an outdated e-commerce platform. We implemented a modern React frontend with a Node.js backend, integrated Stripe for secure payments, and ensured the site was fully responsive across all devices. The new platform increased conversion rates by 150% and reduced cart abandonment by 40%.',
        'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80',
        '["React", "Node.js", "Stripe", "Responsive", "MongoDB", "Express"]',
        'Fashion Forward Inc.',
        '#',
        1
    ),
    (
        '770e8400-e29b-41d4-a716-446655440001',
        'Mobile Banking App UI',
        'uiux',
        'User interface and experience design for a mobile banking application with advanced security features.',
        'We created a comprehensive UI/UX design for a mobile banking application, focusing on security, usability, and accessibility. The design included biometric authentication, intuitive money transfer flows, and real-time transaction monitoring. User testing showed a 95% satisfaction rate.',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
        '["Figma", "UI Design", "Mobile", "Prototyping", "Security", "Accessibility"]',
        'SecureBank Digital',
        '#',
        2
    ),
    (
        '770e8400-e29b-41d4-a716-446655440002',
        'Tech Startup Brand Campaign',
        'social',
        'Social media marketing campaign for a tech startup launch, resulting in 500% follower growth.',
        'We developed and executed a comprehensive social media strategy for a tech startup''s product launch. The campaign included content creation, influencer partnerships, and targeted advertising across multiple platforms. Results exceeded expectations with 500% follower growth and 200% increase in website traffic.',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        '["Social Media", "Content Creation", "Influencer Marketing", "Analytics", "Brand Strategy"]',
        'InnovateTech Solutions',
        '#',
        3
    ),
    (
        '770e8400-e29b-41d4-a716-446655440003',
        'Restaurant Management System',
        'web',
        'Full-stack web application for restaurant management including orders, inventory, and staff scheduling.',
        'Developed a comprehensive restaurant management system with real-time order tracking, inventory management, staff scheduling, and analytics dashboard. The system integrated with POS systems and reduced operational costs by 30%.',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        '["Vue.js", "Python", "Django", "PostgreSQL", "Real-time", "Analytics"]',
        'Bella Vista Restaurant Group',
        '#',
        4
    ),
    (
        '770e8400-e29b-41d4-a716-446655440004',
        'Healthcare App Design',
        'uiux',
        'Patient portal design for a healthcare provider with appointment scheduling and medical records access.',
        'Designed a patient-centered mobile application that allows users to schedule appointments, access medical records, and communicate with healthcare providers. The design prioritized accessibility and HIPAA compliance while maintaining an intuitive user experience.',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80',
        '["Healthcare", "Mobile Design", "Accessibility", "HIPAA", "User Research"]',
        'HealthCare Partners',
        '#',
        5
    ),
    (
        '770e8400-e29b-41d4-a716-446655440005',
        'SaaS Platform Growth Campaign',
        'social',
        'B2B social media strategy for a SaaS platform, achieving 300% lead generation increase.',
        'Implemented a comprehensive B2B social media strategy focusing on LinkedIn and industry-specific platforms. Created thought leadership content, managed webinar promotions, and executed targeted LinkedIn campaigns that resulted in 300% increase in qualified leads.',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
        '["B2B Marketing", "LinkedIn", "Lead Generation", "Content Strategy", "Webinars"]',
        'CloudSync Solutions',
        '#',
        6
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INSERT SAMPLE TESTIMONIALS
-- =============================================

INSERT INTO testimonials (id, name, role, company, content, avatar, rating, display_order)
VALUES
    (
        '880e8400-e29b-41d4-a716-446655440000',
        'Sarah Johnson',
        'Marketing Director',
        'TechCorp Inc.',
        'Pixora Craftt transformed our digital presence completely. Their attention to detail and innovative approach exceeded our expectations. The team was professional, responsive, and delivered on time.',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        5,
        1
    ),
    (
        '880e8400-e29b-41d4-a716-446655440001',
        'Michael Chen',
        'CEO',
        'StartupXYZ',
        'The team at Pixora Craftt delivered exceptional results. Our website traffic increased by 300% after the redesign, and our conversion rates have never been better. Highly recommend their services.',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
        5,
        2
    ),
    (
        '880e8400-e29b-41d4-a716-446655440002',
        'Emily Rodriguez',
        'Product Manager',
        'InnovateLabs',
        'Working with Pixora Craftt was a game-changer for our product. Their UI/UX expertise helped us create an intuitive interface that our users love. The project was completed ahead of schedule.',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
        5,
        3
    ),
    (
        '880e8400-e29b-41d4-a716-446655440003',
        'David Thompson',
        'Operations Director',
        'RetailMax',
        'The e-commerce solution provided by Pixora Craftt has streamlined our operations significantly. Sales have increased by 150% since the platform went live. Excellent technical support and ongoing maintenance.',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        5,
        4
    ),
    (
        '880e8400-e29b-41d4-a716-446655440004',
        'Jessica Martinez',
        'Brand Manager',
        'LifestyleBrands Co.',
        'The social media campaign created by Pixora Craftt helped us reach our target audience effectively. Our brand awareness increased dramatically, and we saw a 400% increase in social engagement.',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=jessica',
        5,
        5
    ),
    (
        '880e8400-e29b-41d4-a716-446655440005',
        'Robert Kim',
        'CTO',
        'FinTech Solutions',
        'Pixora Craftt''s technical expertise is outstanding. They helped us modernize our legacy systems and implement new technologies that improved our performance by 200%. Professional and reliable team.',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
        5,
        6
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- INSERT SAMPLE ANALYTICS DATA
-- =============================================

INSERT INTO analytics (type, data, created_at)
VALUES
    ('page_view', '{"page": "/", "referrer": "google.com", "duration": 45}', NOW() - INTERVAL '1 day'),
    ('page_view', '{"page": "/services", "referrer": "direct", "duration": 120}', NOW() - INTERVAL '1 day'),
    ('page_view', '{"page": "/projects", "referrer": "linkedin.com", "duration": 90}', NOW() - INTERVAL '2 days'),
    ('contact_form', '{"serviceType": "web", "projectSize": 75, "urgency": "normal"}', NOW() - INTERVAL '3 days'),
    ('project_view', '{"projectId": "770e8400-e29b-41d4-a716-446655440000", "category": "web"}', NOW() - INTERVAL '1 hour'),
    ('service_inquiry', '{"serviceId": "660e8400-e29b-41d4-a716-446655440000", "action": "view_details"}', NOW() - INTERVAL '2 hours');

-- =============================================
-- INSERT SAMPLE SYSTEM LOGS
-- =============================================

INSERT INTO system_logs (level, message, service, data)
VALUES
    ('info', 'Service started successfully', 'api-gateway', '{"port": 4000}'),
    ('info', 'Database connection established', 'auth-service', '{"database": "postgresql"}'),
    ('info', 'User authenticated successfully', 'auth-service', '{"userId": "550e8400-e29b-41d4-a716-446655440000"}'),
    ('info', 'Content retrieved from CMS', 'cms-service', '{"type": "services", "count": 5}'),
    ('warn', 'Rate limit exceeded for IP', 'api-gateway', '{"ip": "192.168.1.100", "endpoint": "/api/contact"}'),
    ('info', 'Analytics event tracked', 'admin-service', '{"type": "page_view", "page": "/"}') 