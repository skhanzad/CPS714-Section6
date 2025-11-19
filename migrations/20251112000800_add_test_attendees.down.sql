-- Remove test users from all events
DELETE FROM attendees 
WHERE email IN (
  'sayeed.ahmed@torontomu.ca',
  'harnoor.boparai@torontomu.ca',
  'woosung.kim@torontomu.ca',
  'andrew.sudyk@torontomu.ca'
);

