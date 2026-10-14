-- Roller ve izinler (spatie/laravel-permission + Filament Shield düzeni). Veri-yalnız ve yinelenebilir.

INSERT OR IGNORE INTO roles (name, guard_name, created_at, updated_at) VALUES
    ('admin', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('operator', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('support', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('finance', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('content', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('viewer', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('customer', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

WITH actions(action) AS (VALUES ('ViewAny'), ('View'), ('Create'), ('Update'), ('Delete'), ('DeleteAny')),
     resources(resource) AS (VALUES ('Usta'), ('SorunSablonu'), ('Musteri'), ('IsEmri'), ('UstaBasvuru'), ('Sikayet'), ('YorumModerasyon'), ('Odeme'), ('FiyatKurali'), ('EslestirmeAgirliklari'), ('ContactMessage'), ('ContentPage'), ('AuditLog'), ('User'), ('Role'), ('Permission'))
INSERT OR IGNORE INTO permissions (name, guard_name, created_at, updated_at)
SELECT action || ':' || resource, 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now') FROM actions, resources;

INSERT OR IGNORE INTO permissions (name, guard_name, created_at, updated_at) VALUES
    ('Cancel:IsEmri', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('Publish:FiyatKurali', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('Publish:EslestirmeAgirliklari', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ('Reveal:PII', 'web', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

-- operator
INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id FROM permissions p JOIN roles r ON r.name = 'operator' AND r.guard_name = 'web'
WHERE p.guard_name = 'web' AND p.name IN (
    'ViewAny:IsEmri', 'View:IsEmri', 'Create:IsEmri', 'Update:IsEmri',
    'Delete:IsEmri', 'DeleteAny:IsEmri', 'ViewAny:Usta', 'View:Usta',
    'Create:Usta', 'Update:Usta', 'Delete:Usta', 'DeleteAny:Usta',
    'ViewAny:UstaBasvuru', 'View:UstaBasvuru', 'Create:UstaBasvuru', 'Update:UstaBasvuru',
    'Delete:UstaBasvuru', 'DeleteAny:UstaBasvuru', 'ViewAny:Sikayet', 'View:Sikayet',
    'Create:Sikayet', 'Update:Sikayet', 'Delete:Sikayet', 'DeleteAny:Sikayet',
    'ViewAny:YorumModerasyon', 'View:YorumModerasyon', 'Create:YorumModerasyon', 'Update:YorumModerasyon',
    'Delete:YorumModerasyon', 'DeleteAny:YorumModerasyon', 'ViewAny:Musteri', 'View:Musteri',
    'ViewAny:SorunSablonu', 'View:SorunSablonu', 'Cancel:IsEmri'
);

-- support
INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id FROM permissions p JOIN roles r ON r.name = 'support' AND r.guard_name = 'web'
WHERE p.guard_name = 'web' AND p.name IN (
    'ViewAny:ContactMessage', 'View:ContactMessage', 'Create:ContactMessage', 'Update:ContactMessage',
    'Delete:ContactMessage', 'DeleteAny:ContactMessage', 'ViewAny:Sikayet', 'View:Sikayet',
    'Create:Sikayet', 'Update:Sikayet', 'Delete:Sikayet', 'DeleteAny:Sikayet',
    'ViewAny:IsEmri', 'View:IsEmri', 'ViewAny:Musteri', 'View:Musteri'
);

-- finance
INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id FROM permissions p JOIN roles r ON r.name = 'finance' AND r.guard_name = 'web'
WHERE p.guard_name = 'web' AND p.name IN (
    'ViewAny:Odeme', 'View:Odeme', 'Create:Odeme', 'Update:Odeme',
    'Delete:Odeme', 'DeleteAny:Odeme', 'ViewAny:IsEmri', 'View:IsEmri',
    'ViewAny:Usta', 'View:Usta'
);

-- content
INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id FROM permissions p JOIN roles r ON r.name = 'content' AND r.guard_name = 'web'
WHERE p.guard_name = 'web' AND p.name IN (
    'ViewAny:ContentPage', 'View:ContentPage', 'Create:ContentPage', 'Update:ContentPage',
    'Delete:ContentPage', 'DeleteAny:ContentPage'
);

-- viewer
INSERT OR IGNORE INTO role_has_permissions (permission_id, role_id)
SELECT p.id, r.id FROM permissions p JOIN roles r ON r.name = 'viewer' AND r.guard_name = 'web'
WHERE p.guard_name = 'web' AND p.name IN (
    'ViewAny:Usta', 'View:Usta', 'ViewAny:SorunSablonu', 'View:SorunSablonu',
    'ViewAny:Musteri', 'View:Musteri', 'ViewAny:IsEmri', 'View:IsEmri',
    'ViewAny:UstaBasvuru', 'View:UstaBasvuru', 'ViewAny:Sikayet', 'View:Sikayet',
    'ViewAny:YorumModerasyon', 'View:YorumModerasyon', 'ViewAny:Odeme', 'View:Odeme',
    'ViewAny:FiyatKurali', 'View:FiyatKurali', 'ViewAny:EslestirmeAgirliklari', 'View:EslestirmeAgirliklari',
    'ViewAny:ContactMessage', 'View:ContactMessage', 'ViewAny:ContentPage', 'View:ContentPage'
);
