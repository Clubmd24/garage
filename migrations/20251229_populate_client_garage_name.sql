UPDATE clients
   SET garage_name = (SELECT company_name FROM company_settings LIMIT 1)
 WHERE garage_name IS NULL OR garage_name='';
