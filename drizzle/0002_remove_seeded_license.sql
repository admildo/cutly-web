-- The initial development migration accidentally granted a permanent license
-- to a hard-coded Clerk account. Keep no implicit production entitlement.
DELETE FROM `licenses`
WHERE `id` = 'license_seed_user_3J8698e9lr93z4rWuRWEOR183dL';
